import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { Shift, AssignmentStatus, OvertimeStatus } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const requests = await prisma.overtimeRequest.findMany({
      include: {
        guard: {
          select: {
            id: true,
            name: true,
            phone: true,
            fixedPostId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    console.error('Error fetching overtime requests:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guardId, postId, shift, hours, date, reason, requestedBy } = body;

    if (!guardId || !postId || !shift) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: guardId, postId, shift' },
        { status: 400 }
      );
    }

    const otReq = await prisma.overtimeRequest.create({
      data: {
        guardId,
        postId,
        shift: shift === 'NIGHT' ? Shift.NIGHT : Shift.DAY,
        hours: Number(hours) || 12,
        date: new Date(date || '2026-08-24'),
        reason: reason || 'Emergency staffing replacement on weekly rest day',
        requestedBy: requestedBy || 'MANAGER',
        status: OvertimeStatus.PENDING,
      },
      include: {
        guard: true,
      },
    });

    return NextResponse.json({ success: true, data: otReq });
  } catch (error: any) {
    console.error('Error creating overtime request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action, approvedBy } = body; // action: 'APPROVE' | 'REJECT'

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'Missing id or action' }, { status: 400 });
    }

    const otReq = await prisma.overtimeRequest.findUnique({
      where: { id },
      include: { guard: true },
    });

    if (!otReq) {
      return NextResponse.json({ success: false, error: 'Overtime request not found' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      // 1. Update OvertimeRequest status
      const updatedReq = await prisma.overtimeRequest.update({
        where: { id },
        data: {
          status: OvertimeStatus.APPROVED,
          approvedBy: approvedBy || 'AGM/DGM Operations',
        },
      });

      // 2. Create actual Overtime Assignment on Post
      const assignment = await prisma.assignment.create({
        data: {
          guardId: otReq.guardId,
          postId: otReq.postId,
          shift: otReq.shift,
          date: otReq.date,
          isOvertime: true,
          otHours: otReq.hours,
          status: AssignmentStatus.CONFIRMED,
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedReq,
        assignment,
        message: `Overtime approved by ${approvedBy || 'Executive'}. Guard ${otReq.guard.name} deployed on ${otReq.shift} Shift (${otReq.hours}h OT).`,
      });
    } else {
      const rejectedReq = await prisma.overtimeRequest.update({
        where: { id },
        data: {
          status: OvertimeStatus.REJECTED,
          approvedBy: approvedBy || 'AGM/DGM Operations',
        },
      });

      return NextResponse.json({
        success: true,
        data: rejectedReq,
        message: 'Overtime deployment request rejected.',
      });
    }
  } catch (error: any) {
    console.error('Error updating overtime request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
