'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
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

export default function DashboardPage() {
  const { user } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);

  // Background Slider Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      id: 'olympiad',
      title: 'Olympiad',
      description: user?.role === 'admin' ? 'Manage teams and matches' : 'Register your team now!',
      href: user?.role === 'admin' ? '/admin/olympiad' : '/olympiad/home',
      icon: '🏅',
      color: 'from-yellow-400 to-orange-500',
      shadow: 'shadow-orange-200'
    },
    {
      id: 'league',
      title: 'League of Glory',
      description: 'Join the ultimate sports league',
      href: '/log',
      icon: '⚔️',
      color: 'from-purple-500 to-indigo-600',
      shadow: 'shadow-indigo-200'
    },
    {
      id: 'booking',
      title: 'Book a Court',
      description: user?.role === 'admin' ? 'Manage court bookings' : 'View courts info and book slots',
      href: user?.role === 'admin' ? '/admin/bookings' : '/courts/home',
      icon: '🎾',
      color: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-emerald-200'
    },
  ];

  return (
    <ProtectedRoute>
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
                Official Sports Society
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl">
                SPORTICS <span className="text-blue-400">KARACHI</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                Where passion meets performance. Promoting athletics, sportsmanship, and a vibrant competitive culture at FAST NUCES.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ================= ACTION CARDS ================= */}
        <div className="container mx-auto px-4 -mt-24 relative z-20 mb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link href={feature.href} key={feature.id} className="block h-full">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (index * 0.1), duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  className={`group relative bg-white h-full rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 ${feature.shadow}`}
                >
                  <div className={`h-2 w-full bg-gradient-to-r ${feature.color}`} />
                  <div className="p-8">
                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h2>
                    <p className="text-gray-500 mb-6">{feature.description}</p>
                    <div className="text-blue-600 font-bold flex items-center group-hover:translate-x-2 transition-transform">
                      Explore <span className="ml-2">→</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* ================= INFO SECTION ================= */}
        <div className="container mx-auto px-4 pb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What We Do</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              We manage year-round sports activities, major tournaments, and campus-wide athletic events to build a united campus environment.
            </p>
          </div>

          {/* Section 1: The Events */}
          <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🏆</span>
                  <h3 className="text-2xl font-bold text-gray-800">Major Annual Events</h3>
                </div>

                <div className="space-y-6">
                  <div className="pl-4 border-l-4 border-orange-400">
                    <h4 className="text-lg font-bold text-gray-900">Olympiad</h4>
                    <p className="text-sm text-orange-600 font-semibold mb-1">Open for Everyone</p>
                    <p className="text-gray-600 text-sm">A flagship multi-sport event where teams from universities, colleges, and clubs across Karachi compete in Cricket, Futsal, Badminton, and more.</p>
                  </div>

                  <div className="pl-4 border-l-4 border-indigo-500">
                    <h4 className="text-lg font-bold text-gray-900">League of Glory</h4>
                    <p className="text-sm text-indigo-600 font-semibold mb-1">FAST Karachi Exclusive</p>
                    <p className="text-gray-600 text-sm">A competitive internal league where Departments and Student Teams battle for titles and bragging rights.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-4"
            >
              {['Cricket', 'Futsal', 'Badminton', 'Volleyball'].map((sport, i) => (
                <div key={i} className="bg-blue-50 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-blue-100 transition-colors shadow-sm">
                  <div className="text-4xl mb-3">
                    {i === 0 ? '🏏' : i === 1 ? '⚽' : i === 2 ? '🏸' : '🏐'}
                  </div>
                  <span className="font-bold text-blue-900">{sport}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Section 2: Management & Impact */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-gray-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="relative z-10 grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="bg-blue-600/80 p-2 rounded-lg">📅</span>
                  Campus Management
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Sportics handles the scheduling and reservation system for all on-campus sports facilities. Students can book slots and request equipment easily through our platform.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Futsal Ground', 'Basketball Court', 'Table Tennis Area', 'Cricket Nets', 'Badminton Court'].map((item) => (
                    <span key={item} className="px-4 py-2 bg-white/10 rounded-xl text-sm border border-white/10 text-blue-100 font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="bg-purple-600/80 p-2 rounded-lg">🚀</span>
                  Our Goals & Impact
                </h3>
                <ul className="space-y-4">
                  {[
                    'Promote a healthy and active student lifestyle',
                    'Build teamwork, leadership, and discipline',
                    'Provide equal opportunities for all skill levels',
                    'Enhance the sports culture at FAST Karachi'
                  ].map((goal, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-300">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] shrink-0" />
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ================= NEW SECTION: INFINITE IMAGE MARQUEE ================= */}
        <div className="py-16 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 text-center mb-8">
            <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em]">
              Join the Action #SporticsFAST
            </p>
          </div>

          <div className="absolute top-0 left-0 w-20 md:w-40 h-full bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute top-0 right-0 w-20 md:w-40 h-full bg-gradient-to-l from-white to-transparent z-10"></div>

          {/* THE FIX: 
              We use `flex` on the parent.
              We create TWO identical tracks. 
              Each track translates from 0 to -100%.
              Since Track 2 is right next to Track 1, it slides in perfectly.
           */}
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
              className="flex gap-6 pr-6 flex-shrink-0" // gap-6 handles spacing, pr-6 adds spacing after the last item
            >
              {/* We duplicate the images once here to ensure the track is long enough for wide screens */}
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

            {/* TRACK 2 (Identical to Track 1) */}
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
    </ProtectedRoute>
  );
}