import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, verifyToken } from '@/lib/auth';
import { listImages } from '@/lib/settings.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!verifyToken(cookies().get(COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, images: await listImages() });
}
