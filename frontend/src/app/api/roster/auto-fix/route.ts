import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { Shift, AssignmentStatus, GuardStatus } from '@prisma/client';

/**
 * 6-Day Duty + 1-Day Off Alternating Shift Policy:
 * - 6 days in Shift A (e.g. Day Shift) -> 1 Off-Day -> 6 days in Shift B (Night Shift) -> 1 Off-Day -> Shift A...
 * - Guards are staggered across 7 off-day cohorts so workforce is balanced every day.
 */
export function calculateGuardCycle(guardIndex: number, targetDateStr: string): {
  isOffDay: boolean;
  activeShift: Shift;
  cycleWeek: 1 | 2;
  dayInCycle: number;
} {
  const targetDate = new Date(targetDateStr);
  const epoch = new Date('2026-08-01T00:00:00.000Z'); // Baseline epoch Saturday
  const diffDays = Math.floor((targetDate.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));

  // Stagger off-day cohort (0 to 6)
  const offDayOffset = guardIndex % 7;
  
  // Starting shift preference for half the force (first half Day, second half Night)
  const initialShiftPref: Shift = (guardIndex % 2 === 0) ? Shift.DAY : Shift.NIGHT;

  // Day relative to guard's individual 7-day cycle
  const dayIn7Cycle = ((diffDays - offDayOffset) % 7 + 7) % 7; // 0..5 = working days, 6 = off-day

  // Total completed 7-day cycles for this guard to determine alternation (Week 1 vs Week 2)
  const completedWeeks = Math.floor((diffDays - offDayOffset) / 7);
  const isAltWeek = ((completedWeeks % 2) + 2) % 2 === 1;

  const isOffDay = (dayIn7Cycle === 6);
  
  let activeShift: Shift;
  if (initialShiftPref === Shift.DAY) {
    activeShift = isAltWeek ? Shift.NIGHT : Shift.DAY;
  } else {
    activeShift = isAltWeek ? Shift.DAY : Shift.NIGHT;
  }

  return {
    isOffDay,
    activeShift,
    cycleWeek: isAltWeek ? 2 : 1,
    dayInCycle: dayIn7Cycle + 1,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, locationId, postId } = body;

    const targetDateStr = date || '2026-08-24';
    const targetDate = new Date(targetDateStr);
    const startOfDay = new Date(new Date(targetDate).setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(targetDate).setUTCHours(23, 59, 59, 999));

    // 1. Fetch Locations & Posts
    const locations = await prisma.location.findMany({
      where: locationId ? { id: locationId } : undefined,
      include: {
        posts: postId ? { where: { id: postId } } : true,
      },
      orderBy: { id: 'asc' },
    });

    // 2. Fetch all Guards
    const allGuards = await prisma.guard.findMany({
      where: { status: GuardStatus.ACTIVE },
      orderBy: { id: 'asc' },
    });

    // 3. Clear existing assignments for this target date if regenerating full day
    if (!postId && !locationId) {
      await prisma.assignment.deleteMany({
        where: {
          date: { gte: startOfDay, lte: endOfDay },
        },
      });
    }

    // 4. Categorize available guards based on 6+1 alternating shift calculation
    const eligibleDayGuards: any[] = [];
    const eligibleNightGuards: any[] = [];
    let offDayCount = 0;

    allGuards.forEach((guard, index) => {
      const cycle = calculateGuardCycle(index, targetDateStr);
      if (cycle.isOffDay) {
        offDayCount++;
      } else if (cycle.activeShift === Shift.DAY) {
        eligibleDayGuards.push(guard);
      } else {
        eligibleNightGuards.push(guard);
      }
    });

    const newAssignments = [];
    let autoAssignedCount = 0;

    // 5. Fill Post Slots matching Day-cycle guards strictly to Day slots and Night-cycle guards strictly to Night slots
    for (const loc of locations) {
      for (const post of loc.posts) {
        // Assign Day Shift Slots (Strictly Day-cycle guards)
        for (let d = 0; d < post.requiredDay; d++) {
          if (eligibleDayGuards.length > 0) {
            // Priority to fixed post match if any
            eligibleDayGuards.sort((a, b) => {
              const matchA = a.fixedPostId === post.id ? 100 : (a.fixedPostId ? -20 : 0);
              const matchB = b.fixedPostId === post.id ? 100 : (b.fixedPostId ? -20 : 0);
              return matchB - matchA;
            });

            const chosen = eligibleDayGuards.shift()!;
            newAssignments.push({
              guardId: chosen.id,
              postId: post.id,
              date: targetDate,
              shift: Shift.DAY,
              status: AssignmentStatus.CONFIRMED,
            });
            autoAssignedCount++;
          }
        }

        // Assign Night Shift Slots (Strictly Night-cycle guards)
        for (let n = 0; n < post.requiredNight; n++) {
          if (eligibleNightGuards.length > 0) {
            eligibleNightGuards.sort((a, b) => {
              const matchA = a.fixedPostId === post.id ? 100 : (a.fixedPostId ? -20 : 0);
              const matchB = b.fixedPostId === post.id ? 100 : (b.fixedPostId ? -20 : 0);
              return matchB - matchA;
            });

            const chosen = eligibleNightGuards.shift()!;
            newAssignments.push({
              guardId: chosen.id,
              postId: post.id,
              date: targetDate,
              shift: Shift.NIGHT,
              status: AssignmentStatus.CONFIRMED,
            });
            autoAssignedCount++;
          }
        }
      }
    }

    if (newAssignments.length > 0) {
      await prisma.assignment.createMany({
        data: newAssignments,
      });
    }

    return NextResponse.json({
      success: true,
      autoAssignedCount,
      offDayCount,
      dayAssigned: newAssignments.filter((a) => a.shift === Shift.DAY).length,
      nightAssigned: newAssignments.filter((a) => a.shift === Shift.NIGHT).length,
      message: `Assigned ${autoAssignedCount} guards with strict 6-day cycle alternation (${offDayCount} guards on scheduled weekly off-day).`,
    });
  } catch (error: any) {
    console.error('Error in alternating shift auto-roster:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
