import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { Shift, AssignmentStatus, GuardStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, locationId, postId } = body;

    const targetDate = new Date(date || '2026-08-24');
    const startOfDay = new Date(new Date(targetDate).setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(targetDate).setUTCHours(23, 59, 59, 999));

    // Get all locations & posts (or filtered)
    const locations = await prisma.location.findMany({
      where: locationId ? { id: locationId } : undefined,
      include: {
        posts: postId ? { where: { id: postId } } : true,
      },
    });

    // Get existing assignments for target date
    const existingAssignments = await prisma.assignment.findMany({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
        status: AssignmentStatus.CONFIRMED,
      },
    });

    const assignedGuardIds = new Set(existingAssignments.map((a) => a.guardId));

    // Get all active guards not assigned today
    const availableGuards = await prisma.guard.findMany({
      where: {
        status: GuardStatus.ACTIVE,
        id: { notIn: Array.from(assignedGuardIds) },
      },
      include: {
        fixedPost: true,
      },
    });

    let autoAssignedCount = 0;
    const newAssignments = [];

    for (const loc of locations) {
      for (const post of loc.posts) {
        const postAsgs = existingAssignments.filter((a) => a.postId === post.id);
        const dayAssigned = postAsgs.filter((a) => a.shift === Shift.DAY).length;
        const nightAssigned = postAsgs.filter((a) => a.shift === Shift.NIGHT).length;

        const dayNeeded = Math.max(0, post.requiredDay - dayAssigned);
        const nightNeeded = Math.max(0, post.requiredNight - nightAssigned);

        // Fill Day
        for (let i = 0; i < dayNeeded && availableGuards.length > 0; i++) {
          // Score and pick best candidate
          availableGuards.sort((a, b) => {
            const matchA = a.fixedPostId === post.id ? 100 : (a.fixedPostId ? -50 : 10);
            const matchB = b.fixedPostId === post.id ? 100 : (b.fixedPostId ? -50 : 10);
            return matchB - matchA;
          });

          const chosen = availableGuards.shift()!;
          newAssignments.push({
            guardId: chosen.id,
            postId: post.id,
            date: targetDate,
            shift: Shift.DAY,
            status: AssignmentStatus.CONFIRMED,
          });
          autoAssignedCount++;
        }

        // Fill Night
        for (let i = 0; i < nightNeeded && availableGuards.length > 0; i++) {
          availableGuards.sort((a, b) => {
            const matchA = a.fixedPostId === post.id ? 100 : (a.fixedPostId ? -50 : 10);
            const matchB = b.fixedPostId === post.id ? 100 : (b.fixedPostId ? -50 : 10);
            return matchB - matchA;
          });

          const chosen = availableGuards.shift()!;
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

    if (newAssignments.length > 0) {
      await prisma.assignment.createMany({
        data: newAssignments,
      });
    }

    return NextResponse.json({
      success: true,
      autoAssignedCount,
      message: `${autoAssignedCount} guard slots auto-filled on Neon database.`,
    });
  } catch (error: any) {
    console.error('Error auto-fixing roster:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
