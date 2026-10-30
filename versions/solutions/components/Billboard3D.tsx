"use client";

import React, { useEffect, useRef } from 'react';
import edImage from '../ED.webp';

interface Billboard3DProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string | { src: string };
}

export default function Billboard3D({
  title = 'حيلول كهربائية متكاملة واحترافية في صنعاء',
  subtitle = 'تصميم وتنفيذ وصيانة أنظمة كهربائية بمواصفات عالية وباعتماد معايير الجهة المختصة.',
  imageUrl = edImage,
}: Billboard3DProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const bg =
    typeof imageUrl === 'string' ? imageUrl : (imageUrl as any)?.src || (imageUrl as any);

  return (
    <section
      id="top"
      className="w-full h-screen relative bg-center bg-cover"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div
        ref={innerRef}
        role="region"
        aria-label="القسم التعريفي"
        className="amp-hero-inner relative z-10 mx-auto max-w-4xl h-full flex flex-col items-center justify-center text-center px-6 opacity-0 translate-y-6 transition-all duration-700"
      >
        {/* amp-hero-title color: #0c7acb */}
        <h1 className="amp-hero-title font-extrabold drop-shadow-md leading-tight" style={{ fontSize: 'clamp(2rem, 4vw + 1rem, 4.25rem)' }}>
          {title}
        </h1>
        <p className="mt-4 text-gray-200 text-base md:text-lg max-w-3xl">{subtitle}</p>

        <div className="mt-8 flex gap-4">
          <a
            href="#contact"
            className="rounded-full px-6 py-3 shadow-md text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition"
          >
            تواصل معنا
          </a>
          <a
            href="#portfolio"
            className="rounded-full px-6 py-3 border-2 border-blue-400 text-blue-50 hover:bg-blue-500/10 transition font-medium"
          >
            عرض المشاريع
          </a>
        </div>
      </div>
    </section>
  );
}
