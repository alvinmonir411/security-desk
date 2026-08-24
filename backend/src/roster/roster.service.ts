import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RosterEngine, LocationShiftRequirementInput } from './roster.engine';
import { GuardAvailabilityInput, ComputedGuardAvailability } from './algorithms/availability.calculator';
import { RosterStatus, AssignmentStatus, LeaveStatus } from '@prisma/client';
import { ReassignGuardDto } from './dto/roster.dto';

@Injectable()
export class RosterService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates or Regenerates a deterministic roster for a given target date
   */
  async generateRoster(dateStr: string, requestedById?: string) {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    // 1. Fetch Dynamic Location Requirements for target date
    const requirementsDb = await this.prisma.locationRequirement.findMany({
      where: { date: targetDate },
      include: { location: true, shift: true },
    });

    if (requirementsDb.length === 0) {
      throw new BadRequestException(`No location requirements configured for date: ${dateStr}. Please configure requirements first.`);
    }

    const requirementsInput: LocationShiftRequirementInput[] = requirementsDb.map((r) => ({
      locationId: r.locationId,
      locationName: r.location.name,
      shiftId: r.shiftId,
      shiftName: r.shift.name,
      requiredGuards: r.requiredGuards,
    }));

    // 2. Fetch All Active Guards and their past 6 days duty history
    const allGuards = await this.prisma.securityGuard.findMany({
      include: {
        user: true,
      },
    });

    // Date range for past 6 days
    const past6DaysStart = new Date(targetDate);
    past6DaysStart.setDate(targetDate.getDate() - 6);

    const pastAssignments = await this.prisma.rosterAssignment.findMany({
      where: {
        date: {
          gte: past6DaysStart,
          lt: targetDate,
        },
      },
    });

    // Fetch approved leaves on target date
    const approvedLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        status: LeaveStatus.APPROVED,
        startDate: { lte: targetDate },
        endDate: { gte: targetDate },
      },
    });
    const leaveGuardIds = new Set(approvedLeaves.map((l) => l.guardId));

    // Construct GuardAvailabilityInput for RosterEngine
    const guardsInput: GuardAvailabilityInput[] = allGuards.map((g) => {
      const history = [];
      for (let d = 6; d >= 1; d--) {
        const checkDate = new Date(targetDate);
        checkDate.setDate(targetDate.getDate() - d);
        const hasDuty = pastAssignments.some(
          (a) => a.guardId === g.id && a.date.toDateString() === checkDate.toDateString()
        );
        history.push({ date: checkDate, hasDuty });
      }

      return {
        guardId: g.id,
        badgeNumber: g.badgeNumber,
        fullName: g.user.fullName,
        status: g.status,
        defaultLocationId: g.defaultLocationId,
        accumulatedDutyHours: g.accumulatedDutyHours,
        past6DaysHistory: history,
        hasApprovedLeaveOnDate: leaveGuardIds.has(g.id),
        hasExistingAssignmentOnDate: false,
      };
    });

    // 3. Run Deterministic Algorithm
    const result = RosterEngine.generate(targetDate, guardsInput, requirementsInput);

    // 4. Atomically persist generated roster in DB transaction
    const savedRoster = await this.prisma.$transaction(async (tx) => {
      // Upsert Roster Header
      const roster = await tx.roster.upsert({
        where: { date: targetDate },
        update: {
          status: RosterStatus.GENERATED,
          totalRequired: result.totalRequired,
          totalAssigned: result.totalAssigned,
          totalShortage: result.totalShortage,
        },
        create: {
          date: targetDate,
          status: RosterStatus.GENERATED,
          totalRequired: result.totalRequired,
          totalAssigned: result.totalAssigned,
          totalShortage: result.totalShortage,
        },
      });

      // Clear existing draft assignments for this roster if regenerating
      await tx.rosterAssignment.deleteMany({
        where: { rosterId: roster.id },
      });

      // Insert new generated assignments
      if (result.assignments.length > 0) {
        await tx.rosterAssignment.createMany({
          data: result.assignments.map((a) => ({
            rosterId: roster.id,
            guardId: a.guardId,
            locationId: a.locationId,
            shiftId: a.shiftId,
            date: targetDate,
            status: AssignmentStatus.SCHEDULED,
            isOverride: a.isOverride,
          })),
        });
      }

      // Log Audit Event
      await tx.auditLog.create({
        data: {
          userId: requestedById,
          action: 'ROSTER_GENERATE',
          entity: 'Roster',
          entityId: roster.id,
          newValue: {
            date: dateStr,
            totalRequired: result.totalRequired,
            totalAssigned: result.totalAssigned,
            totalShortage: result.totalShortage,
            totalReserve: result.totalReserve,
          },
          reason: 'Automated deterministic roster generation cycle',
        },
      });

      return roster;
    });

    return {
      roster: savedRoster,
      metrics: {
        totalRequired: result.totalRequired,
        totalAssigned: result.totalAssigned,
        totalShortage: result.totalShortage,
        totalAvailable: result.totalAvailable,
        totalWeeklyOff: result.totalWeeklyOff,
        totalOnLeave: result.totalOnLeave,
        totalReserve: result.totalReserve,
      },
      shortages: result.shortages,
      reserveGuards: result.reserveGuards,
      offGuards: result.offGuards,
      leaveGuards: result.leaveGuards,
    };
  }

  /**
   * Fetch complete roster details for a given date
   */
  async getRosterByDate(dateStr: string) {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    const roster = await this.prisma.roster.findUnique({
      where: { date: targetDate },
      include: {
        assignments: {
          include: {
            guard: { include: { user: true } },
            location: true,
            shift: true,
            post: true,
          },
        },
      },
    });

    const requirements = await this.prisma.locationRequirement.findMany({
      where: { date: targetDate },
      include: { location: true, shift: true },
    });

    return {
      roster,
      requirements,
    };
  }

  /**
   * Reassign a guard manually with optional override authorization
   */
  async reassignGuard(rosterId: string, dto: ReassignGuardDto, managerId?: string) {
    const roster = await this.prisma.roster.findUnique({ where: { id: rosterId } });
    if (!roster) throw new NotFoundException('Roster not found');
    if (roster.status === RosterStatus.LOCKED) {
      throw new BadRequestException('Cannot reassign guard. Roster is locked.');
    }

    const guard = await this.prisma.securityGuard.findUnique({
      where: { id: dto.guardId },
      include: { user: true },
    });
    if (!guard) throw new NotFoundException('Guard not found');

    return this.prisma.$transaction(async (tx) => {
      // Upsert assignment for this guard on this date
      const assignment = await tx.rosterAssignment.upsert({
        where: {
          guardId_date: {
            guardId: dto.guardId,
            date: roster.date,
          },
        },
        update: {
          locationId: dto.targetLocationId,
          shiftId: dto.targetShiftId,
          postId: dto.targetPostId || null,
          isOverride: dto.isOverride || false,
          overrideReason: dto.overrideReason || null,
        },
        create: {
          rosterId: roster.id,
          guardId: dto.guardId,
          locationId: dto.targetLocationId,
          shiftId: dto.targetShiftId,
          postId: dto.targetPostId || null,
          date: roster.date,
          status: AssignmentStatus.SCHEDULED,
          isOverride: dto.isOverride || false,
          overrideReason: dto.overrideReason || null,
        },
      });

      // Audit log entry
      await tx.auditLog.create({
        data: {
          userId: managerId,
          action: dto.isOverride ? 'OVERRIDE_REASSIGN' : 'MANUAL_REASSIGN',
          entity: 'RosterAssignment',
          entityId: assignment.id,
          newValue: {
            guardId: dto.guardId,
            guardName: guard.user.fullName,
            targetLocationId: dto.targetLocationId,
            targetShiftId: dto.targetShiftId,
            isOverride: dto.isOverride,
            reason: dto.overrideReason,
          },
          reason: dto.overrideReason || 'Manual manager reassignment',
        },
      });

      return assignment;
    });
  }

  /**
   * Update Roster Status (e.g. APPROVED -> PUBLISHED -> LOCKED)
   */
  async updateStatus(rosterId: string, status: RosterStatus, userId?: string) {
    const updated = await this.prisma.roster.update({
      where: { id: rosterId },
      data: {
        status,
        publishedAt: status === RosterStatus.PUBLISHED ? new Date() : undefined,
        publishedById: status === RosterStatus.PUBLISHED ? userId : undefined,
        lockedAt: status === RosterStatus.LOCKED ? new Date() : undefined,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: `ROSTER_STATUS_${status}`,
        entity: 'Roster',
        entityId: rosterId,
        newValue: { status },
        reason: `Roster transitioned to ${status}`,
      },
    });

    return updated;
  }
}
