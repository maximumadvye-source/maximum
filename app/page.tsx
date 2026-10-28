import Header from '@/components/Header';
import Billboard3D from '@/components/Billboard3D';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Process from '@/components/Process';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import Themed from '@/components/Themed';
import { site } from '@/lib/site';
import { visibleNav } from '@/lib/settings';
import { readSettings } from '@/lib/settings.server';

// الإعدادات تُقرأ عند كل زيارة، فتظهر تعديلات لوحة الإدارة فوراً
export const dynamic = 'force-dynamic';

export default async function Home() {
  const s = await readSettings();
  const nav = visibleNav(s.sections);
  const sec = s.sections;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Electrician',
    name: site.name,
    description: site.description,
    telephone: s.contact.phone,
    email: s.contact.email,
    areaServed: 'صنعاء',
    address: { '@type': 'PostalAddress', addressLocality: 'صنعاء', addressCountry: 'YE' },
  };

  return (
    <>
      <Themed theme={sec.header.theme} className="z-50">
        <Header nav={nav} contact={s.contact} theme={sec.header.theme} heroTheme={sec.hero.visible ? sec.hero.theme : undefined} />
      </Themed>

      <main>
        {sec.hero.visible && (
          <Themed theme={sec.hero.theme}>
            <Billboard3D theme={sec.hero.theme} hero={s.hero} contact={s.contact} services={s.services} />
          </Themed>
        )}
        {sec.services.visible && (
          <Themed theme={sec.services.theme}>
            <Services services={s.services} />
          </Themed>
        )}
        {sec.projects.visible && (
          <Themed theme={sec.projects.theme}>
            <Portfolio projects={s.projects} />
          </Themed>
        )}
        {sec.process.visible && (
          <Themed theme={sec.process.theme}>
            <Process steps={s.steps} />
          </Themed>
        )}
        {sec.contact.visible && (
          <Themed theme={sec.contact.theme}>
            <Contact contact={s.contact} services={s.services} />
          </Themed>
        )}
      </main>

      {sec.footer.visible && (
        <Themed theme={sec.footer.theme}>
          <Footer nav={nav} contact={s.contact} />
        </Themed>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
