export interface DutyHistoryRecord {
  date: Date;
  hasDuty: boolean;
}

export class CycleValidator {
  /**
   * Evaluates if a security guard is due for their mandatory 7th-day weekly off
   * based on their prior 6 days of operational duty history.
   */
  static isScheduledWeeklyOff(past6DaysHistory: DutyHistoryRecord[]): { isOff: boolean; consecutiveDays: number } {
    let consecutiveDays = 0;

    // Check consecutive duty days in sequence leading up to the target day
    for (let i = past6DaysHistory.length - 1; i >= 0; i--) {
      if (past6DaysHistory[i].hasDuty) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return {
      isOff: consecutiveDays >= 6,
      consecutiveDays,
    };
  }
}
