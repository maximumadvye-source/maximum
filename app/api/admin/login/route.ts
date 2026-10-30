import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, MAX_AGE, adminEnabled, checkPassword, makeToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// تحديد محاولات التخمين: 8 محاولات خاطئة لكل عنوان خلال 15 دقيقة (حماية أساسية)
const fails = new Map<string, { n: number; t: number }>();
const WINDOW = 15 * 60 * 1000;
const LIMIT = 8;
const ipOf = (req: Request) => (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();

export async function POST(req: Request) {
  if (!adminEnabled()) {
    return NextResponse.json({ ok: false, error: 'disabled' }, { status: 503 });
  }
  const ip = ipOf(req);
  const rec = fails.get(ip);
  if (rec && Date.now() - rec.t < WINDOW && rec.n >= LIMIT) {
    return NextResponse.json({ ok: false, error: 'too_many' }, { status: 429 });
  }
  let password = '';
  try {
    const body = await req.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!checkPassword(password)) {
    const now = Date.now();
    const cur = fails.get(ip);
    fails.set(ip, cur && now - cur.t < WINDOW ? { n: cur.n + 1, t: cur.t } : { n: 1, t: now });
    await new Promise((r) => setTimeout(r, 600)); // إبطاء محاولات التخمين
    return NextResponse.json({ ok: false, error: 'bad_password' }, { status: 401 });
  }

  fails.delete(ip);
  cookies().set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
  return NextResponse.json({ ok: true });
}
