'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface NavigationLink {
  label: string;
  href: string;
}

interface HeaderProps {
  links?: NavigationLink[];
  onMenuClick?: () => void;
}

export default function Header({ links = [], onMenuClick }: HeaderProps) {
  const defaultLinks: NavigationLink[] = [
    { label: 'الرئيسية', href: '#' },
    { label: 'الخدمات', href: '#services' },
    { label: 'الأعمال', href: '#portfolio' },
    { label: 'تواصل معنا', href: '#contact' },
  ];

  const navLinks = links.length > 0 ? links : defaultLinks;

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 glass mx-4 mt-4 rounded-full"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      dir="rtl"
    >
      <nav className="flex items-center justify-between px-8 py-4">

        {/* Logo */}
        <motion.div
          className="text-2xl font-bold gradient-text"
          whileHover={{ scale: 1.05 }}
        >
          آدم
        </motion.div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.href}
              className="text-gray-300 hover:text-white transition-colors"
              whileHover={{ color: '#667eea' }}
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        {/* Button */}
        <motion.button
          className="glass px-6 py-2 rounded-full text-sm font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ابدأ الآن
        </motion.button>
      </nav>
    </motion.header>
  );
}
