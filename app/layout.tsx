export const metadata = {
  title: "موقعي",
  description: "موقع عربي مبني باستخدام Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
