'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
      <nav className="flex items-center justify-between px-6 py-3">
        <motion.div
          className="text-2xl font-bold gradient-text"
          whileHover={{ scale: 1.05 }}
        >
          ADAMOMER
        </motion.div>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, index) => (
            <NavLink key={index} href={link.href} label={link.label} />
          ))}
        </div>

        <motion.button
          className="px-5 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:shadow-lg transition"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          ADAMOMER
        </motion.button>
      </nav>
    </motion.header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const update = () => setActive(window.location.hash === href || (href === '#' && !window.location.hash));
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, [href]);

  return (
    <a
      href={href}
      className={`transition-colors py-1 ${active ? 'text-white border-b-2 border-blue-400' : 'text-gray-300 hover:text-white'}`}
    >
      {label}
    </a>
  );
}
