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
    { label: 'Home', href: '#' },
    { label: 'Services', href: '#services' },
    { label: 'Portfolio', href: '#portfolio' },
    { label: 'Contact', href: '#contact' },
  ];

  const navLinks = links.length > 0 ? links : defaultLinks;

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 glass mx-4 mt-4 rounded-full"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <nav className="flex items-center justify-between px-8 py-4">
        <motion.div
          className="text-2xl font-bold gradient-text"
          whileHover={{ scale: 1.05 }}
        >
          INERTIA
        </motion.div>

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

        <motion.button
          className="glass px-6 py-2 rounded-full text-sm font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </nav>
    </motion.header>
  );
}
