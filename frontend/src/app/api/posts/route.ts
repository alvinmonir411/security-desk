import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { PostType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { locationId, name, requiredDay, requiredNight, type } = body;

    const post = await prisma.post.create({
      data: {
        locationId,
        name,
        requiredDay: Number(requiredDay),
        requiredNight: Number(requiredNight),
        type: type === 'FIXED' ? PostType.FIXED : PostType.ROTATING,
      },
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, name, requiredDay, requiredNight, type } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing post id' }, { status: 400 });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(requiredDay !== undefined && { requiredDay: Number(requiredDay) }),
        ...(requiredNight !== undefined && { requiredNight: Number(requiredNight) }),
        ...(type && { type: type === 'FIXED' ? PostType.FIXED : PostType.ROTATING }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating post:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Post deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
