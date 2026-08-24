import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { LeaveStatus, GuardStatus } from '@prisma/client';

export async function GET() {
  try {
    const leaves = await prisma.leave.findMany({
      include: {
        guard: {
          include: {
            fixedPost: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsedLeaves = leaves.map((l) => {
      let category = 'Medical / Casual Leave';
      let reason = 'Personal leave application';
      let stage = l.status === 'APPROVED' ? 'APPROVED' : l.status === 'REJECTED' ? 'REJECTED' : 'PENDING_SUPERVISOR';
      let supervisorApproval = null;
      let managerApproval = null;
      let executiveApproval = null;
      let rejectionReason = null;
      let rejectedBy = null;

      try {
        if (l.type.startsWith('{')) {
          const parsed = JSON.parse(l.type);
          category = parsed.category || category;
          reason = parsed.reason || reason;
          if (l.status === 'PENDING') {
            stage = parsed.stage || 'PENDING_SUPERVISOR';
          }
          supervisorApproval = parsed.supervisorApproval || null;
          managerApproval = parsed.managerApproval || null;
          executiveApproval = parsed.executiveApproval || null;
          rejectionReason = parsed.rejectionReason || null;
          rejectedBy = parsed.rejectedBy || null;
        } else {
          category = l.type;
        }
      } catch {
        category = l.type;
      }

      return {
        id: l.id,
        guardId: l.guardId,
        guardName: l.guard?.name || 'Guard',
        startDate: l.startDate.toISOString().split('T')[0],
        endDate: l.endDate.toISOString().split('T')[0],
        type: category,
        reason,
        status: stage,
        dbStatus: l.status,
        supervisorApproval,
        managerApproval,
        executiveApproval,
        rejectionReason,
        rejectedBy,
        createdAt: l.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, data: parsedLeaves });
  } catch (error: any) {
    console.error('Error fetching leaves:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guardId, guardName, startDate, endDate, type = 'Casual Leave (CL)', reason = 'Personal Reason' } = body;

    // Safely resolve matching guard in DB to prevent foreign key violations
    let targetGuard = null;
    if (guardId && !guardId.startsWith('USR-') && !guardId.startsWith('GUARD-')) {
      targetGuard = await prisma.guard.findUnique({ where: { id: guardId } });
    }

    if (!targetGuard && guardName) {
      targetGuard = await prisma.guard.findFirst({
        where: {
          name: { contains: guardName.split(' ')[0], mode: 'insensitive' },
        },
      });
    }

    if (!targetGuard) {
      targetGuard = await prisma.guard.findFirst();
    }

    if (!targetGuard) {
      return NextResponse.json({ success: false, error: 'No guards found in database.' }, { status: 400 });
    }

    const payload = {
      category: type,
      reason,
      stage: 'PENDING_SUPERVISOR', // Step 1: Supervisor Review
      supervisorApproval: null,
      managerApproval: null,
      executiveApproval: null,
    };

    const leave = await prisma.leave.create({
      data: {
        guardId: targetGuard.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type: JSON.stringify(payload),
        status: LeaveStatus.PENDING,
      },
      include: { guard: true },
    });

    return NextResponse.json({ success: true, data: leave });
  } catch (error: any) {
    console.error('Error creating leave:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, approverName, approverRole, comment, rejectionReason, rejectedBy } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 });
    }

    const existing = await prisma.leave.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Leave not found' }, { status: 404 });
    }

    let parsedPayload: any = {};
    try {
      if (existing.type.startsWith('{')) {
        parsedPayload = JSON.parse(existing.type);
      } else {
        parsedPayload = { category: existing.type, reason: 'Personal leave' };
      }
    } catch {
      parsedPayload = { category: existing.type, reason: 'Personal leave' };
    }

    let dbStatus: LeaveStatus = LeaveStatus.PENDING;
    const now = new Date().toISOString().split('T')[0];

    if (status === 'APPROVED') {
      dbStatus = LeaveStatus.APPROVED;
      parsedPayload.stage = 'APPROVED';
      parsedPayload.executiveApproval = { name: approverName || 'DGM/AGM Executive', role: approverRole, date: now, comment };
    } else if (status === 'REJECTED') {
      dbStatus = LeaveStatus.REJECTED;
      parsedPayload.stage = 'REJECTED';
      parsedPayload.rejectionReason = rejectionReason || 'Operational manpower requirements';
      parsedPayload.rejectedBy = rejectedBy || approverName || 'Security Authority';
    } else if (status === 'PENDING_MANAGER') {
      dbStatus = LeaveStatus.PENDING;
      parsedPayload.stage = 'PENDING_MANAGER';
      parsedPayload.supervisorApproval = { name: approverName || 'Field Supervisor', role: approverRole, date: now, comment };
    } else if (status === 'PENDING_EXECUTIVE') {
      dbStatus = LeaveStatus.PENDING;
      parsedPayload.stage = 'PENDING_EXECUTIVE';
      parsedPayload.managerApproval = { name: approverName || 'Operations Manager', role: approverRole, date: now, comment };
    }

    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status: dbStatus,
        type: JSON.stringify(parsedPayload),
      },
      include: { guard: true },
    });

    // If final approved, update guard status to ON_LEAVE
    if (dbStatus === LeaveStatus.APPROVED) {
      await prisma.guard.update({
        where: { id: updatedLeave.guardId },
        data: { status: GuardStatus.ON_LEAVE },
      });
    }

    return NextResponse.json({ success: true, data: updatedLeave });
  } catch (error: any) {
    console.error('Error updating leave:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
