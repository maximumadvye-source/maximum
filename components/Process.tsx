import Reveal from './Reveal';
import SectionTitle from './SectionTitle';
import type { StepItem } from '@/lib/settings';

export default function Process({ steps }: { steps: StepItem[] }) {
  return (
    <section id="process" className="relative px-5 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          kicker="آلية العمل"
          title="من الفكرة إلى التيار… بخطوات واضحة"
          text="لا مفاجآت: تعرف ما سيُنفَّذ، وبأي معيار، وبأي تكلفة قبل أن نبدأ."
        />

        <ol className="relative grid gap-5 md:grid-cols-2">
          {steps.map((s, i) => (
            <li key={`${s.title}-${i}`}>
              <Reveal delay={i * 0.08} className="tech-card relative h-full overflow-hidden rounded-2xl p-7">
                <span className="text-volt-grad text-6xl font-black leading-none opacity-90" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-xl font-extrabold text-fg">{s.title}</h3>
                <p className="mt-2 leading-8 text-muted">{s.text}</p>
                <span className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl" aria-hidden="true" />
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
