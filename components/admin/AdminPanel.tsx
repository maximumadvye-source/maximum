'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  categoryLabels,
  iconLabels,
  iconNames,
  sanitizeSettings,
  sectionIds,
  sectionMeta,
  type SectionId,
  type Settings,
  type Theme,
} from '@/lib/settings';
import type { IconName, ProjectCategory } from '@/lib/site';

/* ───────── أدوات واجهة صغيرة ───────── */

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20';

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-sm font-semibold text-slate-700"
    >
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}>
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'right-0.5' : 'right-[1.375rem]'}`}
        />
      </span>
      {label}
    </button>
  );
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

function IconBtn({ onClick, disabled, title, children }: { onClick: () => void; disabled?: boolean; title: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function move<T>(arr: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

/* ───────── مفتاح الخلفية: قديمة / جديدة ───────── */
function ThemeToggle({ value, onChange }: { value: Theme; onChange: (t: Theme) => void }) {
  const opts: { id: Theme; label: string; swatch: string }[] = [
    { id: 'old', label: 'الخلفية القديمة', swatch: 'linear-gradient(135deg,#070b14 55%,#00b4ff 56%,#ffc233)' },
    { id: 'new', label: 'الخلفية الجديدة', swatch: 'linear-gradient(135deg,#fbfaf7 55%,#1025c8 56%,#ff7a1a)' },
  ];
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="اختيار الخلفية">
      {opts.map((o) => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold transition ${on ? 'border-blue-700 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
          >
            <span className="h-6 w-6 shrink-0 rounded-md border border-slate-300" style={{ background: o.swatch }} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

type Tab = 'look' | 'hero' | 'services' | 'projects' | 'steps' | 'contact' | 'publish' | 'data';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'look', label: 'المظهر والأقسام', icon: '🎨' },
  { id: 'hero', label: 'الواجهة الرئيسية', icon: '⚡' },
  { id: 'services', label: 'الخدمات', icon: '🛠️' },
  { id: 'projects', label: 'أعمالنا', icon: '🖼️' },
  { id: 'steps', label: 'آلية العمل', icon: '📋' },
  { id: 'contact', label: 'معلومات التواصل', icon: '📞' },
  { id: 'publish', label: 'النشر', icon: '🚀' },
  { id: 'data', label: 'النسخ والاستعادة', icon: '💾' },
];

export default function AdminPanel({ initial, mode = 'file' }: { initial: Settings; mode?: 'file' | 'github' }) {
  const remote = mode === 'github';
  const router = useRouter();
  const [s, setS] = useState<Settings>(initial);
  const [tab, setTab] = useState<Tab>('look');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [preview, setPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [pick, setPick] = useState('');
  const [pub, setPub] = useState<{ configured: boolean; repo: string; branch: string; commit?: { message: string; date: string } | null } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [pubMsg, setPubMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<{ sha: string; message: string; date: string }[] | null>(null);
  const [histBusy, setHistBusy] = useState(false);
  const [confirmSha, setConfirmSha] = useState('');
  const [restoring, setRestoring] = useState('');
  type VerId = 'new' | 'old' | 'sanaa' | 'solutions';
  const [ver, setVer] = useState<VerId | null>(null);
  // أي النسخ المحفوظة موجودة فعلاً في المستودع (versions/sanaa و versions/solutions)
  const [ready, setReady] = useState<Record<string, boolean>>({ sanaa: true, solutions: true });
  const [verBusy, setVerBusy] = useState(false);
  const [verConfirm, setVerConfirm] = useState<VerId | ''>('');
  type Bk = { name: string; kind: string; date: string; size: number };
  const [backups, setBackups] = useState<Bk[] | null>(null);
  const [bkBusy, setBkBusy] = useState(false);
  const [bkConfirm, setBkConfirm] = useState('');
  const [bkMsg, setBkMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const patch = useCallback((fn: (d: Settings) => void) => {
    setS((prev) => {
      const d = structuredClone(prev);
      fn(d);
      return d;
    });
    setDirty(true);
    setMsg(null);
  }, []);

  // تحذير عند مغادرة الصفحة بتغييرات غير محفوظة
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  // الصور المتاحة للإضافة
  useEffect(() => {
    if (tab !== 'projects') return;
    fetch('/api/admin/images')
      .then((r) => r.json())
      .then((j) => j?.ok && setImages(j.images))
      .catch(() => { });
  }, [tab]);

  const unused = useMemo(() => {
    const used = new Set(s.projects.map((p) => p.src));
    return images.filter((i) => !used.has(i));
  }, [images, s.projects]);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        setS(j.settings);
        setDirty(false);
        setPreviewKey((k) => k + 1);
        setMsg({
          ok: true,
          text: remote
            ? 'تم الحفظ والنشر على GitHub ✓ — يعيد Vercel بناء الموقع، وتظهر التغييرات خلال دقيقة تقريباً'
            : 'تم الحفظ ✓ — التغييرات ظاهرة الآن في الموقع',
        });
      } else if (res.status === 401) {
        setMsg({ ok: false, text: 'انتهت الجلسة، حدّث الصفحة وسجّل الدخول من جديد' });
      } else if (j.error === 'write_failed') {
        setMsg({
          ok: false,
          text: 'تعذّرت الكتابة على ملف الإعدادات. إن كان الموقع على Vercel فالحفظ غير مدعوم هناك (الملفات للقراءة فقط) — شغّله على جهازك أو على خادم عادي.',
        });
      } else {
        setMsg({ ok: false, text: 'فشل الحفظ' });
      }
    } catch {
      setMsg({ ok: false, text: 'تعذّر الاتصال بالخادم' });
    } finally {
      setSaving(false);
    }
  };

  const loadPub = useCallback(() => {
    fetch('/api/admin/publish')
      .then((r) => r.json())
      .then((j) => j?.ok && setPub(j))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (tab === 'publish') loadPub();
  }, [tab, loadPub]);

  const publish = async () => {
    setPublishing(true);
    setPubMsg(null);
    try {
      if (dirty) {
        const sr = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(s),
        });
        const sj = await sr.json().catch(() => ({}));
        if (!sr.ok || !sj.ok) {
          setPubMsg({ ok: false, text: 'تعذّر حفظ التغييرات محلياً قبل النشر' });
          return;
        }
        setS(sj.settings);
        setDirty(false);
        setPreviewKey((k) => k + 1);
      }
      const res = await fetch('/api/admin/publish', { method: 'POST' });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        const n = Array.isArray(j.images) ? j.images.length : 0;
        setPubMsg({
          ok: true,
          text: remote
            ? 'كل تعديلاتك منشورة على GitHub ✓ — Vercel يبني الموقع (دقيقة تقريباً).'
            : `تم الإرسال إلى GitHub ✓${n ? ` (مع ${n} صورة جديدة)` : ''} — Vercel يعيد بناء الموقع الآن وسيظهر التحديث خلال دقيقة تقريباً.`,
        });
        loadPub();
      } else if (j.error === 'not_configured') {
        setPubMsg({ ok: false, text: 'لم يُضبط GITHUB_TOKEN في .env.local بعد' });
      } else if (res.status === 401) {
        setPubMsg({ ok: false, text: 'انتهت الجلسة، حدّث الصفحة وسجّل الدخول من جديد' });
      } else {
        setPubMsg({ ok: false, text: j.detail || 'فشل النشر' });
      }
    } catch {
      setPubMsg({ ok: false, text: 'تعذّر الاتصال بالخادم' });
    } finally {
      setPublishing(false);
    }
  };

  const loadVersion = useCallback(() => {
    fetch('/api/admin/publish/version')
      .then((r) => r.json())
      .then((j) => {
        if (!j?.ok) return;
        setVer(j.version);
        setReady({ sanaa: !!j.available?.sanaa, solutions: !!j.available?.solutions });
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (tab === 'publish' && pub?.configured) loadVersion();
  }, [tab, pub?.configured, loadVersion]);

  const verLabel: Record<VerId, string> = {
    new: 'التصميم الجديد (ADAMOMER)',
    old: 'النسخة القديمة (حلول كهربائية متكاملة)',
    sanaa: 'كهربائي صنعاء',
    solutions: 'حلول كهربائية – صنعاء',
  };

  const switchVer = async (which: VerId) => {
    setVerBusy(true);
    setPubMsg(null);
    try {
      const r = await fetch('/api/admin/publish/version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ which }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setVer(which);
        setVerConfirm('');
        loadPub();
        setPubMsg({
          ok: true,
          text: `تم نشر «${verLabel[which]}» على GitHub ✓ — يعيد Vercel بناء الموقع الآن (من دقيقة إلى ثلاث).`,
        });
      } else {
        setPubMsg({ ok: false, text: j.detail || 'فشل تبديل النسخة' });
      }
    } catch {
      setPubMsg({ ok: false, text: 'تعذّر الاتصال بالخادم' });
    } finally {
      setVerBusy(false);
    }
  };

  const loadHistory = async () => {
    setHistBusy(true);
    setPubMsg(null);
    try {
      const r = await fetch('/api/admin/publish/history');
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) setHistory(j.items);
      else setPubMsg({ ok: false, text: j.detail || 'تعذّر تحميل النسخ السابقة' });
    } catch {
      setPubMsg({ ok: false, text: 'تعذّر الاتصال بالخادم' });
    } finally {
      setHistBusy(false);
    }
  };

  const restore = async (sha: string) => {
    setRestoring(sha);
    setPubMsg(null);
    try {
      const r = await fetch('/api/admin/publish/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sha }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setS(j.settings);
        setDirty(false);
        setPreviewKey((k) => k + 1);
        setConfirmSha('');
        setPubMsg({ ok: true, text: 'تم استرجاع النسخة ونشرها ✓ — يعيد Vercel بناء الموقع الآن (دقيقة تقريباً).' });
        loadPub();
        loadHistory();
      } else {
        setPubMsg({ ok: false, text: j.detail || 'فشل الاسترجاع' });
      }
    } catch {
      setPubMsg({ ok: false, text: 'تعذّر الاتصال بالخادم' });
    } finally {
      setRestoring('');
    }
  };

  const loadBackups = useCallback(() => {
    fetch('/api/admin/backups')
      .then((r) => r.json())
      .then((j) => j?.ok && setBackups(j.items))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (tab === 'data') loadBackups();
  }, [tab, loadBackups]);

  const backupNow = async () => {
    setBkBusy(true);
    setBkMsg(null);
    try {
      const r = await fetch('/api/admin/backups', { method: 'POST' });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setBackups(j.items);
        setBkMsg({ ok: true, text: 'تم حفظ نسخة احتياطية من الوضع الحالي ✓' });
      } else setBkMsg({ ok: false, text: j.detail || 'تعذّر إنشاء النسخة' });
    } catch {
      setBkMsg({ ok: false, text: 'تعذّر الاتصال بالخادم' });
    } finally {
      setBkBusy(false);
    }
  };

  const restoreBackup = async (name: string) => {
    setBkBusy(true);
    setBkMsg(null);
    try {
      const r = await fetch('/api/admin/backups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) {
        setS(j.settings);
        setDirty(false);
        setBackups(j.items);
        setBkConfirm('');
        setPreviewKey((k) => k + 1);
        setBkMsg({ ok: true, text: 'تم استرجاع النسخة محلياً ✓ — لتظهر على الموقع الحي اذهب إلى «النشر» واضغط «حفظ ونشر».' });
      } else setBkMsg({ ok: false, text: j.detail || 'فشل الاسترجاع' });
    } catch {
      setBkMsg({ ok: false, text: 'تعذّر الاتصال بالخادم' });
    } finally {
      setBkBusy(false);
    }
  };

  const kindLabel: Record<string, string> = {
    auto: 'تلقائية قبل حفظ',
    manual: 'يدوية',
    'before-restore': 'قبل استرجاع',
    'before-reset': 'قبل إعادة الضبط',
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  };

  const resetAll = async () => {
    if (!window.confirm('سيُرجَع كل شيء للإعدادات الأصلية (ويُحذف ملف الإعدادات). متأكد؟')) return;
    const res = await fetch('/api/admin/settings', { method: 'DELETE' });
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.ok) {
      setS(j.settings);
      setDirty(false);
      setPreviewKey((k) => k + 1);
      setMsg({ ok: true, text: 'تمت استعادة الإعدادات الأصلية' });
    } else {
      setMsg({ ok: false, text: 'تعذّرت الاستعادة' });
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `site-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      setS(sanitizeSettings(data));
      setDirty(true);
      setMsg({ ok: true, text: 'تم استيراد الملف — اضغط «حفظ التغييرات» لتطبيقه' });
    } catch {
      setMsg({ ok: false, text: 'الملف غير صالح' });
    }
  };

  const addProject = () => {
    if (!pick) return;
    const src = pick;
    const img = new window.Image();
    img.onload = () => {
      patch((d) => {
        d.projects.unshift({
          src,
          title: 'عمل جديد',
          caption: '',
          width: img.naturalWidth || 1200,
          height: img.naturalHeight || 900,
          category: src.includes('power') ? 'power' : 'lighting',
          visible: true,
        });
      });
      setPick('');
    };
    img.onerror = () => setMsg({ ok: false, text: 'تعذّر قراءة الصورة' });
    img.src = src;
  };

  // رفع صور من الهاتف: تُصغَّر وتُضغط في المتصفح ثم تُرفع وتُضاف إلى المعرض
  const [uploading, setUploading] = useState('');
  const shrink = (file: File): Promise<{ b64: string; w: number; h: number }> =>
    new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        const max = 1600;
        const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * k));
        const h = Math.max(1, Math.round(img.naturalHeight * k));
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        c.getContext('2d')!.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        const finish = (blob: Blob | null) => {
          if (!blob) return reject(new Error('compress'));
          const fr = new FileReader();
          fr.onload = () => resolve({ b64: String(fr.result), w, h });
          fr.onerror = () => reject(new Error('read'));
          fr.readAsDataURL(blob);
        };
        c.toBlob((b) => {
          // بعض الأجهزة (iOS القديم) لا تدعم WebP في الترميز فتعيد PNG، فنستعمل JPEG
          if (b && b.type === 'image/webp') finish(b);
          else c.toBlob(finish, 'image/jpeg', 0.85);
        }, 'image/webp', 0.82);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('load'));
      };
      img.src = url;
    });

  const uploadFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setMsg(null);
    let ok = 0;
    let failed = 0;
    for (let n = 0; n < files.length; n++) {
      setUploading(`جارٍ رفع الصورة ${n + 1} من ${files.length}…`);
      try {
        const { b64, w, h } = await shrink(files[n]);
        const r = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: b64 }),
        });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.ok) {
          patch((d) => {
            d.projects.unshift({ src: j.src, title: 'عمل جديد', caption: '', width: w, height: h, category: 'lighting', visible: true });
          });
          ok++;
        } else failed++;
      } catch {
        failed++;
      }
    }
    setUploading('');
    setMsg({
      ok: failed === 0,
      text: `${ok ? `تم رفع ${ok} صورة وإضافتها أول المعرض. عدّل عنوانها ثم اضغط «حفظ التغييرات»` : ''}${failed ? ` — تعذّر رفع ${failed}` : ''}`.replace(/^ — /, ''),
    });
  };

  const setAllThemes = (t: Theme) =>
    patch((d) => {
      for (const id of sectionIds) d.sections[id].theme = t;
    });

  const countOld = sectionIds.filter((id) => s.sections[id].theme === 'old').length;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 text-slate-900">
      {/* الشريط العلوي */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 text-lg text-amber-300">⚡</span>
            <div>
              <h1 className="text-base font-extrabold leading-tight">لوحة إدارة الموقع</h1>
              <p className="text-xs text-slate-500">آدم بن عمر للكهرباء</p>
            </div>
          </div>

          <div className="ms-auto flex flex-wrap items-center gap-2">
            {dirty && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">تغييرات غير محفوظة</span>}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              فتح الموقع ↗
            </a>
            <button
              type="button"
              onClick={() => setPreview((v) => !v)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              {preview ? 'إخفاء المعاينة' : 'معاينة مباشرة'}
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving || !dirty}
              className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-40"
            >
              {saving ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
            </button>
            <button type="button" onClick={logout} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:text-red-600">
              خروج
            </button>
          </div>
        </div>
        {msg && (
          <div className={`px-4 py-2 text-center text-sm font-semibold ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
            {msg.text}
          </div>
        )}
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[220px_1fr]">
        {/* القائمة الجانبية */}
        <nav aria-label="أقسام اللوحة" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-start text-sm font-bold transition ${tab === t.id ? 'bg-blue-700 text-white shadow' : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
            >
              <span aria-hidden="true">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 space-y-5">
          {/* ───── المظهر والأقسام ───── */}
          {tab === 'look' && (
            <>
              <Card>
                <h2 className="text-lg font-extrabold">الخلفية لكل ميزة</h2>
                <p className="mt-1 text-sm text-slate-600">
                  لكل قسم زر خاص يبدّل بين <b>الخلفية القديمة</b> (داكنة كهربائية) و<b>الخلفية الجديدة</b> (كريمية بألوان ماكسيمم).
                  يمكنك الجمع بين الخلفيتين في الصفحة نفسها.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setAllThemes('old')} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">
                    تطبيق القديمة على الكل
                  </button>
                  <button type="button" onClick={() => setAllThemes('new')} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold hover:bg-slate-50">
                    تطبيق الجديدة على الكل
                  </button>
                  <span className="text-xs text-slate-500">
                    الحالي: {countOld} قديمة · {sectionIds.length - countOld} جديدة
                  </span>
                </div>
              </Card>

              {sectionIds.map((id: SectionId) => {
                const m = sectionMeta[id];
                const sec = s.sections[id];
                return (
                  <Card key={id} className={sec.visible ? '' : 'opacity-70'}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold">{m.label}</h3>
                        <p className="text-xs text-slate-500">{m.hint}</p>
                      </div>
                      {m.hideable ? (
                        <Switch
                          checked={sec.visible}
                          onChange={(v) => patch((d) => void (d.sections[id].visible = v))}
                          label={sec.visible ? 'ظاهر في الموقع' : 'مخفي'}
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">ظاهر دائماً</span>
                      )}
                    </div>
                    <div className="mt-4">
                      <ThemeToggle value={sec.theme} onChange={(t) => patch((d) => void (d.sections[id].theme = t))} />
                    </div>
                  </Card>
                );
              })}
            </>
          )}

          {/* ───── الواجهة الرئيسية ───── */}
          {tab === 'hero' && (
            <Card className="space-y-4">
              <h2 className="text-lg font-extrabold">نصوص الواجهة الرئيسية</h2>
              <Field label="الشارة الصغيرة أعلى العنوان">
                <input className={inputCls} value={s.hero.badge} onChange={(e) => patch((d) => void (d.hero.badge = e.target.value))} />
              </Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="الجزء الملوّن من العنوان" hint="يظهر بتدرّج لوني">
                  <input className={inputCls} value={s.hero.accent} onChange={(e) => patch((d) => void (d.hero.accent = e.target.value))} />
                </Field>
                <Field label="بقية العنوان">
                  <input className={inputCls} value={s.hero.rest} onChange={(e) => patch((d) => void (d.hero.rest = e.target.value))} />
                </Field>
              </div>
              <Field label="الوصف تحت العنوان">
                <textarea rows={3} className={inputCls} value={s.hero.subtitle} onChange={(e) => patch((d) => void (d.hero.subtitle = e.target.value))} />
              </Field>
            </Card>
          )}

          {/* ───── الخدمات ───── */}
          {tab === 'services' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold">الخدمات ({s.services.length})</h2>
                <button
                  type="button"
                  onClick={() => patch((d) => void d.services.push({ title: 'خدمة جديدة', description: '', icon: 'wiring' }))}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  + إضافة خدمة
                </button>
              </div>
              {s.services.map((sv, i) => (
                <Card key={i} className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                    <div className="flex gap-1">
                      <IconBtn title="أعلى" disabled={i === 0} onClick={() => patch((d) => move(d.services, i, -1))}>↑</IconBtn>
                      <IconBtn title="أسفل" disabled={i === s.services.length - 1} onClick={() => patch((d) => move(d.services, i, 1))}>↓</IconBtn>
                      <IconBtn title="حذف" onClick={() => window.confirm('حذف هذه الخدمة؟') && patch((d) => void d.services.splice(i, 1))}>🗑</IconBtn>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-[1fr_160px]">
                    <Field label="اسم الخدمة">
                      <input className={inputCls} value={sv.title} onChange={(e) => patch((d) => void (d.services[i].title = e.target.value))} />
                    </Field>
                    <Field label="الأيقونة">
                      <select className={inputCls} value={sv.icon} onChange={(e) => patch((d) => void (d.services[i].icon = e.target.value as IconName))}>
                        {iconNames.map((n) => (
                          <option key={n} value={n}>{iconLabels[n]}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="الوصف">
                    <textarea rows={2} className={inputCls} value={sv.description} onChange={(e) => patch((d) => void (d.services[i].description = e.target.value))} />
                  </Field>
                </Card>
              ))}
            </>
          )}

          {/* ───── أعمالنا ───── */}
          {tab === 'projects' && (
            <>
              <Card className="space-y-3">
                <h2 className="text-lg font-extrabold">إضافة صورة إلى المعرض</h2>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800">
                  📷 {uploading || 'ارفع صوراً من الهاتف أو الجهاز'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={!!uploading}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files;
                      void uploadFiles(f).finally(() => {
                        e.target.value = '';
                      });
                    }}
                  />
                </label>
                <p className="text-sm text-slate-600">
                  تُصغَّر الصورة وتُضغط تلقائياً قبل الرفع. أو اختر صورة موجودة مسبقاً في <b dir="ltr">public/projects</b>:
                </p>
                <div className="flex flex-wrap gap-2">
                  <select className={`${inputCls} max-w-md`} value={pick} onChange={(e) => setPick(e.target.value)} dir="ltr">
                    <option value="">— اختر صورة ({unused.length} غير مستخدمة) —</option>
                    {unused.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <button type="button" onClick={addProject} disabled={!pick} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">
                    + إضافة
                  </button>
                </div>
              </Card>

              <h2 className="text-lg font-extrabold">
                الصور ({s.projects.length}) — الظاهرة {s.projects.filter((p) => p.visible).length}
              </h2>
              {s.projects.map((p, i) => (
                <Card key={`${p.src}-${i}`} className={`flex flex-wrap items-start gap-4 ${p.visible ? '' : 'opacity-60'}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt="" className="h-24 w-24 shrink-0 rounded-lg border border-slate-200 object-cover" />
                  <div className="grid min-w-[240px] flex-1 gap-3 md:grid-cols-2">
                    <Field label="العنوان">
                      <input className={inputCls} value={p.title} onChange={(e) => patch((d) => void (d.projects[i].title = e.target.value))} />
                    </Field>
                    <Field label="التصنيف">
                      <select className={inputCls} value={p.category} onChange={(e) => patch((d) => void (d.projects[i].category = e.target.value as ProjectCategory))}>
                        {(Object.keys(categoryLabels) as ProjectCategory[]).map((c) => (
                          <option key={c} value={c}>{categoryLabels[c]}</option>
                        ))}
                      </select>
                    </Field>
                    <div className="md:col-span-2">
                      <Field label="الوصف">
                        <input className={inputCls} value={p.caption} onChange={(e) => patch((d) => void (d.projects[i].caption = e.target.value))} />
                      </Field>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Switch checked={p.visible} onChange={(v) => patch((d) => void (d.projects[i].visible = v))} label={p.visible ? 'ظاهرة' : 'مخفية'} />
                    <div className="flex gap-1">
                      <IconBtn title="أعلى" disabled={i === 0} onClick={() => patch((d) => move(d.projects, i, -1))}>↑</IconBtn>
                      <IconBtn title="أسفل" disabled={i === s.projects.length - 1} onClick={() => patch((d) => move(d.projects, i, 1))}>↓</IconBtn>
                      <IconBtn title="حذف من المعرض" onClick={() => window.confirm('إزالة الصورة من المعرض؟ (الملف نفسه لا يُحذف)') && patch((d) => void d.projects.splice(i, 1))}>🗑</IconBtn>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}

          {/* ───── آلية العمل ───── */}
          {tab === 'steps' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold">خطوات العمل ({s.steps.length})</h2>
                <button
                  type="button"
                  onClick={() => patch((d) => void d.steps.push({ title: 'خطوة جديدة', text: '' }))}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  + إضافة خطوة
                </button>
              </div>
              {s.steps.map((st, i) => (
                <Card key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">الخطوة {i + 1}</span>
                    <div className="flex gap-1">
                      <IconBtn title="أعلى" disabled={i === 0} onClick={() => patch((d) => move(d.steps, i, -1))}>↑</IconBtn>
                      <IconBtn title="أسفل" disabled={i === s.steps.length - 1} onClick={() => patch((d) => move(d.steps, i, 1))}>↓</IconBtn>
                      <IconBtn title="حذف" onClick={() => window.confirm('حذف هذه الخطوة؟') && patch((d) => void d.steps.splice(i, 1))}>🗑</IconBtn>
                    </div>
                  </div>
                  <Field label="العنوان">
                    <input className={inputCls} value={st.title} onChange={(e) => patch((d) => void (d.steps[i].title = e.target.value))} />
                  </Field>
                  <Field label="الشرح">
                    <textarea rows={2} className={inputCls} value={st.text} onChange={(e) => patch((d) => void (d.steps[i].text = e.target.value))} />
                  </Field>
                </Card>
              ))}
            </>
          )}

          {/* ───── التواصل ───── */}
          {tab === 'contact' && (
            <Card className="space-y-4">
              <h2 className="text-lg font-extrabold">معلومات التواصل</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="رقم الهاتف (للاتصال)" hint="بصيغة دولية، مثل +967771199341">
                  <input dir="ltr" className={inputCls} value={s.contact.phone} onChange={(e) => patch((d) => void (d.contact.phone = e.target.value))} />
                </Field>
                <Field label="الرقم كما يظهر للزوار">
                  <input dir="ltr" className={inputCls} value={s.contact.phoneDisplay} onChange={(e) => patch((d) => void (d.contact.phoneDisplay = e.target.value))} />
                </Field>
                <Field label="رقم واتساب" hint="أرقام فقط مع رمز الدولة بدون +، مثل 967771199341">
                  <input dir="ltr" className={inputCls} value={s.contact.whatsapp} onChange={(e) => patch((d) => void (d.contact.whatsapp = e.target.value))} />
                </Field>
                <Field label="البريد الإلكتروني">
                  <input dir="ltr" type="email" className={inputCls} value={s.contact.email} onChange={(e) => patch((d) => void (d.contact.email = e.target.value))} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="الموقع / المدينة">
                    <input className={inputCls} value={s.contact.city} onChange={(e) => patch((d) => void (d.contact.city = e.target.value))} />
                  </Field>
                </div>
              </div>
            </Card>
          )}

          {/* ───── النشر ───── */}
          {tab === 'publish' && (
            <Card className="space-y-5">
              <h2 className="text-lg font-extrabold">حفظ ونشر الموقع</h2>
              <p className="text-sm text-slate-600">
                يحفظ تعديلاتك ثم يرسل <b dir="ltr">data/settings.json</b> (والصور الجديدة في المعرض) إلى مستودع GitHub، فيعيد Vercel بناء الموقع تلقائياً.
              </p>
              {pub && (
                <p className="text-sm text-slate-600" dir="ltr">
                  {pub.repo} · {pub.branch}
                </p>
              )}
              {pub && !pub.configured ? (
                <div className="space-y-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-bold">لم يُضبط رمز GitHub بعد. أضف في ملف .env.local:</p>
                  <pre dir="ltr" className="rounded-lg bg-slate-900 p-3 text-emerald-300">{`GITHUB_TOKEN=github_pat_xxxxxxxx\nGITHUB_REPO=maximumadvye-source/maximum\nGITHUB_BRANCH=main`}</pre>
                  <p>
                    أنشئ الرمز من GitHub ← Settings ← Developer settings ← Fine-grained tokens، واختر المستودع <b>maximum</b> فقط، وصلاحية <b>Contents: Read and write</b>. ثم أعد تشغيل <b>npm run dev</b>.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={publish}
                  disabled={publishing || !pub}
                  className="rounded-xl bg-emerald-600 px-6 py-3 font-extrabold text-white shadow transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {publishing ? 'جارٍ النشر…' : dirty ? '🚀 حفظ ونشر' : '🚀 نشر آخر نسخة'}
                </button>
              )}
              {pubMsg && (
                <p className={`rounded-lg p-3 text-sm ${pubMsg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{pubMsg.text}</p>
              )}
              {pub?.configured && (
                <div className="space-y-3 border-t border-slate-200 pt-5">
                  <h3 className="font-extrabold">نسخة الموقع المنشورة (الكود)</h3>
                  <p className="text-xs text-slate-500">
                    تبدّل تصميم الموقع الحي كاملاً بين النسخ المحفوظة. لا يُحذف شيء من السجل، وتبقى الإعدادات وصور المعرض كما هي، ويمكنك الرجوع بأي وقت.
                  </p>
                  <p className="text-sm">
                    المنشور الآن: <b>{ver ? verLabel[ver] : '…'}</b>
                  </p>
                  {remote && (
                    <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
                      من الهاتف لا يمكن نشر النسخ القديمة، لأنها لا تحتوي لوحة الإدارة فلن تستطيع الرجوع. افعلها من لوحة الكمبيوتر.
                    </p>
                  )}
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                    {(['new', 'old', 'sanaa', 'solutions'] as const).map((w) => {
                      const isCurrent = ver === w;
                      const missing = (w === 'sanaa' || w === 'solutions') && ready[w] === false;
                      return (
                        <li key={w} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                          <div>
                            <p className="font-semibold">{verLabel[w]}</p>
                            {missing && <p className="text-xs text-amber-700">غير مرفوعة إلى GitHub بعد (المجلد versions/{w})</p>}
                            {isCurrent && <p className="text-xs text-emerald-700">منشورة الآن</p>}
                          </div>
                          {verConfirm === w ? (
                            <span className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => switchVer(w)}
                                disabled={verBusy}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                              >
                                {verBusy ? 'جارٍ النشر…' : 'تأكيد النشر'}
                              </button>
                              <button type="button" onClick={() => setVerConfirm('')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold">
                                إلغاء
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setVerConfirm(w)}
                              disabled={verBusy || isCurrent || !ver || missing || (remote && w !== 'new')}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
                            >
                              🚀 انشر هذه النسخة
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {pub?.configured && (
                <div className="space-y-3 border-t border-slate-200 pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-extrabold">النسخ المنشورة سابقاً</h3>
                    <button
                      type="button"
                      onClick={loadHistory}
                      disabled={histBusy}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold hover:bg-slate-50 disabled:opacity-60"
                    >
                      {histBusy ? 'جارٍ التحميل…' : history ? 'تحديث القائمة' : 'عرض النسخ السابقة'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    استرجاع نسخة ينشر إعداداتها كنسخة جديدة، ولا يحذف السجل. ولا يغيّر الكود ولا الصور.
                  </p>
                  {history && history.length === 0 && <p className="text-sm text-slate-500">لا توجد نسخ منشورة بعد.</p>}
                  {history && history.length > 0 && (
                    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                      {history.map((h, i) => (
                        <li key={h.sha} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                          <div>
                            <p className="font-semibold">{h.message}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(h.date).toLocaleString('ar')} · <span dir="ltr">{h.sha.slice(0, 7)}</span>
                              {i === 0 && ' · الحالية'}
                            </p>
                          </div>
                          {i > 0 &&
                            (confirmSha === h.sha ? (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => restore(h.sha)}
                                  disabled={!!restoring}
                                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                                >
                                  {restoring === h.sha ? 'جارٍ…' : 'تأكيد الاسترجاع والنشر'}
                                </button>
                                <button type="button" onClick={() => setConfirmSha('')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold">
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmSha(h.sha)}
                                disabled={!!restoring}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold hover:bg-slate-50"
                              >
                                ↩ استرجع ونشر
                              </button>
                            ))}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {pub?.commit && (
                <p className="text-xs text-slate-500">
                  آخر تحديث في المستودع: {pub.commit.message} — {new Date(pub.commit.date).toLocaleString('ar')}
                </p>
              )}
            </Card>
          )}

          {/* ───── النسخ والاستعادة ───── */}
          {tab === 'data' && (
            <Card className="space-y-5">
              <h2 className="text-lg font-extrabold">النسخ الاحتياطي والاستعادة</h2>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={exportJson} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">
                  ⬇ تصدير الإعدادات (JSON)
                </button>
                <label className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-slate-50">
                  ⬆ استيراد ملف إعدادات
                  <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => importJson(e.target.files?.[0])} />
                </label>
                <button type="button" onClick={resetAll} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50">
                  استعادة الإعدادات الأصلية
                </button>
              </div>
              <p className="text-sm text-slate-600">
                الإعدادات تُحفظ في ملف <b dir="ltr">data/settings.json</b> داخل مجلد المشروع. انسخه احتياطياً متى أحببت.
              </p>
            </Card>
          )}

          {/* ───── النسخ الاحتياطية المحلية ───── */}
          {tab === 'data' && !remote && (
            <Card className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-extrabold">النسخ الاحتياطية (قبل كل تعديل)</h2>
                <button
                  type="button"
                  onClick={backupNow}
                  disabled={bkBusy}
                  className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  📦 احفظ نسخة الآن
                </button>
              </div>
              <p className="text-sm text-slate-600">
                يحفظ الموقع تلقائياً نسخة من الإعدادات القديمة <b>قبل كل حفظ</b> أو استرجاع أو إعادة ضبط، ويحتفظ بآخر 30 نسخة (اليدوية لا تُحذف). تُخزَّن في <b dir="ltr">data/backups</b> على جهازك.
              </p>
              {bkMsg && (
                <p className={`rounded-lg p-3 text-sm ${bkMsg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{bkMsg.text}</p>
              )}
              {backups && backups.length === 0 && <p className="text-sm text-slate-500">لا توجد نسخ بعد. ستظهر هنا بعد أول حفظ.</p>}
              {backups && backups.length > 0 && (
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {backups.map((b) => (
                    <li key={b.name} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                      <div>
                        <p className="font-semibold">{kindLabel[b.kind] || b.kind}</p>
                        <p className="text-xs text-slate-500">{new Date(b.date).toLocaleString('ar')}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/api/admin/backups?name=${encodeURIComponent(b.name)}`}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold hover:bg-slate-50"
                        >
                          ⬇ تنزيل
                        </a>
                        {bkConfirm === b.name ? (
                          <>
                            <button
                              type="button"
                              onClick={() => restoreBackup(b.name)}
                              disabled={bkBusy}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                            >
                              تأكيد الاسترجاع
                            </button>
                            <button type="button" onClick={() => setBkConfirm('')} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold">
                              إلغاء
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setBkConfirm(b.name)}
                            disabled={bkBusy}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold hover:bg-slate-50"
                          >
                            ↩ استرجع
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {/* ───── المعاينة المباشرة ───── */}
          {preview && (
            <Card className="p-2">
              <iframe key={previewKey} src="/" title="معاينة الموقع" className="h-[75vh] w-full rounded-xl border border-slate-200 bg-white" />
              <p className="px-3 py-2 text-xs text-slate-500">المعاينة تعرض آخر نسخة محفوظة. احفظ التغييرات لتظهر هنا.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
