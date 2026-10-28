'use client';

import { useEffect, useRef } from 'react';

interface ParticleSystemProps {
  count?: number;
}

// شرارات كهربائية صاعدة بهدوء — تُستعمل كخلفية لقسم التواصل
export default function ParticleSystem({ count = 60 }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const sparks = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.6,
      v: Math.random() * 0.35 + 0.1,
      amber: Math.random() > 0.7,
      a: Math.random() * 0.5 + 0.2,
    }));

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const s of sparks) {
        if (!reduce) {
          s.y -= s.v;
          if (s.y < -4) {
            s.y = h + 4;
            s.x = Math.random() * w;
          }
        }
        ctx.fillStyle = s.amber ? `rgba(255,122,26,${s.a})` : `rgba(143,160,255,${s.a})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
      aria-hidden="true"
    />
  );
}
