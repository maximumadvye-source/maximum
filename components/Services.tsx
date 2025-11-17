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
      title: '3D Design',
      description: 'High-quality 3D modeling and visualization',
    },
    {
      title: 'Interactive',
      description: 'Engaging user experiences with motion',
    },
    {
      title: 'Performance',
      description: 'Optimized for all devices and browsers',
    },
    {
      title: 'Modern Tech',
      description: 'Built with latest web technologies',
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
      className="min-h-screen bg-gradient-to-b from-dark to-darker py-20 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-5xl font-bold text-center gradient-text mb-20"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our Services
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
              className="glass p-8 rounded-xl group cursor-pointer glow"
              variants={itemVariants}
              whileHover={{
                y: -10,
                boxShadow: '0 0 40px rgba(102, 126, 234, 0.6)',
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
