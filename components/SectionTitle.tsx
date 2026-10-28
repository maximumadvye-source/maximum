import Reveal from './Reveal';

export default function SectionTitle({
  kicker,
  title,
  text,
  dark = false,
}: {
  kicker: string;
  title: string;
  text?: string;
  /** true عندما يكون القسم بخلفية كحلية دائمة (التواصل) */
  dark?: boolean;
}) {
  return (
    <Reveal className="mx-auto mb-14 max-w-2xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-warm/30 bg-warm/10 px-4 py-1 text-xs font-extrabold text-warm">
        <span className="h-1.5 w-1.5 rounded-full bg-warm" />
        {kicker}
      </span>
      <h2
        className={`mt-5 text-3xl font-extrabold leading-tight md:text-5xl ${dark ? 'text-white' : 'text-fg'}`}
      >
        {title}
      </h2>
      {text && (
        <p className={`mt-4 text-base md:text-lg ${dark ? 'text-slate-400' : 'text-muted'}`}>{text}</p>
      )}
    </Reveal>
  );
}
