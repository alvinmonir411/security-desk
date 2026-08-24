import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export type Role = 'SECURITY_GUARD' | 'SUPERVISOR' | 'MANAGER' | 'AGM' | 'DGM';
export type Session = { id: string; email: string; name: string; role: Role; title: string };

const COOKIE = 'shieldops_session';
const secret = () => process.env.AUTH_SECRET;

export function signSession(session: Session) {
  const key = secret();
  if (!key) throw new Error('AUTH_SECRET is not configured');
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${createHmac('sha256', key).update(payload).digest('base64url')}`;
}

export function verifySession(value?: string): Session | null {
  const key = secret();
  if (!value || !key) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', key).update(payload).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()) as Session; } catch { return null; }
}

export async function getSession() { return verifySession((await cookies()).get(COOKIE)?.value); }

export async function requireRole(...roles: Role[]) {
  const session = await getSession();
  if (!session) return { session: null, response: Response.json({ success: false, error: 'Authentication required' }, { status: 401 }) };
  if (roles.length && !roles.includes(session.role)) return { session: null, response: Response.json({ success: false, error: 'Insufficient permission' }, { status: 403 }) };
  return { session, response: null };
}

export const sessionCookie = (token: string) => ({ name: COOKIE, value: token, httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 8 });
