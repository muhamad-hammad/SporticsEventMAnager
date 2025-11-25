'use client';


import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
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
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100">

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-800 to-slate-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Admin <span className="text-blue-400">Dashboard</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Manage the Sportics platform. Control events, teams, bookings, and more.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="container mx-auto px-4 -mt-12 relative z-20 mb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <Link href={module.href} key={module.id} className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
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

    </div>
  );
}
