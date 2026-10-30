import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'آدم عمر للكهرباء',
  description: 'خدمات الكهرباء العامة، التمديدات الكهربائية، تركيب وصيانة الأنظمة الكهربائية للمنازل والمنشآت.',
  keywords: [
    'آدم عمر للكهرباء',
    'كهرباء',
    'تمديدات كهربائية',
    'تركيب لوحات كهربائية',
    'صيانة كهرباء',
  ],
};


export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" translate="no">
      <body>
        {children}
      </body>
    </html>
  );
}
