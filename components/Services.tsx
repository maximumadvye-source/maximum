'use client';

import type { MouseEvent } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';
import SectionTitle from './SectionTitle';
import type { Service } from '@/lib/site';

// تتبّع المؤشر فوق البطاقة لعمل إضاءة تلاحق الماوس
function onMove(e: MouseEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

export default function Services({ services }: { services: Service[] }) {
  return (
    <section id="services" className="relative px-5 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          kicker="خدماتنا"
          title="كل ما يحتاجه مشروعك الكهربائي في مكان واحد"
          text="من التأسيس إلى الفحص والتسليم — نغطي دورة العمل الكهربائي كاملة."
        />

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {services.map((s, i) => (
            <motion.article
              key={`${s.title}-${i}`}
              onMouseMove={onMove}
              className="spot tech-card group relative overflow-hidden rounded-2xl p-6"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
              }}
            >
              <span className="absolute left-4 top-3 text-5xl font-black text-fg/[0.05]" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative mb-5 grid h-12 w-12 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent transition-colors group-hover:border-warm/50 group-hover:bg-warm/10 group-hover:text-warm">
                <Icon name={s.icon} />
              </div>
              <h3 className="relative mb-2 text-lg font-extrabold text-fg">{s.title}</h3>
              <p className="relative text-sm leading-7 text-muted">{s.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
