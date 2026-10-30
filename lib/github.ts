// نشر الإعدادات والصور إلى مستودع GitHub عبر واجهة Contents API — للخادم فقط.
// Vercel يعيد بناء الموقع تلقائياً عند أي commit على الفرع المربوط.
import { promises as fs } from 'fs';
import path from 'path';
import { defaultSettings, sanitizeSettings, type Settings } from './settings';

const API = process.env.GITHUB_API_URL || 'https://api.github.com';

export const githubConfig = () => ({
  token: process.env.GITHUB_TOKEN || '',
  repo: process.env.GITHUB_REPO || 'maximumadvye-source/maximum',
  branch: process.env.GITHUB_BRANCH || 'main',
});

export const githubReady = () => githubConfig().token.length > 10;

async function gh(pathname: string, init: RequestInit = {}) {
  const { token } = githubConfig();
  return fetch(`${API}${pathname}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

const enc = (p: string) => p.split('/').map(encodeURIComponent).join('/');

async function ghJson(pathname: string, init: RequestInit = {}) {
  const r = await gh(pathname, init);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    const hint = r.status === 401 || r.status === 403 || r.status === 404 ? ' — تحقق من الرمز وصلاحية Contents ومن اسم المستودع' : '';
    throw new Error(`GitHub ${r.status}: ${j.message || 'فشل الطلب'}${hint}`);
  }
  return j;
}

/** هل الملف موجود في المستودع؟ */
export async function existsInRepo(repoPath: string) {
  const { repo, branch } = githubConfig();
  const r = await gh(`/repos/${repo}/contents/${enc(repoPath)}?ref=${encodeURIComponent(branch)}`);
  if (r.status === 404) return false;
  if (!r.ok) throw new Error(`GitHub ${r.status}: تعذّر الوصول إلى المستودع (تحقق من الرمز واسم المستودع)`);
  return true;
}

/** commit واحد يضم كل الملفات (فيُبنى الموقع على Vercel مرة واحدة فقط) */
export async function commitFiles(files: { path: string; content: Buffer }[], message: string) {
  const { repo, branch } = githubConfig();
  const ref = await ghJson(`/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  const parent: string = ref.object.sha;
  const parentCommit = await ghJson(`/repos/${repo}/git/commits/${parent}`);

  const tree: { path: string; mode: string; type: string; sha: string }[] = [];
  for (const f of files) {
    const blob = await ghJson(`/repos/${repo}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: f.content.toString('base64'), encoding: 'base64' }),
    });
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const newTree = await ghJson(`/repos/${repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: parentCommit.tree.sha, tree }),
  });
  const commit = await ghJson(`/repos/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTree.sha, parents: [parent] }),
  });
  await ghJson(`/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  });
  return commit.sha as string;
}

/** الصور المحلية المستخدمة في المعرض والمفقودة من المستودع */
export async function collectMissingImages(srcs: string[]) {
  const out: { path: string; content: Buffer; src: string }[] = [];
  for (const src of new Set(srcs)) {
    if (!src.startsWith('/') || src.includes('..')) continue;
    const rel = `public${src}`;
    let buf: Buffer;
    try {
      buf = await fs.readFile(path.join(process.cwd(), rel));
    } catch {
      continue; // الصورة غير موجودة محلياً
    }
    if (buf.length > 20 * 1024 * 1024) continue;
    if (await existsInRepo(rel)) continue;
    out.push({ path: rel, content: buf, src });
  }
  return out;
}

export async function lastCommit() {
  const { repo, branch } = githubConfig();
  const r = await gh(`/repos/${repo}/commits/${encodeURIComponent(branch)}`);
  if (!r.ok) return null;
  const j = await r.json();
  return {
    message: String(j.commit?.message || '').split('\n')[0],
    date: String(j.commit?.committer?.date || ''),
  };
}

/** آخر النسخ المنشورة من ملف الإعدادات (كل commit غيّر data/settings.json) */
export async function settingsHistory(limit = 15) {
  const { repo, branch } = githubConfig();
  const list = await ghJson(
    `/repos/${repo}/commits?sha=${encodeURIComponent(branch)}&path=${encodeURIComponent('data/settings.json')}&per_page=${limit}`
  );
  return (Array.isArray(list) ? list : []).map((c: any) => ({
    sha: String(c.sha),
    message: String(c.commit?.message || '').split('\n')[0],
    date: String(c.commit?.committer?.date || ''),
  }));
}

/** محتوى data/settings.json كما كان عند commit معيّن */
export async function settingsAt(sha: string): Promise<unknown> {
  const { repo } = githubConfig();
  const j = await ghJson(`/repos/${repo}/contents/${enc('data/settings.json')}?ref=${encodeURIComponent(sha)}`);
  const text = Buffer.from(String(j.content || ''), 'base64').toString('utf8');
  return JSON.parse(text);
}

// ───────── تبديل نسخة الموقع (الكود) ─────────
// new       = التصميم الجديد (ADAMOMER) — يُسجَّل commit العودة تلقائياً عند التبديل منه
// old       = commit الموقع الذي كان على Vercel قبل التصميم الجديد (يمكن تغييره بـ GITHUB_OLD_SHA)
// sanaa     = نسخة «كهربائي صنعاء»، محفوظة داخل المستودع في المجلد versions/sanaa
// solutions = نسخة «حلول كهربائية – صنعاء»، محفوظة داخل المستودع في المجلد versions/solutions
export type VersionId = 'new' | 'old' | 'sanaa' | 'solutions';
export const VERSION_LABELS: Record<VersionId, string> = {
  new: 'التصميم الجديد (ADAMOMER)',
  old: 'النسخة القديمة (حلول كهربائية متكاملة)',
  sanaa: 'كهربائي صنعاء',
  solutions: 'حلول كهربائية – صنعاء',
};
export const OLD_SHA = () => process.env.GITHUB_OLD_SHA || '71e09c7';
const NEW_FALLBACK_SHA = () => process.env.GITHUB_NEW_SHA || 'a0f87a7';
// النسخ المحفوظة داخل المستودع: المعرّف ← مجلد اللقطة
const VERSION_DIRS: Partial<Record<VersionId, string>> = {
  sanaa: 'versions/sanaa/',
  solutions: 'versions/solutions/',
};
const KEEP_RE = /^(data\/|public\/projects\/|versions\/)/; // تبقى كما هي في كل النسخ (الإعدادات وصور المعرض والنسخ المحفوظة)
const PREV_RE = /\[prev:([0-9a-f]{40})\]/;

type Blob = { path: string; mode: string; type: string; sha: string };

async function resolveCommit(ref: string) {
  const { repo } = githubConfig();
  const c = await ghJson(`/repos/${repo}/commits/${encodeURIComponent(ref)}`);
  return { sha: String(c.sha), treeSha: String(c.commit.tree.sha), message: String(c.commit?.message || '') };
}

async function blobsOf(treeSha: string): Promise<Blob[]> {
  const { repo } = githubConfig();
  const t = await ghJson(`/repos/${repo}/git/trees/${treeSha}?recursive=1`);
  if (t.truncated) throw new Error('شجرة الملفات كبيرة جداً لهذه العملية');
  return (t.tree as Blob[]).filter((e) => e.type === 'blob' && e.mode !== '160000');
}

const shaOf = (blobs: Blob[], p: string) => blobs.find((b) => b.path === p)?.sha;

function detect(blobs: Blob[]): VersionId {
  if (blobs.some((b) => b.path === 'app/admin/page.tsx')) return 'new';
  const rootPage = shaOf(blobs, 'app/page.tsx');
  if (rootPage) {
    for (const [id, dir] of Object.entries(VERSION_DIRS)) {
      if (rootPage === shaOf(blobs, `${dir}app/page.tsx`)) return id as VersionId;
    }
  }
  return 'old';
}

/** أي نسخة منشورة الآن؟ وأي النسخ المحفوظة متاحة في المستودع؟ */
export async function versionStatus() {
  const { branch } = githubConfig();
  const head = await resolveCommit(branch);
  const blobs = await blobsOf(head.treeSha);
  const available: Record<string, boolean> = {};
  for (const [id, dir] of Object.entries(VERSION_DIRS)) available[id] = !!shaOf(blobs, `${dir}app/page.tsx`);
  return { version: detect(blobs), available };
}

export async function currentVersion(): Promise<VersionId> {
  return (await versionStatus()).version;
}

async function lastPrev(): Promise<string> {
  const { repo, branch } = githubConfig();
  const list = await ghJson(`/repos/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=50`);
  for (const c of Array.isArray(list) ? list : []) {
    const m = String(c.commit?.message || '').match(PREV_RE);
    if (m) return m[1];
  }
  return '';
}

/** يضيف versions إلى exclude في tsconfig حتى لا يفحص TypeScript النسخ المحفوظة أثناء البناء */
async function patchTsconfig(entries: { path: string; mode: string; type: string; sha: string }[]) {
  const { repo } = githubConfig();
  const i = entries.findIndex((e) => e.path === 'tsconfig.json');
  if (i < 0) return;
  const blob = await ghJson(`/repos/${repo}/git/blobs/${entries[i].sha}`);
  const text = Buffer.from(String(blob.content || ''), 'base64').toString('utf8');
  if (text.includes('"versions"') || !/"exclude"\s*:\s*\[/.test(text)) return;
  const patched = text.replace(/("exclude"\s*:\s*\[)/, '$1\n    "versions",');
  const nb = await ghJson(`/repos/${repo}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({ content: Buffer.from(patched, 'utf8').toString('base64'), encoding: 'base64' }),
  });
  entries[i] = { ...entries[i], sha: String(nb.sha) };
}

export async function switchVersion(which: VersionId) {
  const { repo, branch } = githubConfig();
  const head = await resolveCommit(branch);
  const headBlobs = await blobsOf(head.treeSha);
  const current = detect(headBlobs);
  if (current === which) throw new Error(`«${VERSION_LABELS[which]}» منشورة بالفعل`);

  let targetBlobs: Blob[];
  let targetSha = '';
  let message: string;

  if (which === 'old') {
    const target = await resolveCommit(OLD_SHA());
    targetSha = target.sha;
    targetBlobs = await blobsOf(target.treeSha);
  } else {
    const dir = VERSION_DIRS[which];
    if (dir) {
      const src = headBlobs.filter((b) => b.path.startsWith(dir));
      if (!src.length) {
        throw new Error(
          `نسخة «${VERSION_LABELS[which]}» غير موجودة في المستودع بعد. ارفع المجلد ${dir} أولاً (git add ثم commit ثم push).`
        );
      }
      targetBlobs = src.map((b) => ({ ...b, path: b.path.slice(dir.length) }));
    } else {
      const prev = (await lastPrev()) || NEW_FALLBACK_SHA();
      const target = await resolveCommit(prev);
      targetSha = target.sha;
      targetBlobs = await blobsOf(target.treeSha);
    }
  }

  // نحفظ commit التصميم الجديد في رسالة التبديل ليعود إليه الزر لاحقاً (حتى لو مررنا بنسخ أخرى)
  if (which === 'new') {
    message = `Switch site to new design [from:${targetSha.slice(0, 7)}]`;
  } else {
    const prevToKeep = current === 'new' ? head.sha : await lastPrev();
    message = `Switch site to ${which} version${prevToKeep ? ` [prev:${prevToKeep}]` : ''}`;
  }

  const keep = headBlobs.filter((b) => KEEP_RE.test(b.path));
  const keepPaths = new Set(keep.map((b) => b.path));
  const entries = [...targetBlobs.filter((b) => !keepPaths.has(b.path)), ...keep].map((b) => ({
    path: b.path,
    mode: b.mode,
    type: 'blob',
    sha: b.sha,
  }));
  await patchTsconfig(entries);

  const tree = await ghJson(`/repos/${repo}/git/trees`, { method: 'POST', body: JSON.stringify({ tree: entries }) });
  const commit = await ghJson(`/repos/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [head.sha] }),
  });
  await ghJson(`/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  });
  return { version: which, from: current };
}

// ───────── وضع «GitHub كمخزن»: للتشغيل على Vercel (نظام ملفاته للقراءة فقط) ─────────
/** هل تُحفظ الإعدادات في GitHub بدل ملف محلي؟ تلقائي على Vercel، أو بـ SETTINGS_STORE=github */
export const githubMode = () =>
  process.env.SETTINGS_STORE === 'github' || (process.env.VERCEL === '1' && process.env.SETTINGS_STORE !== 'file');

/** آخر إعدادات منشورة في المستودع (وليس نسخة النشر القديمة المضمّنة) */
export async function readRepoSettings(): Promise<Settings> {
  const { repo, branch } = githubConfig();
  const r = await gh(`/repos/${repo}/contents/${enc('data/settings.json')}?ref=${encodeURIComponent(branch)}`);
  if (r.status === 404) return defaultSettings;
  if (!r.ok) throw new Error(`GitHub ${r.status}: تعذّر قراءة الإعدادات من المستودع`);
  const j = await r.json();
  const text = Buffer.from(String(j.content || ''), 'base64').toString('utf8');
  return sanitizeSettings(JSON.parse(text));
}

export async function writeRepoSettings(raw: unknown): Promise<Settings> {
  const clean = sanitizeSettings(raw);
  await commitFiles(
    [{ path: 'data/settings.json', content: Buffer.from(JSON.stringify(clean, null, 2), 'utf8') }],
    'Update site settings from admin panel'
  );
  return clean;
}

/** الصور المتاحة في المستودع (public/ و public/projects/) */
export async function listRepoImages(): Promise<string[]> {
  const { branch } = githubConfig();
  const head = await resolveCommit(branch);
  const blobs = await blobsOf(head.treeSha);
  return blobs
    .map((b) => b.path)
    .filter((p) => /^public\/(projects\/)?[^/]+\.(webp|jpe?g|png|avif)$/i.test(p))
    .map((p) => p.replace(/^public/, ''))
    .sort();
}
