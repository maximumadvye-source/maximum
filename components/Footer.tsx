import Logo from './Logo';
import { site } from '@/lib/site';
import type { ContactInfo } from '@/lib/settings';

export default function Footer({
  nav,
  contact,
}: {
  nav: { label: string; href: string }[];
  contact: ContactInfo;
}) {
  return (
    <footer className="border-t border-white/10 bg-dark px-5 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
        <div className="text-center md:text-start">
          <Logo onDark />
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            {site.name} — خبرة تتجاوز التوقعات في الأنظمة الكهربائية.
          </p>
        </div>

        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
          {nav.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors hover:text-warm">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a href={`tel:${contact.phone}`} className="text-sm font-semibold text-accent-soft" dir="ltr">
          {contact.phoneDisplay}
        </a>
      </div>
      <p className="mt-10 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} {site.name}. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}
