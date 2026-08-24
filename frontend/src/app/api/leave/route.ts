import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { LeaveStatus, GuardStatus } from '@prisma/client';

export async function GET() {
  try {
    const leaves = await prisma.leave.findMany({
      include: {
        guard: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: leaves });
  } catch (error: any) {
    console.error('Error fetching leaves:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { guardId, startDate, endDate, type } = body;

    const leave = await prisma.leave.create({
      data: {
        guardId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type,
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 });
    }

    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: {
        status: status as LeaveStatus,
      },
      include: { guard: true },
    });

    // If approved, update guard status to ON_LEAVE
    if (status === 'APPROVED') {
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
