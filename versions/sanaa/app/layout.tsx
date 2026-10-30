import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'كهربائي صنعاء',
  description: 'أفضل خدمات الكهرباء في صنعاء مع خبرة عالية وجودة ممتازة',
  keywords: ['كهربائي', 'صنعاء', 'صيانة كهرباء', 'فني كهرباء', 'تمديدات كهربائية'],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar">
      <body dir="rtl">
        {children}
      </body>
    </html>
  );
}
