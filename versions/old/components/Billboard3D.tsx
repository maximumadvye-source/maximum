"use client";

import React, { useEffect, useRef } from 'react';
import edImage from '../ED.webp';

interface Billboard3DProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string | { src: string };
}

export default function Billboard3D({
  title = 'حلول كهربائية متكاملة واحترافية في صنعاء',
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
      <div className="absolute inset-0 bg-black/40" />

      <div
        ref={innerRef}
        role="region"
        aria-label="القسم التعريفي"
        className="amp-hero-inner relative z-10 mx-auto max-w-4xl h-full flex flex-col items-center justify-center text-center px-6 opacity-0 translate-y-6 transition-all duration-700"
      >
        {/* amp-hero-title color: #0c7acb */}
        <h1 className="amp-hero-title text-4xl md:text-6xl lg:text-7xl font-extrabold drop-shadow-md leading-tight">
          {title}
        </h1>
        <p className="mt-4 text-gray-200 text-base md:text-lg max-w-3xl">{subtitle}</p>

        <div className="mt-8 flex gap-4">
          <a
            href="#contact"
            className="bg-blue-400 hover:bg-blue-500 text-white rounded-full px-8 py-3 shadow-md transition"
          >

          </a>
          <a
            href="#portfolio"
            className="border-2 border-blue-400 text-blue-50 rounded-full px-8 py-3 hover:bg-blue-500/10 transition"
          >

          </a>
        </div>
      </div>
    </section>
  );
}
