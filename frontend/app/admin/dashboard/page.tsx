'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURATION ---
const heroImages = [
  '/dashboard/1sportics.jpg',
  '/dashboard/2sportics.jpg',
  '/dashboard/3sportics.jpg',
  '/dashboard/4sportics.jpg',
  '/dashboard/5sportics.jpg',
];

export default function AdminDashboard() {
  const [currentImage, setCurrentImage] = useState(0);

  // Background Slider Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const modules = [
    {
      id: 'olympiad',
      title: 'Olympiad',
      description: 'Manage teams, matches, and results',
      href: '/admin/olympiad',
      icon: '🏅',
      color: 'from-yellow-400 to-orange-500',
      shadow: 'shadow-orange-200'
    },
    {
      id: 'league',
      title: 'League of Glory',
      description: 'Oversee draft and player management',
      href: '/admin/log',
      icon: '⚔️',
      color: 'from-purple-500 to-indigo-600',
      shadow: 'shadow-indigo-200'
    },
    {
      id: 'bookings',
      title: 'Court Bookings',
      description: 'Review and manage reservations',
      href: '/admin/bookings',
      icon: '📅',
      color: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-emerald-200'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100 overflow-x-hidden">

      {/* ================= HERO SECTION ================= */}
      <div className="relative h-[550px] w-full overflow-hidden">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 w-full h-full"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImages[currentImage]})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-gray-50/95" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center pt-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-4 rounded-full bg-blue-600/30 backdrop-blur-md border border-blue-400/30 text-blue-100 text-xs font-bold tracking-widest uppercase mb-6 shadow-lg">
              Administration
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl">
              SPORTICS <span className="text-blue-400">ADMIN</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              Manage the Sportics platform. Control events, teams, bookings, and more.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ================= ACTION CARDS ================= */}
      <div className="container mx-auto px-4 -mt-24 relative z-20 mb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <Link href={module.href} key={module.id} className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (index * 0.1), duration: 0.5 }}
                whileHover={{ y: -8 }}
                className={`group relative bg-white h-full rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 ${module.shadow}`}
              >
                <div className={`h-2 w-full bg-gradient-to-r ${module.color}`} />
                <div className="p-8">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{module.icon}</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{module.title}</h2>
                  <p className="text-gray-500 mb-6">{module.description}</p>
                  <div className="text-blue-600 font-bold flex items-center group-hover:translate-x-2 transition-transform">
                    Manage <span className="ml-2">→</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* ================= NEW SECTION: INFINITE IMAGE MARQUEE ================= */}
      <div className="py-16 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center mb-8">
          <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em]">
            Sportics Event Manager
          </p>
        </div>

        <div className="absolute top-0 left-0 w-20 md:w-40 h-full bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="absolute top-0 right-0 w-20 md:w-40 h-full bg-gradient-to-l from-white to-transparent z-10"></div>

        <div className="flex overflow-hidden">

          {/* TRACK 1 */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex gap-6 pr-6 flex-shrink-0"
          >
            {[...heroImages, ...heroImages].map((img, index) => (
              <div
                key={index}
                className="relative h-64 w-96 md:h-96 md:w-[32rem] flex-shrink-0 rounded-2xl overflow-hidden shadow-md border border-gray-100 group"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center grayscale-[50%] group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105"
                  style={{ backgroundImage: `url(${img})` }}
                />
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors duration-300"></div>
              </div>
            ))}
          </motion.div>

          {/* TRACK 2 */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
            className="flex gap-6 pr-6 flex-shrink-0"
          >
            {[...heroImages, ...heroImages].map((img, index) => (
              <div
                key={index}
                className="relative h-64 w-96 md:h-96 md:w-[32rem] flex-shrink-0 rounded-2xl overflow-hidden shadow-md border border-gray-100 group"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center grayscale-[50%] group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105"
                  style={{ backgroundImage: `url(${img})` }}
                />
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors duration-300"></div>
              </div>
            ))}
          </motion.div>

        </div>
      </div>

    </div>
  );
}
