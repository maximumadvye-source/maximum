import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, verifyToken } from '@/lib/auth';
import { githubMode, githubReady, switchVersion, versionStatus, type VersionId } from '@/lib/github';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const authed = () => verifyToken(cookies().get(COOKIE)?.value);
const deny = () => NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
const fail = (error: string, e: unknown) =>
  NextResponse.json({ ok: false, error, detail: e instanceof Error ? e.message : String(e) }, { status: 500 });

export async function GET() {
  if (!authed()) return deny();
  if (!githubReady()) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 400 });
  try {
    return NextResponse.json({ ok: true, ...(await versionStatus()) });
  } catch (e) {
    return fail('version_failed', e);
  }
}

const ids: VersionId[] = ['new', 'old', 'sanaa', 'solutions'];

// POST {which: 'new' | 'old' | 'sanaa' | 'solutions'} — ينشر كود النسخة المطلوبة (commit جديد، لا يحذف السجل)
export async function POST(req: Request) {
  if (!authed()) return deny();
  if (!githubReady()) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 400 });
  let which = '';
  try {
    which = String((await req.json())?.which || '');
  } catch {
    /* body غير صالح */
  }
  if (!ids.includes(which as VersionId)) return NextResponse.json({ ok: false, error: 'bad_which' }, { status: 400 });
  if (githubMode() && which !== 'new') {
    return NextResponse.json(
      {
        ok: false,
        error: 'blocked',
        detail: 'النسخ القديمة لا تحتوي لوحة الإدارة، فلو نشرتها من هنا لن تستطيع الرجوع من الهاتف. افعلها من لوحة الكمبيوتر.',
      },
      { status: 400 }
    );
  }
  try {
    return NextResponse.json({ ok: true, ...(await switchVersion(which as VersionId)) });
  } catch (e) {
    return fail('switch_failed', e);
  }
}
