import {
  AvailabilityCalculator,
  ComputedGuardAvailability,
  EvaluatedGuard,
  GuardAvailabilityInput,
} from './algorithms/availability.calculator';
import { CandidateRanker } from './algorithms/candidate.ranker';

export interface LocationShiftRequirementInput {
  locationId: string;
  locationName: string;
  shiftId: string;
  shiftName: string;
  requiredGuards: number;
}

export interface GeneratedAssignment {
  guardId: string;
  badgeNumber: string;
  fullName: string;
  locationId: string;
  shiftId: string;
  date: Date;
  isOverride: boolean;
  overrideReason?: string;
}

export interface LocationShortageReport {
  locationId: string;
  locationName: string;
  shiftId: string;
  shiftName: string;
  required: number;
  assigned: number;
  shortage: number;
}

export interface RosterGenerationResult {
  date: Date;
  totalRequired: number;
  totalAssigned: number;
  totalShortage: number;
  totalAvailable: number;
  totalWeeklyOff: number;
  totalOnLeave: number;
  totalReserve: number;
  assignments: GeneratedAssignment[];
  shortages: LocationShortageReport[];
  reserveGuards: EvaluatedGuard[];
  offGuards: EvaluatedGuard[];
  leaveGuards: EvaluatedGuard[];
}

export class RosterEngine {
  /**
   * Deterministic Roster Generation Engine
   * Executes multi-location demand satisfaction with 6-on-1-off duty cycle guarantees
   */
  static generate(
    targetDate: Date,
    guardsInput: GuardAvailabilityInput[],
    requirements: LocationShiftRequirementInput[]
  ): RosterGenerationResult {
    // 1. Evaluate Availability for All Guards
    const evaluatedGuards = guardsInput.map((g) => AvailabilityCalculator.evaluate(g));

    const offGuards = evaluatedGuards.filter((g) => g.availability === ComputedGuardAvailability.WEEKLY_OFF);
    const leaveGuards = evaluatedGuards.filter((g) => g.availability === ComputedGuardAvailability.ON_LEAVE);
    
    // Eligible Candidate Pool for assignment
    let availablePool = evaluatedGuards.filter((g) => g.availability === ComputedGuardAvailability.AVAILABLE);

    const totalRequired = requirements.reduce((sum, r) => sum + r.requiredGuards, 0);
    const initialAvailableCount = availablePool.length;

    const assignments: GeneratedAssignment[] = [];
    const shortages: LocationShortageReport[] = [];

    // 2. Iterate through location requirements
    // Priority: Higher requirements first (e.g. Factory Main Complex first, then Sub-sites)
    const sortedRequirements = [...requirements].sort((a, b) => b.requiredGuards - a.requiredGuards);

    for (const req of sortedRequirements) {
      if (req.requiredGuards <= 0) continue;

      // Rank remaining available candidates for this specific (Location, Shift)
      const rankedCandidates = CandidateRanker.rank(availablePool, {
        targetLocationId: req.locationId,
        targetShiftId: req.shiftId,
      });

      const assignedForThisReq: EvaluatedGuard[] = [];

      for (let i = 0; i < req.requiredGuards && i < rankedCandidates.length; i++) {
        assignedForThisReq.push(rankedCandidates[i]);
      }

      // Record assignments
      assignedForThisReq.forEach((guard) => {
        assignments.push({
          guardId: guard.guardId,
          badgeNumber: guard.badgeNumber,
          fullName: guard.fullName,
          locationId: req.locationId,
          shiftId: req.shiftId,
          date: targetDate,
          isOverride: false,
        });
      });

      // Remove assigned guards from available pool
      const assignedIds = new Set(assignedForThisReq.map((g) => g.guardId));
      availablePool = availablePool.filter((g) => !assignedIds.has(g.guardId));

      // Calculate any shortage for this specific post/shift
      const shortageCount = req.requiredGuards - assignedForThisReq.length;
      if (shortageCount > 0) {
        shortages.push({
          locationId: req.locationId,
          locationName: req.locationName,
          shiftId: req.shiftId,
          shiftName: req.shiftName,
          required: req.requiredGuards,
          assigned: assignedForThisReq.length,
          shortage: shortageCount,
        });
      }
    }

    const totalAssigned = assignments.length;
    const totalShortage = shortages.reduce((sum, s) => sum + s.shortage, 0);

    // Remaining unassigned eligible guards become Reserve pool
    const reserveGuards = availablePool.map((g) => ({
      ...g,
      availability: ComputedGuardAvailability.RESERVE,
    }));

    return {
      date: targetDate,
      totalRequired,
      totalAssigned,
      totalShortage,
      totalAvailable: initialAvailableCount,
      totalWeeklyOff: offGuards.length,
      totalOnLeave: leaveGuards.length,
      totalReserve: reserveGuards.length,
      assignments,
      shortages,
      reserveGuards,
      offGuards,
      leaveGuards,
    };
  }
}
