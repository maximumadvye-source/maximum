/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    // يضمن وجود ملف الإعدادات داخل دوال Vercel (قراءة data/settings.json أثناء التشغيل)
    outputFileTracingIncludes: {
      '/': ['./data/**/*'],
      '/admin': ['./data/**/*'],
    },
  },
};

export default nextConfig;
