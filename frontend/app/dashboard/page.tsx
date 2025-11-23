'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  const features = [
    {
      id: 'olympiad',
      title: 'Olympiad',
      description: user?.role === 'admin' ? 'Manage teams and matches' : 'Register your team now!',
      href: user?.role === 'admin' ? '/admin/olympiad' : '/olympiad/home',
      icon: '🏅'
    },
    {
      id: 'league',
      title: 'League of Glory',
      description: 'Coming soon...',
      href: '#',
      icon: '⚔️'
    },
    {
      id: 'booking',
      title: 'Book a Court',
      description: user?.role === 'admin' ? 'Manage court bookings' : 'View courts info and book slots',
      href: user?.role === 'admin' ? '/admin/bookings' : '/courts/home',
      icon: '🎾'
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 mb-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
              Welcome, {user?.username}!
            </h1>
            <p className="text-xl text-blue-100 font-medium">
              Role: <span className="capitalize bg-white/20 px-3 py-1 rounded-full text-sm ml-2">{user?.role}</span>
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Link
                key={feature.id}
                href={feature.href}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
              >
                <div className={`h-2 bg-gradient-to-r ${feature.id === 'olympiad' ? 'from-yellow-400 to-orange-500' :
                  feature.id === 'booking' ? 'from-green-400 to-emerald-500' :
                    'from-purple-400 to-pink-500'
                  }`} />
                <div className="p-8">
                  <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                    Explore <span className="ml-2">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
