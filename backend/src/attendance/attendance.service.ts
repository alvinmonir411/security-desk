import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIn(guardId: string, locationId: string, shiftId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const assignment = await this.prisma.rosterAssignment.findUnique({
      where: {
        guardId_date: {
          guardId,
          date: today,
        },
      },
    });

    return this.prisma.attendance.create({
      data: {
        guardId,
        assignmentId: assignment?.id,
        locationId,
        shiftId,
        date: today,
        status: AttendanceStatus.PRESENT,
        checkInTime: new Date(),
      },
    });
  }

  async checkOut(attendanceId: string) {
    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        checkOutTime: new Date(),
      },
    });
  }

  async getDailyMusterRoll(dateStr?: string, locationId?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    return this.prisma.attendance.findMany({
      where: {
        date: targetDate,
        locationId: locationId || undefined,
      },
      include: {
        guard: { include: { user: true } },
        location: true,
        shift: true,
      },
    });
  }
}
