'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Reveal from './Reveal';
import SectionTitle from './SectionTitle';
import ParticleSystem from './ParticleSystem';
import { contactLinks, type ContactInfo } from '@/lib/settings';
import type { Service } from '@/lib/site';

// مفتاح Web3Forms (عام وآمن للمتصفح) — يوضع في .env.local باسم NEXT_PUBLIC_WEB3FORMS_KEY
const FORM_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

const field =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-warm focus:ring-2 focus:ring-warm/30';

type Status = 'idle' | 'sending' | 'ok' | 'error';

export default function Contact({ contact, services }: { contact: ContactInfo; services: Service[] }) {
  const links = contactLinks(contact);
  const firstService = services[0]?.title ?? '';
  const [form, setForm] = useState({ name: '', contact: '', service: firstService, message: '' });
  const [status, setStatus] = useState<Status>('idle');

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const waText = `السلام عليكم، أنا ${form.name}.\nالخدمة المطلوبة: ${form.service}\nللتواصل: ${form.contact}\n${form.message}`;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // حقل مخفي يملؤه الروبوتات فقط
    if ((new FormData(e.currentTarget).get('website') as string)?.length) return;

    if (!FORM_KEY) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: FORM_KEY,
          subject: `طلب جديد من الموقع: ${form.service}`,
          from_name: form.name,
          name: form.name,
          contact: form.contact,
          service: form.service,
          message: form.message,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        setStatus('ok');
        setForm({ name: '', contact: '', service: firstService, message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const cards = [
    { label: 'اتصال هاتفي', value: contact.phoneDisplay, href: links.tel, ltr: true },
    { label: 'البريد الإلكتروني', value: contact.email, href: links.mail, ltr: true },
    { label: 'الموقع', value: contact.city, href: undefined, ltr: false },
  ];

  return (
    <section id="contact" className="relative isolate overflow-hidden bg-dark px-5 py-24 md:py-32">
      <ParticleSystem />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-warm/60 to-transparent" />

      <div className="relative mx-auto max-w-6xl">
        <SectionTitle
          kicker="تواصل معنا"
          title="جاهزون لمشروعك الكهربائي القادم"
          text="أرسل تفاصيل طلبك وسنردّ عليك في أقرب وقت لتحديد موعد المعاينة."
          dark
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <Reveal className="space-y-4 lg:col-span-2">
            {cards.map((c) => {
              const body = (
                <>
                  <p className="text-xs font-semibold text-accent-soft">{c.label}</p>
                  <p className="mt-1 text-lg font-bold text-white" dir={c.ltr ? 'ltr' : undefined}>
                    <span className={c.ltr ? 'block text-right' : undefined}>{c.value}</span>
                  </p>
                </>
              );
              return c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-warm/60"
                >
                  {body}
                </a>
              ) : (
                <div key={c.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  {body}
                </div>
              );
            })}
            <a
              href={links.wa('السلام عليكم، أرغب بالاستفسار عن خدماتكم الكهربائية.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full text-center"
            >
              راسلنا عبر واتساب
            </a>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur md:p-8">
              {/* فخ للروبوتات */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
                    الاسم
                  </label>
                  <input id="name" name="name" value={form.name} onChange={onChange} className={field} placeholder="اسمك الكريم" required />
                </div>
                <div>
                  <label htmlFor="contact" className="mb-2 block text-sm font-medium text-slate-300">
                    رقم الهاتف أو الإيميل للرد عليك
                  </label>
                  <input
                    id="contact"
                    name="contact"
                    value={form.contact}
                    onChange={onChange}
                    className={field}
                    placeholder="77xxxxxxx أو name@mail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="service" className="mb-2 block text-sm font-medium text-slate-300">
                  الخدمة المطلوبة
                </label>
                <select id="service" name="service" value={form.service} onChange={onChange} className={field}>
                  {services.map((s, i) => (
                    <option key={`${s.title}-${i}`} value={s.title} className="bg-dark text-white">
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-slate-300">
                  تفاصيل الطلب
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={onChange}
                  className={`${field} h-32 resize-none`}
                  placeholder="اكتب موقع المشروع ونوع العمل المطلوب…"
                  required
                />
              </div>

              <button type="submit" disabled={status === 'sending'} className="btn-primary w-full disabled:opacity-60">
                {status === 'sending' ? 'جارٍ الإرسال…' : 'إرسال الرسالة'}
              </button>

              <div aria-live="polite" className="text-center text-sm">
                {status === 'ok' && (
                  <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-emerald-300">
                    ✓ وصلتنا رسالتك، وسنتواصل معك قريباً.
                  </p>
                )}
                {status === 'error' && (
                  <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-red-300">
                    تعذّر الإرسال حالياً.{' '}
                    <a href={links.wa(waText)} target="_blank" rel="noopener noreferrer" className="font-bold underline">
                      أرسلها عبر واتساب
                    </a>{' '}
                    أو اتصل بنا مباشرة.
                  </p>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
