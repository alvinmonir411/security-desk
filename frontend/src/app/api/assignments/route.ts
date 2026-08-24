import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { Shift, AssignmentStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date'); // YYYY-MM-DD
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let whereClause: any = {
      status: AssignmentStatus.CONFIRMED,
    };

    if (dateParam) {
      const d = new Date(dateParam);
      const startOfDay = new Date(d.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setUTCHours(23, 59, 59, 999));
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (startDateParam && endDateParam) {
      whereClause.date = {
        gte: new Date(startDateParam),
        lte: new Date(endDateParam),
      };
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        guard: true,
        post: {
          include: {
            location: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: assignments });
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guardId, postId, shift, date } = body;

    const assignmentDate = new Date(date || '2026-08-24');
    const startOfDay = new Date(new Date(assignmentDate).setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(assignmentDate).setUTCHours(23, 59, 59, 999));

    // Remove any existing assignment for this guard on this day
    await prisma.assignment.deleteMany({
      where: {
        guardId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const isOt = Boolean(body.isOvertime);
    const otHours = Number(body.otHours) || (isOt ? 12 : 0);

    // Create new assignment
    const assignment = await prisma.assignment.create({
      data: {
        guardId,
        postId,
        shift: shift === 'DAY' ? Shift.DAY : Shift.NIGHT,
        date: assignmentDate,
        isOvertime: isOt,
        otHours: otHours,
        status: AssignmentStatus.CONFIRMED,
      },
      include: {
        guard: true,
        post: {
          include: {
            location: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: assignment });
  } catch (error: any) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'Missing assignment id' }, { status: 400 });

    const deleted = await prisma.assignment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: deleted });
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
