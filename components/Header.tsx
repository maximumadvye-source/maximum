'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from './Logo';
import type { ContactInfo, Theme } from '@/lib/settings';

interface HeaderProps {
  nav: { label: string; href: string }[];
  contact: ContactInfo;
  /** ثيم الشريط نفسه (عند التمرير) */
  theme: Theme;
  /** ثيم الواجهة الرئيسية؛ الشريط يتبعه وهو في أعلى الصفحة كي تبقى الروابط مقروءة */
  heroTheme?: Theme;
}

export default function Header({ nav, contact, theme, heroTheme }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const tel = `tel:${contact.phone}`;
  const activeTheme = !scrolled && !open && heroTheme ? heroTheme : theme;

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        data-theme={activeTheme}
        className={`mx-auto max-w-7xl rounded-2xl border px-4 transition-all duration-300 md:px-6 ${
          scrolled || open
            ? 'border-fg/10 bg-surface/85 shadow-[0_8px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl'
            : 'border-transparent bg-transparent'
        }`}
      >
        <nav className="flex h-16 items-center justify-between" aria-label="التنقل الرئيسي">
          <Logo />

          <ul className="hidden items-center gap-1 lg:flex">
            {nav.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="rounded-lg px-4 py-2 text-sm font-bold text-fg/70 transition-colors hover:bg-fg/5 hover:text-fg"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a href={tel} className="btn-primary !px-5 !py-2 text-sm max-sm:hidden">
              اتصل الآن
            </a>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-lg border border-fg/15 text-fg lg:hidden"
              aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.ul
              className="overflow-hidden pb-4 lg:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {nav.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 font-bold text-fg hover:bg-fg/5"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <a href={tel} className="btn-primary w-full text-center">
                  اتصل الآن
                </a>
              </li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
