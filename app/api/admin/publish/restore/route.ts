import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, verifyToken } from '@/lib/auth';
import { commitFiles, githubReady, settingsAt } from '@/lib/github';
import { sanitizeSettings } from '@/lib/settings';
import { writeSettings } from '@/lib/settings.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// استرجاع نسخة سابقة من الإعدادات ونشرها كـ commit جديد (السجل القديم يبقى كما هو)
export async function POST(req: Request) {
  if (!verifyToken(cookies().get(COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!githubReady()) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 400 });

  let sha = '';
  try {
    sha = String((await req.json())?.sha || '');
  } catch {
    /* body غير صالح */
  }
  if (!/^[0-9a-f]{40}$/.test(sha)) {
    return NextResponse.json({ ok: false, error: 'bad_sha' }, { status: 400 });
  }

  try {
    const clean = sanitizeSettings(await settingsAt(sha));
    // نحدّث الملف المحلي أيضاً إن أمكن (يفشل على الاستضافات للقراءة فقط وهذا مقبول)
    try {
      await writeSettings(clean);
    } catch {
      /* تجاهل */
    }
    await commitFiles(
      [{ path: 'data/settings.json', content: Buffer.from(JSON.stringify(clean, null, 2), 'utf8') }],
      `Restore site settings from ${sha.slice(0, 7)}`
    );
    return NextResponse.json({ ok: true, settings: clean });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'restore_failed', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
