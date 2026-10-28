import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, verifyToken } from '@/lib/auth';
import { readSettings, resetSettings, writeSettings } from '@/lib/settings.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const authed = () => verifyToken(cookies().get(COOKIE)?.value);
const deny = () => NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

export async function GET() {
  if (!authed()) return deny();
  return NextResponse.json({ ok: true, settings: await readSettings() });
}

export async function PUT(req: Request) {
  if (!authed()) return deny();
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ ok: false, error: 'bad_type' }, { status: 415 });
  }
  try {
    const body = await req.json();
    const saved = await writeSettings(body);
    return NextResponse.json({ ok: true, settings: saved });
  } catch (e) {
    // على الاستضافات ذات نظام الملفات للقراءة فقط (مثل Vercel) يفشل الحفظ هنا
    return NextResponse.json(
      { ok: false, error: 'write_failed', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  if (!authed()) return deny();
  try {
    return NextResponse.json({ ok: true, settings: await resetSettings() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'reset_failed' }, { status: 500 });
  }
}
