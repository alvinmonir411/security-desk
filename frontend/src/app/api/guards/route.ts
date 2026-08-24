import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { GuardStatus } from '@prisma/client';

export async function GET() {
  try {
    const guards = await prisma.guard.findMany({
      include: {
        fixedPost: {
          include: {
            location: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: guards });
  } catch (error: any) {
    console.error('Error fetching guards:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, nid, address, fixedPostId, status } = body;

    const guard = await prisma.guard.create({
      data: {
        name,
        phone,
        nid,
        address,
        fixedPostId: fixedPostId || null,
        status: status ? (status as GuardStatus) : GuardStatus.ACTIVE,
        joinDate: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: guard });
  } catch (error: any) {
    console.error('Error creating guard:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, fixedPostId, status, address, phone } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Missing guard id' }, { status: 400 });

    const updateData: any = {};
    if (fixedPostId !== undefined) updateData.fixedPostId = fixedPostId;
    if (status !== undefined) updateData.status = status as GuardStatus;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;

    const updated = await prisma.guard.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating guard:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
