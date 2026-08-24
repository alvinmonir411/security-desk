export interface RuleEngineConfig {
  enforceSixOneCycle: boolean;
  maxConsecutiveDutyDays: number;
  maxDailyShifts: number;
  blockOnApprovedLeave: boolean;
  warnOnNightToDaySwitch: boolean;
  warnOnHighDutyStreak: boolean;
  emergencyMode: boolean; // In emergency mode, some soft rules are relaxed
}

export const DefaultRuleConfig: RuleEngineConfig = {
  enforceSixOneCycle: true,
  maxConsecutiveDutyDays: 6,
  maxDailyShifts: 1,
  blockOnApprovedLeave: true,
  warnOnNightToDaySwitch: true,
  warnOnHighDutyStreak: true,
  emergencyMode: false,
};

export enum ConflictSeverity {
  CRITICAL = 'CRITICAL', // Hard Rule: Must block
  WARNING = 'WARNING',   // Soft Rule: Allow with confirmation / override
  INFO = 'INFO',         // Informational
}

export interface RuleEvaluationResult {
  isAllowed: boolean;
  severity: ConflictSeverity;
  ruleName: string;
  message: string;
}

export class RuleEngineService {
  /**
   * Evaluates Hard & Soft rules for a candidate assignment
   */
  static evaluateAssignment(
    guard: {
      hasApprovedLeave: boolean;
      consecutiveDays: number;
      alreadyAssignedToday: boolean;
      hadNightShiftYesterday: boolean;
      isTargetDayShift: boolean;
    },
    config: RuleEngineConfig = DefaultRuleConfig
  ): RuleEvaluationResult[] {
    const results: RuleEvaluationResult[] = [];

    // HARD RULE 1: Approved Leave
    if (config.blockOnApprovedLeave && guard.hasApprovedLeave) {
      results.push({
        isAllowed: false,
        severity: ConflictSeverity.CRITICAL,
        ruleName: 'LEAVE_CONFLICT',
        message: 'Guard is on approved leave for this date and cannot be assigned.',
      });
    }

    // HARD RULE 2: Max 1 Shift per Day
    if (guard.alreadyAssignedToday) {
      results.push({
        isAllowed: false,
        severity: ConflictSeverity.CRITICAL,
        ruleName: 'DUPLICATE_SHIFT_CONFLICT',
        message: 'Guard is already assigned to a shift on this date.',
      });
    }

    // HARD/SOFT RULE 3: 6/1 Consecutive Duty Limit
    if (guard.consecutiveDays >= config.maxConsecutiveDutyDays) {
      if (config.enforceSixOneCycle && !config.emergencyMode) {
        results.push({
          isAllowed: false,
          severity: ConflictSeverity.CRITICAL,
          ruleName: 'SIX_ONE_OFF_DAY_MANDATORY',
          message: `Mandatory Weekly Off required (${guard.consecutiveDays} consecutive duty days reached).`,
        });
      } else {
        results.push({
          isAllowed: true,
          severity: ConflictSeverity.WARNING,
          ruleName: 'HIGH_DUTY_STREAK_OVERRIDE',
          message: `Guard has reached ${guard.consecutiveDays} consecutive days. Emergency override required.`,
        });
      }
    } else if (guard.consecutiveDays === config.maxConsecutiveDutyDays - 1 && config.warnOnHighDutyStreak) {
      results.push({
        isAllowed: true,
        severity: ConflictSeverity.WARNING,
        ruleName: 'APPROACHING_WEEKLY_OFF',
        message: `Guard is on day 5 of 6. Scheduled off-day is tomorrow.`,
      });
    }

    // SOFT RULE 4: Night -> Day consecutive quick switch warning
    if (config.warnOnNightToDaySwitch && guard.hadNightShiftYesterday && guard.isTargetDayShift) {
      results.push({
        isAllowed: true,
        severity: ConflictSeverity.WARNING,
        ruleName: 'NIGHT_TO_DAY_REST_SHORTAGE',
        message: 'Quick shift turnaround: Guard worked Night shift yesterday and is assigned Day shift today.',
      });
    }

    return results;
  }
}
