# دليل التطوير

## البدء السريع

### 1. التثبيت
\`\`\`bash
npm install
\`\`\`

### 2. التشغيل
\`\`\`bash
npm run dev
\`\`\`

### 3. فتح في المتصفح
\`\`\`
http://localhost:3000
\`\`\`

## هيكل الملفات

### المكونات الرئيسية

#### Billboard3D.tsx
مكون اللوحة الإعلانية ثلاثية الأبعاد:
- يستخدم Three.js للرسوميات
- يتابع حركة الماوس
- يحتوي على إضاءة واقعية
- يرسم خلفية من النجوم

**الخصائص:**
- \`title\` - عنوان اللوحة
- \`subtitle\` - النص الفرعي
- \`imageUrl\` - رابط الصورة

#### Header.tsx
شريط التنقل العلوي:
- روابط التنقل
- تأثيرات عند التحويم
- زر البدء

**الخصائص:**
- \`links\` - قائمة الروابط
- \`onMenuClick\` - دالة عند الضغط على القائمة

#### Services.tsx
قسم الخدمات:
- بطاقات الخدمات
- حركات سلسة
- تأثيرات توهج

**الخصائص:**
- \`services\` - مصفوفة الخدمات

#### Portfolio.tsx
قسم المحفظة:
- شبكة معرض الأعمال
- صور مع حركات زووم
- معلومات عند التمرير

**الخصائص:**
- \`items\` - عناصر المحفظة

#### ParticleSystem.tsx
نظام الجزيئات:
- جزيئات متحركة في الخلفية
- خطوط الاتصال بين الجزيئات
- يتكيف مع حجم النافذة

**الخصائص:**
- \`count\` - عدد الجزيئات (افتراضي: 100)
- \`speed\` - سرعة الحركة (افتراضي: 2)

## التخصيص

### تغيير الألوان

تحرير \`tailwind.config.js\`:
\`\`\`javascript
theme: {
  extend: {
    colors: {
      primary: '#667eea',      // لون المتدرج الأساسي
      secondary: '#764ba2',    // لون ثانوي
      dark: '#0a0e27',        // لون الخلفية
      darker: '#050812',       // لون الخلفية الداكن
    },
  },
},
\`\`\`

### تغيير الخطوط

تحرير \`app/layout.tsx\`:
\`\`\`tsx
// أضف مكتبة الخطوط
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
\`\`\`

## الحركات والتأثيرات

### Framer Motion
تستخدم المكونات Framer Motion لتأثيرات سلسة:

\`\`\`tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  المحتوى
</motion.div>
\`\`\`

### GSAP
يمكن استخدام GSAP لحركات أكثر تعقيداً:

\`\`\`tsx
import gsap from 'gsap';

gsap.to(element, { duration: 1, rotation: 360 });
\`\`\`

## الأداء

### تحسينات الأداء

1. **تحميل الصور الكسول:**
   \`\`\`tsx
   import Image from 'next/image';
   <Image src={url} alt={alt} loading="lazy" />
   \`\`\`

2. **تقسيم الكود:**
   تم استخدام dynamic imports تلقائياً بواسطة Next.js

3. **Memoization:**
   \`\`\`tsx
   import { memo } from 'react';
   const Component = memo(() => {...});
   \`\`\`

## التطوير

### إضافة صفحة جديدة

\`\`\`tsx
// app/about/page.tsx
export default function About() {
  return <div>حول</div>;
}
\`\`\`

### إضافة مكون جديد

\`\`\`tsx
// components/NewComponent.tsx
'use client';

export default function NewComponent() {
  return <div>المكون الجديد</div>;
}
\`\`\`

### إضافة أنماط جديدة

\`\`\`css
/* styles/globals.css */
@layer components {
  .custom-class {
    @apply text-lg font-bold text-primary;
  }
}
\`\`\`

## الإنشاء والنشر

### بناء للإنتاج

\`\`\`bash
npm run build
npm start
\`\`\`

### النشر على Vercel

\`\`\`bash
npm install -g vercel
vercel
\`\`\`

### النشر على موقع آخر

1. قم بتشغيل \`npm run build\`
2. ارفع المجلد \`.next\` وملف \`package.json\` و\`public\`
3. قم بتثبيت الحزم وتشغيل \`npm start\`

## حل المشاكل

### الخطأ: "Module not found"
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### الخطأ: "Cannot find module 'three'"
\`\`\`bash
npm install three @react-three/fiber @react-three/drei
\`\`\`

### الخطأ في الرسوميات 3D
تأكد من أن متصفحك يدعم WebGL.

## الموارد

- [Next.js Documentation](https://nextjs.org/docs)
- [Three.js Documentation](https://threejs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [GSAP](https://greensock.com/gsap/)

## الدعم

للأسئلة والمساعدة، يرجى التواصل مع فريق التطوير.
