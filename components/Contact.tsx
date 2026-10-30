'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Image from 'next/image';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export default function Contact() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setForm({ name: '', email: '', message: '' });
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <section
      id="contact"
      className="min-h-screen bg-gradient-to-b from-darker to-dark py-20 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h2
          className="text-5xl font-bold text-center gradient-text mb-20"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Get in Touch
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Contact Info */}
          <div className="space-y-8">
            <motion.div
              className="glass p-6 rounded-xl"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-bold mb-4">📍 Location</h3>
              <p className="text-gray-400">
                Your City, Your Country
              </p>
            </motion.div>

            <motion.div
              className="glass p-6 rounded-xl"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-bold mb-4">📧 Email</h3>
              <p className="text-gray-400">adam026@outlook.sa</p>
            </motion.div>

            <motion.div
              className="glass p-6 rounded-xl"
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-bold mb-4">📱 Phone</h3>
              <p className="text-gray-400">+967771199341</p>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full glass px-4 h-12 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full glass px-4 h-12 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="w-full glass px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary resize-none h-36"
                placeholder="Your message..."
                required
              ></textarea>
            </div>

            <motion.button
              type="submit"
              className="w-full px-6 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-shadow shadow-md"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitted ? '✓ Sent Successfully!' : 'Send Message'}
            </motion.button>
          </motion.form>
        </motion.div>

        {isSubmitted && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-60">
            <div className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md">تم إرسال الرسالة بنجاح</div>
          </div>
        )}

        {/* Footer */}
        <motion.div
          className="mt-20 pt-12 border-t border-gray-800 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-gray-500 mb-4">
            © 2024  . All rights reserved.
          </p>
          <div className="flex justify-center gap-6">
            <a
              href="https://www.facebook.com/share/17N3KiPmxr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Image
                src="/facebook-2870.svg"
                alt="Facebook"
                width={22}
                height={22}
                className="inline-block"
              />
            </a>

            <a
              href="https://wa.me/967771199341"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Image
                src="/whatsapp-logo-2449.svg"
                alt="WhatsApp"
                width={22}
                height={22}
                className="inline-block"
              />
            </a>

            <a
              href="https://www.tiktok.com/@adamoar77?_r=1&_t=ZS-92BytnEQYiq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Image
                src="/tiktok-logo-4500.svg"
                alt="TikTok"
                width={22}
                height={22}
                className="inline-block"
              />
            </a>

            <a
              href="https://www.instagram.com/lmry5297?igsh=eWpyZnN4ejY1bmtt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Image
                src="/instagram-logo-8869.svg"
                alt="Instagram"
                width={22}
                height={22}
                className="inline-block"
              />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
