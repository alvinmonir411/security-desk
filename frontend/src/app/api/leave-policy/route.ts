import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requireRole } from '../../../lib/auth';

const defaults = { year: new Date().getFullYear(), casualDays: 14, sickDays: 14, unpaidDays: 36, earnedDays: 18 };

export async function GET() {
  const auth = await requireRole('SECURITY_GUARD', 'SUPERVISOR', 'MANAGER', 'AGM', 'DGM');
  if (auth.response) return auth.response;
  const policy = await prisma.leavePolicy.findUnique({ where: { id: 'default' } });
  return NextResponse.json({ success: true, data: policy || defaults });
}

export async function PATCH(request: Request) {
  const auth = await requireRole('DGM');
  if (auth.response) return auth.response;
  const body = await request.json();
  const data = { year: Number(body.year), casualDays: Number(body.casualDays), sickDays: Number(body.sickDays), unpaidDays: Number(body.unpaidDays), earnedDays: Number(body.earnedDays) };
  if (Object.values(data).some(value => !Number.isInteger(value) || value < 0)) return NextResponse.json({ success: false, error: 'Leave policy values must be whole positive numbers.' }, { status: 400 });
  const policy = await prisma.leavePolicy.upsert({ where: { id: 'default' }, create: { id: 'default', ...data }, update: data });
  return NextResponse.json({ success: true, data: policy });
}
