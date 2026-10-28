import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import AdminPanel from '@/components/admin/AdminPanel';
import Login from '@/components/admin/Login';
import { COOKIE, adminEnabled, verifyToken } from '@/lib/auth';
import { readSettings } from '@/lib/settings.server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'لوحة إدارة الموقع',
  robots: { index: false, follow: false },
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

  return <AdminPanel initial={await readSettings()} />;
}
