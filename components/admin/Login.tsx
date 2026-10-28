'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      setError(res.status === 401 ? 'كلمة السر غير صحيحة' : 'تعذّر تسجيل الدخول');
    } catch {
      setError('تعذّر الاتصال بالخادم');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-6 text-slate-900">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-blue-700 text-2xl text-amber-300">
          ⚡
        </div>
        <h1 className="text-center text-xl font-extrabold">لوحة إدارة الموقع</h1>
        <p className="mt-1 text-center text-sm text-slate-500">أدخل كلمة السر للمتابعة</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          placeholder="كلمة السر"
          className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
        />
        {error && <p className="mt-3 rounded-lg bg-red-50 p-2 text-center text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-lg bg-blue-700 py-3 font-bold text-white transition hover:bg-blue-800 disabled:opacity-60"
        >
          {busy ? 'جارٍ التحقق…' : 'دخول'}
        </button>
      </form>
    </main>
  );
}
