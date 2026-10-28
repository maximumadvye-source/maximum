import { site } from '@/lib/site';

export default function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-3" aria-label={site.name}>
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
        <path
          d="M20 2l15.6 9v18L20 38 4.4 29V11z"
          strokeWidth="2"
          strokeLinejoin="round"
          style={{
            fill: onDark ? 'rgb(var(--accent-soft) / 0.12)' : 'rgb(var(--accent) / 0.08)',
            stroke: onDark ? 'rgb(var(--accent-soft))' : 'rgb(var(--accent))',
          }}
        />
        <path d="M22 9 13 21h6l-1 10 9-13h-6z" style={{ fill: 'rgb(var(--warm))' }} />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className={`text-lg font-extrabold tracking-[0.18em] ${onDark ? 'text-white' : 'text-fg'}`}
          dir="ltr"
        >
          {site.brand}
        </span>
        <span className={`mt-1 text-[11px] font-medium ${onDark ? 'text-accent-soft' : 'text-accent'}`}>
          {site.role}
        </span>
      </span>
    </a>
  );
}
