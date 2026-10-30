import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import AdminPanel from '@/components/admin/AdminPanel';
import Login from '@/components/admin/Login';
import { COOKIE, adminEnabled, verifyToken } from '@/lib/auth';
import { readSettingsAdmin } from '@/lib/settings.server';
import { githubMode, githubReady } from '@/lib/github';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'لوحة إدارة الموقع',
  robots: { index: false, follow: false },
  // تثبيت اللوحة كتطبيق على الهاتف (إضافة إلى الشاشة الرئيسية)
  manifest: '/admin.webmanifest',
  icons: { apple: '/admin-icon-192.png', icon: '/admin-icon-192.png' },
  appleWebApp: { capable: true, title: 'لوحة آدم عمر', statusBarStyle: 'default' },
};

export default async function AdminPage() {
  // لا تعمل اللوحة قبل ضبط كلمة سر في .env.local
  if (!adminEnabled()) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6 text-slate-900">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-extrabold">إعداد لوحة الإدارة</h1>
          <p className="mt-3 text-slate-600">
            لتفعيل اللوحة أضف كلمة سر (6 أحرف فأكثر) في ملف <b>.env.local</b> داخل مجلد المشروع:
          </p>
          <pre dir="ltr" className="mt-4 rounded-xl bg-slate-900 p-4 text-sm text-emerald-300">
            ADMIN_PASSWORD=اكتب_كلمة_سر_قوية_هنا
          </pre>
          <p className="mt-4 text-slate-600">
            ثم أوقف الموقع وشغّله من جديد (<b>npm run dev</b>) وافتح هذه الصفحة مرة ثانية.
          </p>
        </div>
      </main>
    );
  }

  if (!verifyToken(cookies().get(COOKIE)?.value)) {
    return <Login />;
  }

  const mode = githubMode() ? 'github' : 'file';

  if (mode === 'github' && !githubReady()) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6 text-slate-900">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-extrabold">بقي إعداد واحد</h1>
          <p className="mt-3 text-slate-600">
            اللوحة تعمل على Vercel وتحفظ تعديلاتك في GitHub، فأضف في Vercel ← Settings ← Environment Variables المتغير:
          </p>
          <pre dir="ltr" className="mt-4 rounded-xl bg-slate-900 p-4 text-sm text-emerald-300">
            GITHUB_TOKEN=github_pat_...
          </pre>
          <p className="mt-4 text-slate-600">ثم أعد نشر الموقع (Redeploy) وافتح هذه الصفحة من جديد.</p>
        </div>
      </main>
    );
  }

  let initial;
  try {
    initial = await readSettingsAdmin();
  } catch {
    initial = await readSettingsAdmin().catch(() => undefined);
  }
  if (!initial) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 p-6 text-slate-900">
        <p className="rounded-xl bg-white p-6 shadow">تعذّر قراءة الإعدادات من GitHub. تحقق من GITHUB_TOKEN وحدّث الصفحة.</p>
      </main>
    );
  }
  return <AdminPanel initial={initial} mode={mode} />;
}
