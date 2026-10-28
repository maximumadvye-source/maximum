// قراءة وكتابة الإعدادات من ملف data/settings.json — للخادم فقط.
import { promises as fs } from 'fs';
import path from 'path';
import { defaultSettings, sanitizeSettings, type Settings } from './settings';

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
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(clean, null, 2), 'utf8');
  await fs.rename(tmp, FILE);
  return clean;
}

export async function resetSettings(): Promise<Settings> {
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
