'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface PortfolioItem {
  title: string;
  description: string;
  image: string;
  category: string;
}

interface PortfolioProps {
  items?: PortfolioItem[];
}

export default function Portfolio({ items }: PortfolioProps) {
  const defaultItems: PortfolioItem[] = [
    {
      title: ' شاشات LED العملاقة ',
      description: 'نحول شاشات LED العملاقة إلى عرض بصري مبهر بتحكم وبرمجة احترافية.',
      image: '/SNA14.webp',
      category: 'LED',
    },
    {
      title: 'أنظمة تحكم صناعية',
      description: 'تنفيذ أنظمة تحكم ولوحات تشغيل للمشاريع الصناعية.',
      image: '/SNA183.webp',
      category: 'تحكم',
    },
    {
      title: 'برمجة وتشغيل NovaLCT',
      description: 'إعداد وبرمجة أنظمة NovaLCT لمراقبة وتشغيل المعدات.',
      image: '/SNA45.webp',
      category: 'NovaLCT',
    },
    {
      title: 'LED Receiving Cards',
      description: 'نوفر حلول باور متكاملة لشاشات LED العملاقة مع الكروت المخصصة، لضمان تشغيل مستقر وعرض سلس بجودة عالية.',
      image: '/SNA86.webp',
      category: 'تنفيذ',
    },
    {
      title: 'حلول طاقة متكاملة',
      description: 'نوفر حلول متكاملة للطاقة مع بطاريات الليثيوم (Lithium Batteries) والعاكس (Inverter) لضمان تشغيل مستقر وموثوق للأنظمة الكهربائية والطاقة الشمسية..',
      image: '/SNA125.webp',
      category: 'LV Panels',
    },
    {
      title: '(Circuit Breaker Panels)',
      description: 'نوفر لوحات الطبالين (Circuit Breaker Panels) للمشاريع الكبرى، لضمان حماية الأنظمة الكهربائية وتنظيم الطاقة بكفاءة وأمان كامل..',
      image: '/SNA20.webp',
      category: 'لوحات',
    },
    {
      title: 'تأسيس الكهرباء للمباني',
      description: 'نوفر خدمات تأسيس الكهرباء للمباني من البداية، مع تصميم وتنفيذ كامل يضمن أمان وكفاءة عالية لكل أنظمة الكهرباء..',
      image: '/SNA120.webp',
      category: 'تأسيس',
    },
    {
      title: 'مشاريع كهرباء متكاملة',
      description: 'تنفيذ مشاريع كهربائية من البداية حتى التسليم.',
      image: '/SNA86.webp',
      category: 'مشاريع',
    },
    {
      title: 'تركيب معدات كهربائية',
      description: 'تركيب وفحص المعدات الكهربائية داخل اللوحات.',
      image: '/SNA4.webp',
      category: 'تركيب',
    },
    {
      title: 'اختبار وتشغيل',
      description: 'فحص وتشغيل الأنظمة الكهربائية بعد التنفيذ.',
      image: '/SNA3.webp',
      category: 'تشغيل',
    },
    {
      title: 'لوحات تحكم فرعية',
      description: 'تنفيذ لوحات تحكم فرعية للمعدات والأقسام.',
      image: '/SNA2.webp',
      category: 'لوحات',
    },
    {
      title: 'إضاءة ديكورات احترافية',
      description: 'نوفر خدمات تأسيس كهرباء الإضاءة للديكورات بدقة واحترافية، لضمان توزيع مثالي للضوء وجمالية عالية للمساحات..',
      image: '/SNA1.webp',
      category: 'مواقع',
    },
    {
      title: 'تمديدات داخلية',
      description: 'تمديد الأسلاك والكابلات داخل المباني والمنشآت.',
      image: '/SNA6.webp',
      category: 'تمديد',
    },
    {
      title: 'لوحات تحكم صناعية',
      description: 'تصميم وتنفيذ لوحات تحكم للمصانع والمنشآت الصناعية.',
      image: '/SNA8.webp',
      category: 'صناعة',
    },
  ];




  const portfolioItems = items || defaultItems;
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section
      id="portfolio"
      dir="rtl"
      className="min-h-screen bg-dark py-20 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-5xl font-bold text-center gradient-text mb-20"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          أعمالنا
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {portfolioItems.map((item, index) => (
            <motion.div
              key={index}
              className="group relative overflow-hidden rounded-xl glass cursor-pointer"
              onMouseEnter={() => setHoveredId(index)}
              onMouseLeave={() => setHoveredId(null)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative h-80 overflow-hidden">
                <motion.img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  animate={{ scale: hoveredId === index ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent" />
              </div>

              <motion.div
                className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-dark/90 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredId === index ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-primary text-sm font-semibold mb-2">
                  {item.category}
                </span>
                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm">{item.description}</p>

                <motion.div
                  className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-dark/90 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredId === index ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-primary text-sm font-semibold mb-2">
                    {item.category}
                  </span>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-300 text-sm">{item.description}</p>
                </motion.div>

              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
