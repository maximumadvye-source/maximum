'use client';

import { MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

// يحترم إعداد «تقليل الحركة» في جهاز الزائر تلقائياً
export default function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
