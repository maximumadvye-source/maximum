// نشر الإعدادات والصور إلى مستودع GitHub عبر واجهة Contents API — للخادم فقط.
// Vercel يعيد بناء الموقع تلقائياً عند أي commit على الفرع المربوط.
import { promises as fs } from 'fs';
import path from 'path';

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
