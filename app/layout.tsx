import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'كهربائي صنعاء - خدمات كهربائية احترافية',
  description:
    'أفضل كهربائي في صنعاء يقدم خدمات تركيب وصيانة وإصلاح الأعطال الكهربائية بجودة عالية وسرعة في التنفيذ.',
  keywords: [
    'كهربائي صنعاء',
    'فني كهرباء',
    'خدمات كهربائية',
    'صيانة كهرباء',
    'إصلاح الأعطال الكهربائية',
    'تركيب كهرباء'
  ],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  );
}
