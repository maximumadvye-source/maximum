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
          <h1 className="text-5xl font-bold gradient-text mb-8">كهربائي صنعاء</h1>
          
          <div className="glass p-8 rounded-xl space-y-6">

            {/* قسم الخدمات */}
            <div>
              <h2 className="text-2xl font-bold mb-4">من نحن</h2>
              <p className="text-gray-400 leading-relaxed">
                نحن فريق متخصص في أعمال الكهرباء داخل مدينة صنعاء، نقدم خدمات الصيانة 
                والتركيب والتمديدات الكهربائية بجودة عالية وسرعة تنفيذ، مع التزام كامل 
                بمعايير الأمان والسلامة.
              </p>
            </div>

            {/* قسم المميزات */}
            <div>
              <h2 className="text-2xl font-bold mb-4">خدماتنا</h2>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>صيانة الأعطال الكهربائية المنزلية</li>
                <li>تمديدات كهربائية كاملة للمنازل والمحلات</li>
                <li>تركيب وصيانة لوحات التحكم الكهربائية</li>
                <li>فحص وقياس الأحمال الكهربائية</li>
                <li>تركيب إنارة LED وتوفير الطاقة</li>
                <li>تصليح القصر الكهربائي (شورت)</li>
              </ul>
            </div>

            {/* قسم الجودة */}
            <div>
              <h2 className="text-2xl font-bold mb-4">لماذا نحن؟</h2>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>خبرة طويلة في مجال الكهرباء داخل صنعاء</li>
                <li>خدمة سريعة تصل إلى موقعك في أقرب وقت</li>
                <li>ضمان على العمل المنفذ</li>
                <li>أسعار مناسبة وجودة عالية</li>
                <li>نستخدم أدوات حديثة وتقنيات فحص متطورة</li>
              </ul>
            </div>

            {/* الأداء */}
            <div>
              <h2 className="text-2xl font-bold mb-4">هدفنا</h2>
              <p className="text-gray-400 leading-relaxed">
                هدفنا تقديم خدمة كهربائية آمنة وموثوقة لجميع العملاء في 
                مدينة صنعاء، مع الحفاظ على أعلى جودة في التنفيذ والالتزام 
                بالوقت والضمان.
              </p>
            </div>

          </div>
        </motion.div>
      </section>
    </main>
  );
}
