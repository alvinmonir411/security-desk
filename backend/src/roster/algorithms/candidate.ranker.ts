import { EvaluatedGuard } from './availability.calculator';

export interface RankingTarget {
  targetLocationId: string;
  targetShiftId: string;
}

export class CandidateRanker {
  /**
   * Deterministically ranks eligible guards for assignment to a target location & shift.
   * Priority logic:
   * 1. Location affinity / Continuity (Guard defaultLocation matches target location)
   * 2. Workload balancing (Guards with lower accumulatedDutyHours prioritized)
   * 3. Fewer consecutive days worked for fair rest pacing
   */
  static rank(candidates: EvaluatedGuard[], target: RankingTarget): EvaluatedGuard[] {
    return [...candidates].sort((a, b) => {
      // 1. Target Location Affinity
      const aIsAffinity = a.defaultLocationId === target.targetLocationId;
      const bIsAffinity = b.defaultLocationId === target.targetLocationId;

      if (aIsAffinity && !bIsAffinity) return -1;
      if (!aIsAffinity && bIsAffinity) return 1;

      // 2. Workload Balancing (Lower duty hours first)
      if (a.accumulatedDutyHours !== b.accumulatedDutyHours) {
        return a.accumulatedDutyHours - b.accumulatedDutyHours;
      }

      // 3. Pacing: Lower consecutive days worked first
      if (a.consecutiveDutyDays !== b.consecutiveDutyDays) {
        return a.consecutiveDutyDays - b.consecutiveDutyDays;
      }

      // 4. Deterministic tie-breaker: badgeNumber alphabetical
      return a.badgeNumber.localeCompare(b.badgeNumber);
    });
  }
}
