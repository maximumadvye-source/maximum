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
      title: 'تجربة رقمية',
      description: 'تجربة ويب ثلاثية الأبعاد غامرة وجذابة.',
      image: 'https://images.unsplash.com/photo-1634986066530-a5a0dbf2cbf1?w=500',
      category: 'ثري دي',
    },
    {
      title: 'هوية بصرية',
      description: 'عرض تفاعلي للعلامة التجارية بشكل احترافي.',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
      category: 'تصميم',
    },
    {
      title: 'موشن جرافيك',
      description: 'سرد بصري متحرك بتقنيات احترافية.',
      image: 'https://images.unsplash.com/photo-1579822261290-991b38693d1b?w=500',
      category: 'أنيميشن',
    },
    {
      title: 'تطوير مواقع',
      description: 'حلول ويب متكاملة للواجهة والخلفية.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500',
      category: 'تطوير',
    },
  ];

  const portfolioItems = items || defaultItems;
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section
      id="portfolio"
      className="min-h-screen bg-dark py-20 px-4"
      dir="rtl"
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
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
