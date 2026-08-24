import { NextResponse } from 'next/server';
import { signSession, sessionCookie, type Role } from '../../../../lib/auth';

const accounts: Record<string, { password: string; id: string; name: string; role: Role; title: string }> = {
  'dgm@shieldops.com': { password: process.env.DGM_PASSWORD || '', id: 'USR-DGM-01', name: 'Brig. Gen. (Retd) Anwar Hossain', role: 'DGM', title: 'Deputy General Manager (Chief Security)' },
  'agm@shieldops.com': { password: process.env.AGM_PASSWORD || '', id: 'USR-AGM-01', name: 'Major (Retd) M. A. Jalil', role: 'AGM', title: 'Assistant General Manager (Operations)' },
  'manager@shieldops.com': { password: process.env.MANAGER_PASSWORD || '', id: 'USR-MGR-01', name: 'Md. Imran Hossain', role: 'MANAGER', title: 'Security Operations Manager' },
  'supervisor@shieldops.com': { password: process.env.SUPERVISOR_PASSWORD || '', id: 'USR-SUP-01', name: 'Md. Delwar Hossain', role: 'SUPERVISOR', title: 'Senior Field Supervisor' },
  'guard@shieldops.com': { password: process.env.GUARD_PASSWORD || '', id: 'USR-GRD-01', name: 'Abdul Mahfuz Islam', role: 'SECURITY_GUARD', title: 'Senior Security Guard (G-001)' },
};

export async function POST(request: Request) {
  const { identifier, password } = await request.json();
  const account = accounts[String(identifier).trim().toLowerCase()];
  if (!process.env.AUTH_SECRET || !account || !account.password || password !== account.password) return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  const session = { id: account.id, email: String(identifier).trim().toLowerCase(), name: account.name, role: account.role, title: account.title };
  const response = NextResponse.json({ success: true, data: session });
  response.cookies.set(sessionCookie(signSession(session)));
  return response;
}
