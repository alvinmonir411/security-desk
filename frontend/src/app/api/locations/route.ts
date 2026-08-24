import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      include: {
        posts: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: locations });
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, address, supervisorId, posts } = body;

    const location = await prisma.location.create({
      data: {
        name,
        address,
        supervisorId,
        posts: {
          create: posts && posts.length > 0 ? posts : [
            { name: 'Main Security Gate', requiredDay: 1, requiredNight: 1, type: 'FIXED' }
          ],
        },
      },
      include: { posts: true },
    });

    return NextResponse.json({ success: true, data: location });
  } catch (error: any) {
    console.error('Error creating location:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });

    await prisma.location.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Location deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
