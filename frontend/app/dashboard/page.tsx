'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

  const features = [
    { title: 'Sports', description: 'View and manage sports', href: '/sports', icon: '🏆' },
    { title: 'Houses', description: 'View and manage houses', href: '/houses', icon: '🏠' },
    { title: 'Teams', description: 'View and manage teams', href: '/teams', icon: '👥' },
    { title: 'Courts', description: 'View available courts', href: '/courts', icon: '🎾' },
    { title: 'Book Court', description: 'Book a court slot', href: '/bookings', icon: '📅' },
    { title: 'Register Player', description: 'Register as player & for sports', href: '/player-registration', icon: '✍️' },
  ];

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Role: <span className="font-semibold capitalize">{user?.role}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {feature.title}
              </h2>
              <p className="text-gray-600">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
