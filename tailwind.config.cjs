// الألوان معرّفة كمتغيرات CSS في styles/globals.css،
// وتتبدّل تلقائياً حسب الثيم: data-theme="new" (الخلفية الجديدة) أو data-theme="old" (القديمة).
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fg: v('fg'), // لون النص الأساسي
        muted: v('muted'), // النص الثانوي
        bg: v('bg'), // خلفية القسم
        surface: v('surface'), // البطاقات
        dark: v('dark'), // الأقسام الكحلية الدائمة (التواصل، الفوتر، الشريط)
        accent: { DEFAULT: v('accent'), soft: v('accent-soft') }, // الأزرق
        warm: { DEFAULT: v('warm'), soft: v('warm2') }, // البرتقالي / الأصفر
      },
    },
  },
  plugins: [],
};
