import { ScoringService, GuardScoringProfile, TargetRequirementSlot } from './scoring.service';

export interface AutoFixSuggestion {
  shortageLocationId: string;
  shortageShiftId: string;
  recommendedGuards: {
    guardId: string;
    fullName: string;
    badgeNumber: string;
    score: number;
    explanation: string[];
  }[];
}

export class OptimizationService {
  /**
   * One-Click Auto-Fix recommendation engine
   * Finds the best matching Reserve/Available candidates to fill an active shortage
   */
  static generateAutoFixSuggestions(
    shortages: { locationId: string; shiftId: string; shiftName: string; count: number }[],
    availableGuards: GuardScoringProfile[],
    targetSlotStats: { averageMonthlyHours: number; averageNightShifts: number }
  ): AutoFixSuggestion[] {
    const suggestions: AutoFixSuggestion[] = [];

    shortages.forEach((shortage) => {
      const targetSlot: TargetRequirementSlot = {
        locationId: shortage.locationId,
        shiftName: shortage.shiftName,
        averageMonthlyHours: targetSlotStats.averageMonthlyHours,
        averageNightShifts: targetSlotStats.averageNightShifts,
      };

      const ranked = availableGuards
        .map((g) => {
          const scoreResult = ScoringService.calculateScore(g, targetSlot);
          return {
            guardId: g.guardId,
            fullName: g.fullName,
            badgeNumber: g.badgeNumber,
            score: scoreResult.score,
            explanation: scoreResult.factors,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3); // Top 3 candidates per slot

      suggestions.push({
        shortageLocationId: shortage.locationId,
        shortageShiftId: shortage.shiftId,
        recommendedGuards: ranked,
      });
    });

    return suggestions;
  }
}
