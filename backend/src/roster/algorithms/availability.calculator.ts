import { GuardStatus } from '@prisma/client';
import { CycleValidator, DutyHistoryRecord } from './cycle.validator';

export enum ComputedGuardAvailability {
  AVAILABLE = 'AVAILABLE',
  WEEKLY_OFF = 'WEEKLY_OFF',
  ON_LEAVE = 'ON_LEAVE',
  ALREADY_ASSIGNED = 'ALREADY_ASSIGNED',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  RESERVE = 'RESERVE',
}

export interface GuardAvailabilityInput {
  guardId: string;
  badgeNumber: string;
  fullName: string;
  status: GuardStatus;
  defaultLocationId: string | null;
  accumulatedDutyHours: number;
  past6DaysHistory: DutyHistoryRecord[];
  hasApprovedLeaveOnDate: boolean;
  hasExistingAssignmentOnDate: boolean;
}

export interface EvaluatedGuard {
  guardId: string;
  badgeNumber: string;
  fullName: string;
  status: GuardStatus;
  availability: ComputedGuardAvailability;
  unavailabilityReason?: string;
  defaultLocationId: string | null;
  accumulatedDutyHours: number;
  consecutiveDutyDays: number;
}

export class AvailabilityCalculator {
  /**
   * Deterministically calculates the exact availability state for a security guard
   */
  static evaluate(guard: GuardAvailabilityInput): EvaluatedGuard {
    // 1. Inactive or Suspended check
    if (guard.status === GuardStatus.INACTIVE) {
      return {
        ...guard,
        availability: ComputedGuardAvailability.INACTIVE,
        unavailabilityReason: 'Guard profile is marked inactive',
        consecutiveDutyDays: 0,
      };
    }

    if (guard.status === GuardStatus.SUSPENDED) {
      return {
        ...guard,
        availability: ComputedGuardAvailability.SUSPENDED,
        unavailabilityReason: 'Guard is currently under suspension',
        consecutiveDutyDays: 0,
      };
    }

    // 2. Approved Leave check
    if (guard.hasApprovedLeaveOnDate) {
      return {
        ...guard,
        availability: ComputedGuardAvailability.ON_LEAVE,
        unavailabilityReason: 'Guard has an approved leave request on this date',
        consecutiveDutyDays: 0,
      };
    }

    // 3. Existing Assignment conflict on same date
    if (guard.hasExistingAssignmentOnDate) {
      return {
        ...guard,
        availability: ComputedGuardAvailability.ALREADY_ASSIGNED,
        unavailabilityReason: 'Guard is already assigned to a shift on this date',
        consecutiveDutyDays: 0,
      };
    }

    // 4. 6-Day Duty / 1-Day Off Rule evaluation
    const cycleResult = CycleValidator.isScheduledWeeklyOff(guard.past6DaysHistory);
    if (cycleResult.isOff) {
      return {
        ...guard,
        availability: ComputedGuardAvailability.WEEKLY_OFF,
        unavailabilityReason: `Scheduled Weekly Off (${cycleResult.consecutiveDays} continuous duty days reached)`,
        consecutiveDutyDays: cycleResult.consecutiveDays,
      };
    }

    // 5. Eligible & Available
    return {
      ...guard,
      availability: ComputedGuardAvailability.AVAILABLE,
      consecutiveDutyDays: cycleResult.consecutiveDays,
    };
  }
}
