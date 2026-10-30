// نسخ احتياطية محلية لملف الإعدادات: تلقائية قبل كل حفظ، ويدوية بزر. للخادم فقط.
import { promises as fs } from 'fs';
import path from 'path';
import { defaultSettings, sanitizeSettings, type Settings } from './settings';

const DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DIR, 'settings.json');
const BACKUPS = path.join(DIR, 'backups');
const KEEP = 30;

export type BackupKind = 'auto' | 'manual' | 'before-restore' | 'before-reset';
export type BackupInfo = { name: string; kind: string; date: string; size: number };

const NAME_RE = /^settings-\d{8}-\d{6}(?:-\d{1,3})?-(auto|manual|before-restore|before-reset)\.json$/;
export const validBackupName = (n: string) => NAME_RE.test(n);

const stamp = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
};

async function currentText(): Promise<string> {
  try {
    return await fs.readFile(FILE, 'utf8');
  } catch {
    // لا يوجد ملف بعد: الوضع الحالي للموقع هو الإعدادات الافتراضية
    return JSON.stringify(defaultSettings, null, 2);
  }
}

export async function listBackups(): Promise<BackupInfo[]> {
  let files: string[] = [];
  try {
    files = await fs.readdir(BACKUPS);
  } catch {
    return [];
  }
  const out: BackupInfo[] = [];
  for (const name of files) {
    if (!validBackupName(name)) continue;
    try {
      const st = await fs.stat(path.join(BACKUPS, name));
      out.push({ name, kind: name.match(NAME_RE)![1], date: st.mtime.toISOString(), size: st.size });
    } catch {
      /* تجاهل */
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || (a.name < b.name ? 1 : -1));
}

/** ينشئ نسخة من الوضع الحالي. التلقائية لا تُكرَّر إن كانت مطابقة لآخر نسخة. */
export async function createBackup(kind: BackupKind): Promise<string | null> {
  const text = await currentText();
  const list = await listBackups();
  if (kind === 'auto' && list[0]) {
    try {
      const last = await fs.readFile(path.join(BACKUPS, list[0].name), 'utf8');
      if (last === text) return null;
    } catch {
      /* تابع */
    }
  }
  await fs.mkdir(BACKUPS, { recursive: true });
  const base = `settings-${stamp()}`;
  const taken = new Set(list.map((b) => b.name));
  let name = `${base}-${kind}.json`;
  for (let i = 2; taken.has(name); i++) name = `${base}-${i}-${kind}.json`;
  await fs.writeFile(path.join(BACKUPS, name), text, 'utf8');
  // الإبقاء على آخر KEEP نسخة (اليدوية لا تُحذف تلقائياً)
  const all = await listBackups();
  const removable = all.filter((b) => b.kind !== 'manual').slice(KEEP);
  for (const b of removable) await fs.unlink(path.join(BACKUPS, b.name)).catch(() => {});
  return name;
}

export async function readBackup(name: string): Promise<Settings> {
  if (!validBackupName(name)) throw new Error('bad_name');
  const text = await fs.readFile(path.join(BACKUPS, name), 'utf8');
  return sanitizeSettings(JSON.parse(text));
}

export async function readBackupText(name: string): Promise<string> {
  if (!validBackupName(name)) throw new Error('bad_name');
  return fs.readFile(path.join(BACKUPS, name), 'utf8');
}
