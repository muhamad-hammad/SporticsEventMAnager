'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function LogLandingPage() {
    const features = [
        {
            title: 'Player Registration',
            description: 'Register yourself for the League of Glory sports.',
            href: '/log/register',
            icon: '📝',
            color: 'bg-blue-500'
        },
        {
            title: 'House Proposal',
            description: 'Propose a new house and become a captain.',
            href: '/log/house-proposal',
            icon: '🏠',
            color: 'bg-purple-500'
        },
        {
            title: 'Draft Sessions',
            description: 'View and participate in player draft sessions.',
            href: '/log/drafts',
            icon: '👥',
            color: 'bg-green-500'
        },
        {
            title: 'My Teams',
            description: 'View your teams and squad details.',
            href: '/log/my-teams',
            icon: '👕',
            color: 'bg-orange-500'
        },
        {
            title: 'Schedule',
            description: 'Check upcoming matches and venues.',
            href: '/log/schedule',
            icon: '📅',
            color: 'bg-teal-500'
        },
        {
            title: 'Results',
            description: 'View match results and scores.',
            href: '/log/results',
            icon: '📊',
            color: 'bg-indigo-500'
        },
        {
            title: 'Leaderboard',
            description: 'Check house standings and points.',
            href: '/log/leaderboard',
            icon: '📈',
            color: 'bg-red-500'
        },
        {
            title: 'Season Results',
            description: 'View final standings and champions.',
            href: '/log/conclusion',
            icon: '🏆',
            color: 'bg-yellow-500'
        }
    ];

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                            League of Glory
                        </h1>
                        <p className="text-xl text-gray-600">
                            Welcome to the premier sports league. Choose an action to proceed.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature) => (
                            <Link
                                key={feature.title}
                                href={feature.href}
                                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1"
                            >
                                <div className={`h-2 ${feature.color}`} />
                                <div className="p-8">
                                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                        {feature.title}
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        {feature.description}
                                    </p>
                                    <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                                        Go to {feature.title} <span className="ml-2">→</span>
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
