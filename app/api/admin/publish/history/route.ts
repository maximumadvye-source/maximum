import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, verifyToken } from '@/lib/auth';
import { githubReady, settingsHistory } from '@/lib/github';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!verifyToken(cookies().get(COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!githubReady()) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, items: await settingsHistory() });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'history_failed', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
