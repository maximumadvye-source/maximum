// أنواع إعدادات الموقع + القيم الافتراضية + التنقية.
// آمن للاستيراد من المتصفح والخادم (لا يستعمل fs).

import {
  nav as defaultNav,
  projects as defaultProjects,
  services as defaultServices,
  site,
  steps as defaultSteps,
  type IconName,
  type ProjectCategory,
  type Service,
} from './site';

export type Theme = 'old' | 'new';

export const sectionIds = ['header', 'hero', 'services', 'projects', 'process', 'contact', 'footer'] as const;
export type SectionId = (typeof sectionIds)[number];

export const sectionMeta: Record<SectionId, { label: string; hint: string; hideable: boolean }> = {
  header: { label: 'شريط التنقل العلوي', hint: 'الشعار والروابط وزر الاتصال — يتبع خلفية الواجهة الرئيسية وهو في أعلى الصفحة، ويأخذ هذا الاختيار عند التمرير', hideable: false },
  hero: { label: 'الواجهة الرئيسية (3D)', hint: 'لوحة الكهرباء ثلاثية الأبعاد والعنوان الكبير', hideable: true },
  services: { label: 'خدماتنا', hint: 'بطاقات الخدمات', hideable: true },
  projects: { label: 'أعمالنا', hint: 'معرض الصور', hideable: true },
  process: { label: 'آلية العمل', hint: 'خطوات التنفيذ', hideable: true },
  contact: { label: 'تواصل معنا', hint: 'معلومات التواصل ونموذج الإرسال', hideable: true },
  footer: { label: 'التذييل', hint: 'أسفل الصفحة', hideable: true },
};

export interface SectionSetting {
  visible: boolean;
  theme: Theme;
}

export interface ContactInfo {
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  email: string;
  city: string;
}

export interface HeroInfo {
  badge: string;
  accent: string;
  rest: string;
  subtitle: string;
}

export interface StepItem {
  title: string;
  text: string;
}

export interface ProjectItem {
  title: string;
  caption: string;
  src: string;
  width: number;
  height: number;
  category: ProjectCategory;
  visible: boolean;
}

export interface Settings {
  sections: Record<SectionId, SectionSetting>;
  contact: ContactInfo;
  hero: HeroInfo;
  services: Service[];
  steps: StepItem[];
  projects: ProjectItem[];
}

export const iconNames: IconName[] = [
  'wiring',
  'panel',
  'maintenance',
  'lighting',
  'safety',
  'ground',
  'upgrade',
  'grid',
];

export const iconLabels: Record<IconName, string> = {
  wiring: 'تمديدات',
  panel: 'لوحات',
  maintenance: 'صيانة',
  lighting: 'إضاءة',
  safety: 'سلامة',
  ground: 'تأريض',
  upgrade: 'ترقية',
  grid: 'شبكة',
};

const categories: ProjectCategory[] = ['lighting', 'panels', 'power'];

export const categoryLabels: Record<ProjectCategory, string> = {
  lighting: 'الإنارة والأسقف',
  panels: 'اللوحات والتمديدات',
  power: 'أنظمة الطاقة',
};

export const defaultSettings: Settings = {
  sections: {
    header: { visible: true, theme: 'new' },
    hero: { visible: true, theme: 'new' },
    services: { visible: true, theme: 'new' },
    projects: { visible: true, theme: 'new' },
    process: { visible: true, theme: 'new' },
    contact: { visible: true, theme: 'new' },
    footer: { visible: true, theme: 'new' },
  },
  contact: {
    phone: site.phone,
    phoneDisplay: site.phoneDisplay,
    whatsapp: site.whatsapp,
    email: site.email,
    city: site.city,
  },
  hero: {
    badge: 'مهندس كهرباء · صنعاء',
    accent: 'حلول كهربائية',
    rest: 'متكاملة واحترافية في صنعاء',
    subtitle: 'تصميم وتنفيذ وصيانة أنظمة كهربائية بمواصفات عالية وباعتماد معايير الجهة المختصة.',
  },
  services: defaultServices.map((s) => ({ ...s })),
  steps: defaultSteps.map((s) => ({ ...s })),
  projects: defaultProjects.map((p) => ({ ...p, visible: true })),
};

/* ───────── أدوات التنقية (تحمي الموقع من بيانات تالفة) ───────── */

const str = (v: unknown, fallback: string, max = 400): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : fallback;

const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.round(v) : fallback;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// مسار صورة آمن: يبدأ بـ / ولا يحتوي .. ولا بروتوكول
const safeSrc = (v: unknown): string | null => {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s.startsWith('/') || s.startsWith('//') || s.includes('..') || s.includes('\\')) return null;
  if (!/\.(webp|jpe?g|png|avif|gif)$/i.test(s)) return null;
  return s.slice(0, 200);
};

export function sanitizeSettings(raw: unknown): Settings {
  const d = defaultSettings;
  const r = isObj(raw) ? raw : {};

  // الأقسام
  const sections = {} as Record<SectionId, SectionSetting>;
  const rs = isObj(r.sections) ? r.sections : {};
  for (const id of sectionIds) {
    const one = isObj(rs[id]) ? (rs[id] as Record<string, unknown>) : {};
    sections[id] = {
      visible: sectionMeta[id].hideable ? (typeof one.visible === 'boolean' ? one.visible : true) : true,
      theme: one.theme === 'old' || one.theme === 'new' ? one.theme : d.sections[id].theme,
    };
  }

  // التواصل
  const rc = isObj(r.contact) ? r.contact : {};
  const contact: ContactInfo = {
    phone: str(rc.phone, d.contact.phone, 30),
    phoneDisplay: str(rc.phoneDisplay, d.contact.phoneDisplay, 30),
    whatsapp: str(rc.whatsapp, d.contact.whatsapp, 20).replace(/[^\d]/g, '') || d.contact.whatsapp,
    email: str(rc.email, d.contact.email, 120),
    city: str(rc.city, d.contact.city, 80),
  };

  // الواجهة
  const rh = isObj(r.hero) ? r.hero : {};
  const hero: HeroInfo = {
    badge: str(rh.badge, d.hero.badge, 80),
    accent: str(rh.accent, d.hero.accent, 80),
    rest: str(rh.rest, d.hero.rest, 160),
    subtitle: str(rh.subtitle, d.hero.subtitle, 400),
  };

  // الخدمات
  let services = d.services;
  if (Array.isArray(r.services)) {
    services = r.services
      .filter(isObj)
      .slice(0, 24)
      .map((s) => ({
        title: str(s.title, 'خدمة', 80),
        description: str(s.description, '', 300),
        icon: iconNames.includes(s.icon as IconName) ? (s.icon as IconName) : 'wiring',
      }));
  }

  // الخطوات
  let steps = d.steps;
  if (Array.isArray(r.steps)) {
    steps = r.steps
      .filter(isObj)
      .slice(0, 12)
      .map((s) => ({ title: str(s.title, 'خطوة', 80), text: str(s.text, '', 300) }));
  }

  // الأعمال
  let projects = d.projects;
  if (Array.isArray(r.projects)) {
    projects = r.projects
      .filter(isObj)
      .slice(0, 200)
      .flatMap((p) => {
        const src = safeSrc(p.src);
        if (!src) return [];
        return [
          {
            src,
            title: str(p.title, 'عمل', 100),
            caption: str(p.caption, '', 200),
            width: num(p.width, 1200),
            height: num(p.height, 900),
            category: categories.includes(p.category as ProjectCategory) ? (p.category as ProjectCategory) : 'lighting',
            visible: typeof p.visible === 'boolean' ? p.visible : true,
          },
        ];
      });
  }

  return { sections, contact, hero, services, steps, projects };
}

/* ───────── روابط التواصل من الإعدادات ───────── */
export function contactLinks(c: ContactInfo) {
  return {
    tel: `tel:${c.phone}`,
    mail: `mailto:${c.email}`,
    wa: (text?: string) => `https://wa.me/${c.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`,
  };
}

/* ───────── روابط التنقل: نخفي رابط أي قسم مخفي ───────── */
export function visibleNav(sections: Record<SectionId, SectionSetting>) {
  const map: Record<string, SectionId | undefined> = {
    '#top': 'hero',
    '#services': 'services',
    '#projects': 'projects',
    '#process': 'process',
    '#contact': 'contact',
  };
  return defaultNav.filter((l) => {
    const id = map[l.href];
    return !id || sections[id].visible;
  });
}
