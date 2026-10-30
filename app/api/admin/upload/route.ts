import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { promises as fs } from 'fs';
import path from 'path';
import { COOKIE, verifyToken } from '@/lib/auth';
import { commitFiles, githubMode, githubReady } from '@/lib/github';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_BYTES = 3.5 * 1024 * 1024; // حد Vercel للطلب ~4.5MB، والصور تُضغط في المتصفح قبل الرفع

function kind(b: Buffer): 'webp' | 'jpg' | 'png' | null {
  if (b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.length > 8 && b[0] === 0x89 && b.toString('ascii', 1, 4) === 'PNG') return 'png';
  return null;
}

// POST {data: base64} — يحفظ الصورة في public/projects (محلياً)، أو يرسلها إلى GitHub عند التشغيل على Vercel
export async function POST(req: Request) {
  if (!verifyToken(cookies().get(COOKIE)?.value)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  let data = '';
  try {
    data = String((await req.json())?.data || '');
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_body' }, { status: 400 });
  }
  const buf = Buffer.from(data.replace(/^data:[^,]*,/, ''), 'base64');
  if (!buf.length || buf.length > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: 'bad_size', detail: 'حجم الصورة غير مناسب' }, { status: 400 });
  }
  const ext = kind(buf);
  if (!ext) return NextResponse.json({ ok: false, error: 'bad_type', detail: 'نوع الملف غير مدعوم' }, { status: 400 });

  // الاسم يُولَّد في الخادم فقط (لا نثق باسم من العميل)
  const name = `upload-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  try {
    if (githubMode()) {
      if (!githubReady()) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 400 });
      await commitFiles([{ path: `public/projects/${name}`, content: buf }], `Add image ${name} from admin panel`);
    } else {
      const dir = path.join(process.cwd(), 'public', 'projects');
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, name), buf);
    }
    return NextResponse.json({ ok: true, src: `/projects/${name}` });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'upload_failed', detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
