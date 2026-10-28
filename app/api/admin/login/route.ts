import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, MAX_AGE, adminEnabled, checkPassword, makeToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!adminEnabled()) {
    return NextResponse.json({ ok: false, error: 'disabled' }, { status: 503 });
  }
  let password = '';
  try {
    const body = await req.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600)); // إبطاء محاولات التخمين
    return NextResponse.json({ ok: false, error: 'bad_password' }, { status: 401 });
  }

  cookies().set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
  return NextResponse.json({ ok: true });
}
