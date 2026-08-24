export interface GuardScoringProfile {
  guardId: string;
  fullName: string;
  badgeNumber: string;
  defaultLocationId: string | null;
  allowedShifts: string[]; // ['DAY', 'NIGHT'] or ['DAY'] or ['NIGHT']
  qualifications: string[]; // ['CCTV', 'GATE', 'FIRE_SAFETY', 'VIP']
  consecutiveDutyDays: number; // 0 to 6
  monthlyDutyHours: number;
  monthlyNightShifts: number;
  pastLocationIds: string[];
}

export interface TargetRequirementSlot {
  locationId: string;
  shiftName: string; // 'DAY' | 'NIGHT'
  requiredQualification?: string;
  averageMonthlyHours: number;
  averageNightShifts: number;
}

export interface ScoreExplanation {
  score: number;
  breakdown: {
    availabilityScore: number;
    dutyBalanceScore: number;
    locationMatchScore: number;
    shiftCompatibilityScore: number;
    skillMatchScore: number;
    streakPacingScore: number;
  };
  factors: string[];
  warnings: string[];
}

export class ScoringService {
  /**
   * Deterministic Assignment Scoring Algorithm (0 - 100 Scale)
   * Weights:
   * - Availability & Baseline (30%)
   * - Duty Balance & Fair Hours (20%)
   * - Location Match / Affinity (15%)
   * - Shift Compatibility & Rotation (15%)
   * - Skill / Qualification Match (10%)
   * - Streak Pacing & Fairness (10%)
   */
  static calculateScore(guard: GuardScoringProfile, target: TargetRequirementSlot): ScoreExplanation {
    let score = 0;
    const factors: string[] = [];
    const warnings: string[] = [];

    // 1. Availability Baseline (Max 30)
    let availabilityScore = 30;
    factors.push('Base candidate availability (+30)');

    // 2. Duty Balance (Max 20) - Prioritize guards with lower monthly hours than organization average
    let dutyBalanceScore = 15;
    if (guard.monthlyDutyHours < target.averageMonthlyHours) {
      dutyBalanceScore = 20;
      factors.push(`Lower monthly hours (${guard.monthlyDutyHours}h vs avg ${target.averageMonthlyHours}h) (+20)`);
    } else if (guard.monthlyDutyHours > target.averageMonthlyHours + 24) {
      dutyBalanceScore = 8;
      warnings.push(`High monthly duty hours (${guard.monthlyDutyHours}h)`);
    } else {
      dutyBalanceScore = 14;
      factors.push(`Standard duty workload balance (+14)`);
    }

    // 3. Location Match & Affinity (Max 15)
    let locationMatchScore = 5;
    if (guard.defaultLocationId === target.locationId) {
      locationMatchScore = 15;
      factors.push('Primary location affinity match (+15)');
    } else if (guard.pastLocationIds.includes(target.locationId)) {
      locationMatchScore = 10;
      factors.push('Previous location operational familiarity (+10)');
    } else {
      factors.push('Standard deployment transfer (+5)');
    }

    // 4. Shift Compatibility (Max 15)
    let shiftCompatibilityScore = 10;
    if (guard.allowedShifts.includes(target.shiftName)) {
      shiftCompatibilityScore = 15;
      factors.push(`Fully compatible with ${target.shiftName} Shift (+15)`);
      if (target.shiftName === 'NIGHT' && guard.monthlyNightShifts > target.averageNightShifts + 4) {
        shiftCompatibilityScore -= 4;
        warnings.push(`Night shift load imbalance (${guard.monthlyNightShifts} nights this month)`);
      }
    } else {
      shiftCompatibilityScore = 0;
      warnings.push(`Shift mismatch for ${target.shiftName}`);
    }

    // 5. Skill / Qualification Match (Max 10)
    let skillMatchScore = 5;
    if (target.requiredQualification) {
      if (guard.qualifications.includes(target.requiredQualification)) {
        skillMatchScore = 10;
        factors.push(`Certified for ${target.requiredQualification} (+10)`);
      } else {
        skillMatchScore = 2;
        warnings.push(`Missing certified qualification ${target.requiredQualification}`);
      }
    } else {
      skillMatchScore = 8;
      factors.push('General security deployment qualification (+8)');
    }

    // 6. Streak Pacing (Max 10)
    let streakPacingScore = 10;
    if (guard.consecutiveDutyDays <= 2) {
      streakPacingScore = 10;
      factors.push(`Fresh duty streak (${guard.consecutiveDutyDays}/6 days) (+10)`);
    } else if (guard.consecutiveDutyDays === 5) {
      streakPacingScore = 4;
      warnings.push('Near weekly off limit (5/6 consecutive days)');
    } else {
      streakPacingScore = 8;
      factors.push(`Active streak (${guard.consecutiveDutyDays}/6 days) (+8)`);
    }

    score =
      availabilityScore +
      dutyBalanceScore +
      locationMatchScore +
      shiftCompatibilityScore +
      skillMatchScore +
      streakPacingScore;

    return {
      score: Math.min(100, Math.max(0, score)),
      breakdown: {
        availabilityScore,
        dutyBalanceScore,
        locationMatchScore,
        shiftCompatibilityScore,
        skillMatchScore,
        streakPacingScore,
      },
      factors,
      warnings,
    };
  }
}
