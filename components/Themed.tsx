import type { ReactNode } from 'react';
import type { Theme } from '@/lib/settings';

// غلاف كل قسم: يحدّد الثيم (old = الخلفية القديمة، new = الجديدة)
export default function Themed({
  theme,
  children,
  className = '',
}: {
  theme: Theme;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-theme={theme} className={`theme-scope ${className}`}>
      {children}
    </div>
  );
}
