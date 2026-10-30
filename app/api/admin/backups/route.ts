import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, verifyToken } from '@/lib/auth';
import { createBackup, listBackups, readBackup, readBackupText, validBackupName } from '@/lib/backups.server';
import { writeSettings } from '@/lib/settings.server';
import { githubMode } from '@/lib/github';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const authed = () => verifyToken(cookies().get(COOKIE)?.value);
const deny = () => NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
const fail = (error: string, e: unknown, status = 500) =>
  NextResponse.json({ ok: false, error, detail: e instanceof Error ? e.message : String(e) }, { status });

// GET: قائمة النسخ، أو ?name=... لتنزيل نسخة
export async function GET(req: Request) {
  if (!authed()) return deny();
  if (githubMode()) return NextResponse.json({ ok: true, items: [], disabled: true });
  const name = new URL(req.url).searchParams.get('name');
  try {
    if (name) {
      if (!validBackupName(name)) return NextResponse.json({ ok: false, error: 'bad_name' }, { status: 400 });
      return new NextResponse(await readBackupText(name), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="${name}"`,
        },
      });
    }
    return NextResponse.json({ ok: true, items: await listBackups() });
  } catch (e) {
    return fail('list_failed', e);
  }
}

// POST: إنشاء نسخة يدوية الآن
export async function POST() {
  if (!authed()) return deny();
  if (githubMode()) return NextResponse.json({ ok: false, error: 'disabled' }, { status: 400 });
  try {
    const name = await createBackup('manual');
    return NextResponse.json({ ok: true, name, items: await listBackups() });
  } catch (e) {
    return fail('backup_failed', e);
  }
}

// PUT {name}: استرجاع نسخة (تُحفظ نسخة من الوضع الحالي أولاً)
export async function PUT(req: Request) {
  if (!authed()) return deny();
  if (githubMode()) return NextResponse.json({ ok: false, error: 'disabled' }, { status: 400 });
  try {
    const { name } = await req.json();
    if (!validBackupName(String(name))) return NextResponse.json({ ok: false, error: 'bad_name' }, { status: 400 });
    const target = await readBackup(name);
    await createBackup('before-restore');
    const saved = await writeSettings(target);
    return NextResponse.json({ ok: true, settings: saved, items: await listBackups() });
  } catch (e) {
    return fail('restore_failed', e);
  }
}
