// قراءة وكتابة الإعدادات من ملف data/settings.json — للخادم فقط.
import { promises as fs } from 'fs';
import path from 'path';
import { defaultSettings, sanitizeSettings, type Settings } from './settings';
import { createBackup } from './backups.server';
import { githubMode, githubReady, listRepoImages, readRepoSettings, writeRepoSettings } from './github';

const DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DIR, 'settings.json');

export async function readSettings(): Promise<Settings> {
  try {
    const text = await fs.readFile(FILE, 'utf8');
    return sanitizeSettings(JSON.parse(text));
  } catch {
    return defaultSettings;
  }
}

export async function writeSettings(raw: unknown): Promise<Settings> {
  const clean = sanitizeSettings(raw);
  await fs.mkdir(DIR, { recursive: true });
  // نسخة من الوضع الحالي قبل أي تعديل (فشلها لا يمنع الحفظ)
  await createBackup('auto').catch(() => {});
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(clean, null, 2), 'utf8');
  await fs.rename(tmp, FILE);
  return clean;
}

export async function resetSettings(): Promise<Settings> {
  await createBackup('before-reset').catch(() => {});
  try {
    await fs.unlink(FILE);
  } catch {
    /* لا يوجد ملف — لا مشكلة */
  }
  return defaultSettings;
}

// قائمة الصور المتاحة للإضافة في المعرض
export async function listImages(): Promise<string[]> {
  const out: string[] = [];
  const pub = path.join(process.cwd(), 'public');
  for (const sub of ['', 'projects']) {
    try {
      const files = await fs.readdir(path.join(pub, sub));
      for (const f of files) {
        if (/\.(webp|jpe?g|png|avif)$/i.test(f)) out.push(`/${sub ? sub + '/' : ''}${f}`);
      }
    } catch {
      /* المجلد غير موجود */
    }
  }
  return out.sort();
}


// ───────── واجهات اللوحة: تختار الملف المحلي أو GitHub حسب الوضع ─────────
export async function readSettingsAdmin(): Promise<Settings> {
  if (githubMode() && githubReady()) return readRepoSettings();
  return readSettings();
}

export async function saveSettingsAdmin(raw: unknown): Promise<Settings> {
  if (githubMode()) {
    if (!githubReady()) throw new Error('GITHUB_TOKEN غير مضبوط في إعدادات Vercel');
    return writeRepoSettings(raw);
  }
  return writeSettings(raw);
}

export async function resetSettingsAdmin(): Promise<Settings> {
  if (githubMode()) {
    if (!githubReady()) throw new Error('GITHUB_TOKEN غير مضبوط في إعدادات Vercel');
    return writeRepoSettings(defaultSettings);
  }
  return resetSettings();
}

export async function listImagesAdmin(): Promise<string[]> {
  if (githubMode() && githubReady()) return listRepoImages();
  return listImages();
}
