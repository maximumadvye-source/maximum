'use client';

import dynamic from 'next/dynamic';
import { Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { ContactInfo, HeroInfo, Theme } from '@/lib/settings';
import { contactLinks } from '@/lib/settings';
import type { Service } from '@/lib/site';

// مشهد الـ3D يُحمَّل في المتصفح فقط (WebGL)
const PanelScene = dynamic(() => import('./three/PanelScene'), { ssr: false });

// لو فشل WebGL على جهاز ضعيف يبقى الموقع سليماً بدون المشهد
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const chips = ['معايير الجهة المختصة', 'تنفيذ وصيانة', 'سلامة وحماية'];

interface Props {
  theme: Theme;
  hero: HeroInfo;
  contact: ContactInfo;
  services: Service[];
}

export default function Billboard3D({ theme, hero, contact, services }: Props) {
  const links = contactLinks(contact);

  return (
    <section id="top" className="relative isolate min-h-[100svh] overflow-hidden">
      {/* التوهّجان الأساسيان للخلفية */}
      <div className="pointer-events-none absolute start-10 top-1/4 -z-10 h-80 w-80 rounded-full bg-warm/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute end-10 top-1/3 -z-10 h-96 w-96 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />

      <div className="absolute inset-0 -z-10">
        <SceneBoundary>
          <PanelScene key={theme} theme={theme} />
        </SceneBoundary>
      </div>
      {/* تدرّج يحفظ وضوح النص */}
      <div className="pointer-events-none absolute inset-0 -z-[5] bg-gradient-to-l from-bg/95 via-bg/45 to-transparent max-md:bg-gradient-to-t max-md:from-bg max-md:via-bg/75" />

      <div className="pointer-events-none mx-auto flex min-h-[100svh] max-w-7xl items-end px-5 pb-20 pt-28 md:items-center md:pb-16">
        <motion.div
          className="max-w-2xl"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-warm/30 bg-warm/10 px-4 py-1.5 text-xs font-black text-warm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-warm" />
            {hero.badge}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.25] text-fg sm:text-5xl lg:text-6xl">
            <span className="text-volt-grad">{hero.accent}</span> {hero.rest}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-muted md:text-lg">{hero.subtitle}</p>

          <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
            <a
              href={links.wa('السلام عليكم، أرغب بطلب معاينة / عرض سعر لعمل كهربائي.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              اطلب معاينة مجانية
            </a>
            <a href="#projects" className="btn-ghost">
              شاهد أعمالنا
            </a>
            <a href={links.tel} className="btn-ghost max-sm:hidden">
              اتصال مباشر
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-muted">
            {chips.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="h-4 w-4 text-accent" fill="currentColor" aria-hidden="true">
                  <path d="M8.2 14.3 4.5 10.6l1.4-1.4 2.3 2.3 5.9-5.9 1.4 1.4z" />
                </svg>
                {c}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* شريط الخدمات المتحرك */}
      <div
        dir="ltr"
        className="absolute inset-x-0 bottom-0 overflow-hidden border-y border-white/10 bg-dark py-3.5 text-white shadow-md max-md:hidden"
        aria-hidden="true"
      >
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap text-sm font-bold tracking-wide text-white/90">
          {[...services, ...services].map((s, i) => (
            <span key={i} dir="rtl" className="flex items-center gap-10">
              {s.title}
              <span className="h-2 w-2 rounded-full bg-warm" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
