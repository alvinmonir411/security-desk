import { ConflictSeverity } from './rule-engine.service';

export interface RosterHealthReport {
  isValidForPublish: boolean;
  totalCriticalConflicts: number;
  totalWarnings: number;
  criticalIssues: string[];
  warnings: string[];
  shortages: { locationName: string; shiftName: string; shortageCount: number }[];
  imbalances: string[];
}

export class RosterValidatorService {
  /**
   * Performs deep sanity verification of a generated/modified roster prior to publication
   */
  static validateHealth(
    assignments: {
      guardId: string;
      guardName: string;
      locationName: string;
      shiftName: string;
      isOverride: boolean;
    }[],
    shortages: { locationName: string; shiftName: string; shortageCount: number }[],
    leaveConflicts: string[]
  ): RosterHealthReport {
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const imbalances: string[] = [];

    // 1. Leave Conflicts (Critical)
    leaveConflicts.forEach((lc) => {
      criticalIssues.push(`Hard Rule Violation: Guard ${lc} is assigned while on approved leave.`);
    });

    // 2. Duplicate Assignment Check
    const seenGuardIds = new Set<string>();
    assignments.forEach((a) => {
      if (seenGuardIds.has(a.guardId)) {
        criticalIssues.push(`Duplicate Assignment: Guard ${a.guardName} (${a.guardId}) is assigned multiple times.`);
      }
      seenGuardIds.add(a.guardId);
    });

    // 3. Shortage Detection
    const totalShortageCount = shortages.reduce((sum, s) => sum + s.shortageCount, 0);
    if (totalShortageCount > 0) {
      shortages.forEach((s) => {
        if (s.shortageCount > 0) {
          warnings.push(`Manpower Shortage: ${s.locationName} (${s.shiftName}) is short by ${s.shortageCount} guards.`);
        }
      });
    }

    // 4. Overrides
    const overrideCount = assignments.filter((a) => a.isOverride).length;
    if (overrideCount > 0) {
      warnings.push(`Manual Overrides Present: ${overrideCount} assignments have manual managerial override flags.`);
    }

    const isValidForPublish = criticalIssues.length === 0;

    return {
      isValidForPublish,
      totalCriticalConflicts: criticalIssues.length,
      totalWarnings: warnings.length,
      criticalIssues,
      warnings,
      shortages,
      imbalances,
    };
  }
}
