import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { GuardStatus } from '@prisma/client';
import { requireRole } from '../../../lib/auth';

export async function GET() {
  const auth = await requireRole('SECURITY_GUARD', 'SUPERVISOR', 'MANAGER', 'AGM', 'DGM');
  if (auth.response) return auth.response;
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
    const { name, phone, nid, address, fixedPostId, status, ...profile } = body;

    const guard = await prisma.guard.create({
      data: {
        name,
        phone,
        nid,
        address,
        fixedPostId: fixedPostId || null,
        status: status ? (status as GuardStatus) : GuardStatus.ACTIVE,
        joinDate: new Date(),
        ...(profile as any),
      } as any,
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
    const {
      id,
      fixedPostId,
      status,
      address,
      phone,
      disciplinaryNote,
      suspensionEndDate,
      absentStartDate,
      absentEndDate,
      disciplinaryActionBy,
      medicalNotes,
      ...profile
    } = body;

    if (!id) return NextResponse.json({ success: false, error: 'Missing guard id' }, { status: 400 });

    const updateData: any = {};
    if (fixedPostId !== undefined) updateData.fixedPostId = fixedPostId;
    if (status !== undefined) {
      updateData.status = status === 'SUSPENDED' ? 'INACTIVE' : (status as GuardStatus);
    }
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;

    // Safely store or clear disciplinary note in medicalNotes
    if (disciplinaryNote !== undefined) {
      if (!disciplinaryNote || disciplinaryNote.startsWith('[ACTIVE]')) {
        updateData.medicalNotes = null;
      } else {
        const endStr = suspensionEndDate ? ` | Ends: ${typeof suspensionEndDate === 'string' ? suspensionEndDate.split('T')[0] : ''}` : '';
        updateData.medicalNotes = `${disciplinaryNote}${endStr}`;
      }
    } else if (medicalNotes !== undefined) {
      updateData.medicalNotes = medicalNotes;
    }

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
