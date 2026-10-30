'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ServiceCard {
  title: string;
  description: string;
  icon?: string;
}

interface ServicesProps {
  services?: ServiceCard[];
}

export default function Services({ services }: ServicesProps) {
  const defaultServices: ServiceCard[] = [
    {
      title: 'التمديدات الكهربائية',
      description: 'تنفيذ كامل لأعمال التأسيس والتمديدات للمباني السكنية والتجارية.',
    },
    {
      title: 'تركيب اللوحات الكهربائية',
      description: 'تركيب وصيانة لوحات التوزيع والتحكم بمعايير أمان عالية.',
    },
    {
      title: 'صيانة الأنظمة الكهربائية ',
      description: 'فحص الأعطال ورفع كفاءة التشغيل لجميع الأنظمة الكهربائية.',
    },
    {
      title: 'أنظمة الإضاءة',
      description: 'تنفيذ حلول إضاءة داخلية وخارجية تناسب مختلف المشاريع.',
    },
    {
      title: 'اختبار وفحص السلامة',
      description: 'اختبارات دورية لضمان سلامة النظام الكهربائي ومعايير الحماية.',
    },
    {
      title: 'التأريض والحماية',
      description: 'تنفيذ أنظمة التأريض وحماية الأحمال لضمان تشغيل آمن.',
    },
    {
      title: 'تطوير وترقية الأنظمة',
      description: 'ترقية الأنظمة الكهربائية القديمة لتصبح أكثر كفاءة وأماناً.',
    },
    {
      title: 'الربط مع شبكات الطاقة',
      description: 'تنفيذ الربط مع الشبكات العامة وتجهيز المواقع للتشغيل.',
    },
  ];


  const serviceList = services || defaultServices;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section
      id="services"
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-dark to-darker py-20 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-5xl font-bold text-center gradient-text mb-20"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          خدماتنا
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
        >
          {serviceList.map((service, index) => (
            <motion.div
              key={index}
              className={`glass p-6 rounded-xl group cursor-pointer transition-transform transition-shadow ${index === 0 ? 'scale-100 border-2 border-blue-500 glow-pulse' : ''}`}
              variants={itemVariants}
              whileHover={{
                y: -12,
                boxShadow: '0 20px 60px rgba(102, 126, 234, 0.55)',
                transform: 'translateY(-12px)',
              }}
            >
              <div className="mb-4 text-4xl opacity-0 group-hover:opacity-100 transition-opacity">
                {service.icon || '✨'}
              </div>
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
