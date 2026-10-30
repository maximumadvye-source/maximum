import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, verifyToken } from '@/lib/auth';
import { readSettingsAdmin, resetSettingsAdmin, saveSettingsAdmin } from '@/lib/settings.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const authed = () => verifyToken(cookies().get(COOKIE)?.value);
const deny = () => NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

export async function GET() {
  if (!authed()) return deny();
  return NextResponse.json({ ok: true, settings: await readSettingsAdmin() });
}

export async function PUT(req: Request) {
  if (!authed()) return deny();
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ ok: false, error: 'bad_type' }, { status: 415 });
  }
  try {
    const body = await req.json();
    const saved = await saveSettingsAdmin(body);
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
    return NextResponse.json({ ok: true, settings: await resetSettingsAdmin() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'reset_failed' }, { status: 500 });
  }
}
