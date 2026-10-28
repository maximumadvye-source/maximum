import type { Metadata, Viewport } from 'next';
import Providers from '@/components/Providers';
import { site } from '@/lib/site';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  keywords: ['كهرباء', 'مهندس كهرباء', 'صنعاء', 'لوحات توزيع', 'تمديدات كهربائية', 'ADAMOMER'],
  openGraph: {
    title: site.title,
    description: site.description,
    locale: 'ar_YE',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fbfaf7',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" translate="no">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
