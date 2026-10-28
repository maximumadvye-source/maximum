'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import SectionTitle from './SectionTitle';
import { projectCategories, type ProjectCategory } from '@/lib/site';
import type { ProjectItem } from '@/lib/settings';

const PAGE = 12;

export default function Portfolio({ projects: allProjects }: { projects: ProjectItem[] }) {
  const projects = useMemo(() => allProjects.filter((p) => p.visible), [allProjects]);
  const [filter, setFilter] = useState<'all' | ProjectCategory>('all');
  const [limit, setLimit] = useState(PAGE);
  const [active, setActive] = useState<number | null>(null);

  const list = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.category === filter)),
    [filter, projects]
  );
  const visible = list.slice(0, limit);
  const current = active === null ? null : list[active];

  const go = (dir: 1 | -1) =>
    setActive((v) => (v === null ? v : (v + dir + list.length) % list.length));

  // مفاتيح المعرض + منع تمرير الصفحة خلفه
  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
      if (e.key === 'ArrowLeft') go(1);
      if (e.key === 'ArrowRight') go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, list.length]);

  const pick = (id: 'all' | ProjectCategory) => {
    setFilter(id);
    setLimit(PAGE);
    setActive(null);
  };

  return (
    <section id="projects" className="relative border-y border-fg/5 bg-surface/50 px-5 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          kicker="أعمالنا"
          title="تفاصيل تُرى بالعين… وتُحسّ في الأمان"
          text="لقطات حقيقية من مشاريع نفّذناها. اضغط على أي صورة لتكبيرها."
        />

        {/* تصنيفات */}
        <div className="mb-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="تصنيف الأعمال">
          {projectCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={filter === c.id}
              onClick={() => pick(c.id)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                filter === c.id
                  ? 'border-fg bg-fg text-bg'
                  : 'border-fg/15 bg-surface/70 text-fg/70 hover:border-accent hover:text-fg'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* شبكة متدرّجة (Masonry) تناسب اختلاف مقاسات الصور */}
        <div key={filter} className="columns-2 gap-3 md:columns-3 md:gap-4 lg:columns-4">
          {visible.map((p, i) => (
            <motion.button
              key={p.src}
              type="button"
              onClick={() => setActive(i)}
              className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-fg/10 bg-surface text-start shadow-[0_10px_30px_rgba(0,0,0,0.08)] md:mb-4"
              style={{ aspectRatio: `${p.width} / ${p.height}` }}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05 }}
              aria-label={`تكبير: ${p.title}`}
            >
              <Image
                src={p.src}
                alt={p.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent opacity-70 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-1 p-3 transition-transform duration-300 group-hover:translate-y-0 md:p-4">
                <h3 className="text-sm font-bold text-white">{p.title}</h3>
                <p className="mt-1 hidden text-xs text-slate-300 md:block">{p.caption}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {limit < list.length && (
          <div className="mt-8 text-center">
            <button type="button" className="btn-ghost" onClick={() => setLimit((l) => l + PAGE)}>
              عرض المزيد ({list.length - limit})
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {current && active !== null && (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center bg-dark/95 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
          >
            <button
              type="button"
              className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10"
              aria-label="إغلاق"
              onClick={() => setActive(null)}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>

            {list.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="السابق"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="التالي"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 6-6 6 6 6" />
                  </svg>
                </button>
              </>
            )}

            <motion.figure
              key={current.src}
              className="max-h-full max-w-5xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={current.src}
                alt={current.title}
                width={current.width}
                height={current.height}
                sizes="90vw"
                className="mx-auto h-auto max-h-[78vh] w-auto max-w-full rounded-xl object-contain"
                priority
              />
              <figcaption className="mt-4 text-center">
                <p className="font-bold text-white">{current.title}</p>
                <p className="text-sm text-slate-400">{current.caption}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {active + 1} / {list.length}
                </p>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
