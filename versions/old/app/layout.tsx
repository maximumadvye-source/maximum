import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: '3D Billboard - Interactive Experience',
  description: 'Amazing 3D billboard website with interactive elements and animations',
  keywords: ['3D', 'Billboard', 'Interactive', 'Web Design', 'Three.js'],
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
