/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 🔧 تعطيل ESLint أثناء البناء في Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
