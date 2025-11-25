'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LogNavbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const logLinks = [
        { href: '/log', label: 'Home' },
        { href: '/log/register', label: 'Register' },
        { href: '/log/house-proposal', label: 'House Proposal' },
        { href: '/log/my-teams', label: 'My Teams' },
        { href: '/log/schedule', label: 'Schedule' },
        { href: '/log/results', label: 'Results' },
        { href: '/log/leaderboard', label: 'Leaderboard' },
        { href: '/log/conclusion', label: 'Conclusion' },
        ...(user?.role === 'captain' ? [{ href: '/log/drafts', label: 'Drafts' }] : []),
    ];

    return (
        <nav className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <Link href="/log" className="flex items-center space-x-2">
                        <span className="text-2xl">⚔️</span>
                        <span className="text-xl font-bold">League of Glory</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {logLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === link.href
                                    ? 'bg-white/20 text-white'
                                    : 'text-purple-100 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User Info & Logout */}
                    <div className="flex items-center space-x-4">
                        <Link
                            href={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
                            className="text-sm text-purple-100 hover:text-white transition-colors flex items-center space-x-1"
                        >
                            <span>←</span>
                            <span>Back to Dashboard</span>
                        </Link>
                        <span className="text-sm text-purple-100">
                            {user?.username}
                        </span>
                        <button
                            onClick={logout}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
