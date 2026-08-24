import { GuardStatus } from '@prisma/client';
import { RosterEngine, LocationShiftRequirementInput } from './roster.engine';
import { GuardAvailabilityInput, ComputedGuardAvailability } from './algorithms/availability.calculator';

describe('RosterEngine (Deterministic Workforce Engine)', () => {
  const targetDate = new Date(2026, 7, 24); // Aug 24, 2026

  const mockRequirements: LocationShiftRequirementInput[] = [
    {
      locationId: 'LOC-FACTORY',
      locationName: 'Main Factory',
      shiftId: 'SHIFT-DAY',
      shiftName: 'DAY',
      requiredGuards: 4,
    },
    {
      locationId: 'LOC-SITE-A',
      locationName: 'Sub-Site A',
      shiftId: 'SHIFT-DAY',
      shiftName: 'DAY',
      requiredGuards: 2,
    },
  ];

  function createMockGuard(
    id: number,
    consecutiveDays: number,
    hasLeave = false,
    defaultLocation = 'LOC-FACTORY',
    accumulatedHours = 100
  ): GuardAvailabilityInput {
    const history = [];
    for (let i = 0; i < 6; i++) {
      history.push({
        date: new Date(2026, 7, 18 + i),
        hasDuty: i >= 6 - consecutiveDays,
      });
    }

    return {
      guardId: `GUARD-${id}`,
      badgeNumber: `BD-${1000 + id}`,
      fullName: `Guard ${id}`,
      status: GuardStatus.ACTIVE,
      defaultLocationId: defaultLocation,
      accumulatedDutyHours: accumulatedHours,
      past6DaysHistory: history,
      hasApprovedLeaveOnDate: hasLeave,
      hasExistingAssignmentOnDate: false,
    };
  }

  it('should automatically exclude guards who have worked 6 consecutive days (6/1 Rule)', () => {
    const guards: GuardAvailabilityInput[] = [
      createMockGuard(1, 6), // Should be WEEKLY_OFF
      createMockGuard(2, 5), // Available
      createMockGuard(3, 3), // Available
      createMockGuard(4, 2), // Available
      createMockGuard(5, 1), // Available
      createMockGuard(6, 0), // Available
      createMockGuard(7, 0), // Available
    ];

    const result = RosterEngine.generate(targetDate, guards, mockRequirements);

    expect(result.totalWeeklyOff).toBe(1);
    expect(result.offGuards[0].guardId).toBe('GUARD-1');
    expect(result.offGuards[0].availability).toBe(ComputedGuardAvailability.WEEKLY_OFF);
    expect(result.assignments.find((a) => a.guardId === 'GUARD-1')).toBeUndefined();
  });

  it('should never assign guards with approved leave', () => {
    const guards: GuardAvailabilityInput[] = [
      createMockGuard(1, 2, true), // On Approved Leave
      createMockGuard(2, 2),
      createMockGuard(3, 2),
      createMockGuard(4, 2),
      createMockGuard(5, 2),
      createMockGuard(6, 2),
      createMockGuard(7, 2),
    ];

    const result = RosterEngine.generate(targetDate, guards, mockRequirements);

    expect(result.totalOnLeave).toBe(1);
    expect(result.leaveGuards[0].guardId).toBe('GUARD-1');
    expect(result.assignments.find((a) => a.guardId === 'GUARD-1')).toBeUndefined();
  });

  it('should accurately calculate explicit manpower shortages without silent failures', () => {
    // Requirements need 4 + 2 = 6 guards. Only 3 available guards provided.
    const guards: GuardAvailabilityInput[] = [
      createMockGuard(1, 2),
      createMockGuard(2, 2),
      createMockGuard(3, 2),
    ];

    const result = RosterEngine.generate(targetDate, guards, mockRequirements);

    expect(result.totalRequired).toBe(6);
    expect(result.totalAssigned).toBe(3);
    expect(result.totalShortage).toBe(3);
    expect(result.shortages.length).toBeGreaterThan(0);
  });

  it('should place unassigned surplus guards into the RESERVE pool', () => {
    // Requirements need 6 guards. 8 eligible guards provided.
    const guards: GuardAvailabilityInput[] = [];
    for (let i = 1; i <= 8; i++) {
      guards.push(createMockGuard(i, 2));
    }

    const result = RosterEngine.generate(targetDate, guards, mockRequirements);

    expect(result.totalRequired).toBe(6);
    expect(result.totalAssigned).toBe(6);
    expect(result.totalReserve).toBe(2);
    expect(result.reserveGuards.length).toBe(2);
  });

  it('should prioritize location affinity and lower accumulated duty hours', () => {
    const guards: GuardAvailabilityInput[] = [
      createMockGuard(1, 2, false, 'LOC-FACTORY', 200), // Factory affinity, high hours
      createMockGuard(2, 2, false, 'LOC-FACTORY', 80),  // Factory affinity, low hours (Top priority)
      createMockGuard(3, 2, false, 'LOC-SITE-A', 50),   // Site-A affinity
      createMockGuard(4, 2, false, 'LOC-SITE-A', 120),  // Site-A affinity
    ];

    const singleReq: LocationShiftRequirementInput[] = [
      {
        locationId: 'LOC-FACTORY',
        locationName: 'Main Factory',
        shiftId: 'SHIFT-DAY',
        shiftName: 'DAY',
        requiredGuards: 1,
      },
    ];

    const result = RosterEngine.generate(targetDate, guards, singleReq);

    expect(result.assignments[0].guardId).toBe('GUARD-2'); // Selected because of Factory affinity + lowest hours
  });
});
