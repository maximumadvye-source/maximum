import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  cookies().set(COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return NextResponse.json({ ok: true });
}
