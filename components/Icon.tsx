import type { IconName } from '@/lib/site';

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export default function Icon({
  name,
  className = 'h-7 w-7',
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...common}>
      {name === 'wiring' && (
        <>
          <path d="M3 17h4l3-10h4l3 10h4" />
          <circle cx="3" cy="17" r="1" />
          <circle cx="21" cy="17" r="1" />
        </>
      )}
      {name === 'panel' && (
        <>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M4 9h16M4 15h16M9 3v18M15 3v18" />
        </>
      )}
      {name === 'maintenance' && (
        <>
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
        </>
      )}
      {name === 'lighting' && (
        <>
          <path d="M9 18h6M10 21h4" />
          <path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z" />
        </>
      )}
      {name === 'safety' && (
        <>
          <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
          <path d="m9 12 2 2 4-4" />
        </>
      )}
      {name === 'ground' && <path d="M12 3v10M5 13h14M7.5 17h9M10 21h4" />}
      {name === 'upgrade' && (
        <>
          <path d="M12 19V5M5 12l7-7 7 7" />
          <path d="M5 21h14" />
        </>
      )}
      {name === 'grid' && (
        <>
          <circle cx="12" cy="5" r="2" />
          <circle cx="5" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
          <path d="M12 7v4M12 11l-6 6M12 11l6 6" />
        </>
      )}
    </svg>
  );
}
