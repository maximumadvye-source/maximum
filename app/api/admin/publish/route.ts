import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE, verifyToken } from '@/lib/auth';
import { readSettings } from '@/lib/settings.server';
import { collectMissingImages, commitFiles, githubConfig, githubMode, githubReady, lastCommit } from '@/lib/github';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const authed = () => verifyToken(cookies().get(COOKIE)?.value);
const deny = () => NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

// حالة النشر: هل الرمز مضبوط؟ وما آخر commit؟
export async function GET() {
  if (!authed()) return deny();
  const { repo, branch } = githubConfig();
  if (!githubReady()) return NextResponse.json({ ok: true, configured: false, repo, branch });
  let commit = null;
  try {
    commit = await lastCommit();
  } catch {
    /* تجاهل */
  }
  return NextResponse.json({ ok: true, configured: true, repo, branch, commit });
}

// حفظ ونشر: يرفع الصور الجديدة ثم data/settings.json
export async function POST() {
  if (!authed()) return deny();
  if (!githubReady()) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 400 });
  }
  // على Vercel تُنشر الإعدادات عند الحفظ نفسه، فلا يوجد شيء إضافي لنرسله
  if (githubMode()) return NextResponse.json({ ok: true, images: [], already: true });
  try {
    const s = await readSettings();
    const imgs = await collectMissingImages(s.projects.map((p) => p.src));
    await commitFiles(
      [
        ...imgs.map(({ path, content }) => ({ path, content })),
        { path: 'data/settings.json', content: Buffer.from(JSON.stringify(s, null, 2), 'utf8') },
      ],
      'Update site settings from admin panel'
    );
    const images = imgs.map((i) => i.src);
    return NextResponse.json({ ok: true, images });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'publish_failed', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
