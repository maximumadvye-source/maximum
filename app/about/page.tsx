'use client';

import { motion } from 'framer-motion';
import Header from '@/components/Header';

export default function About() {
  return (
    <main className="w-full min-h-screen bg-dark pt-32">
      <Header />
      
      <section className="max-w-4xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold gradient-text mb-8">عن الموقع</h1>
          
          <div className="glass p-8 rounded-xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">تقنيات متقدمة</h2>
              <p className="text-gray-400 leading-relaxed">
                تم بناء هذا الموقع باستخدام أحدث التقنيات في مجال تطوير الويب، بما في ذلك:
              </p>
              <ul className="list-disc list-inside text-gray-400 mt-4 space-y-2">
                <li>Next.js 14 - إطار عمل React الحديث</li>
                <li>Three.js - محرك الرسوميات ثلاثية الأبعاد</li>
                <li>WebGL - لرسوميات عالية الأداء</li>
                <li>Tailwind CSS - تصميم حديث ومرن</li>
                <li>Framer Motion - حركات سلسة وانتقالات</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">المميزات</h2>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>كهرائي صنعاء</li>
                <li>تتابع حركة الماوس بدقة عالية</li>
                <li>تأثيرات توهج (Bloom) محسّنة</li>
                <li>حركة كاميرا ديناميكية</li>
                <li>واجهة مستخدم احترافية وسلسة</li>
                <li>محسّن لجميع الأجهزة والمتصفحات</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">الأداء</h2>
              <p className="text-gray-400 leading-relaxed">
                تم تحسين الموقع لأعلى أداء ممكنة مع الحفاظ على جودة الرسوميات، 
                باستخدام تقنيات مثل postprocessing ذكي، وتحسين استهلاك الذاكرة، 
                وتحميل الموارد بكفاءة.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
