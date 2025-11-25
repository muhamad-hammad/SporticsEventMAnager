'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CourtsNavbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const courtsLinks = [
        { href: '/courts/home', label: 'Home' },
        { href: '/courts/info', label: 'Courts Info' },
        { href: '/courts/book', label: 'Book Court' },
        { href: '/courts/bookings', label: 'View Bookings' },
    ];

    return (
        <nav className="bg-gradient-to-r from-green-700 to-emerald-800 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <Link href="/courts/home" className="flex items-center space-x-2">
                        <span className="text-2xl">🎾</span>
                        <span className="text-xl font-bold">Court Booking</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {courtsLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === link.href
                                    ? 'bg-white/20 text-white'
                                    : 'text-green-100 hover:bg-white/10 hover:text-white'
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
                            className="text-sm text-green-100 hover:text-white transition-colors flex items-center space-x-1"
                        >
                            <span>←</span>
                            <span>Back to Dashboard</span>
                        </Link>
                        <span className="text-sm text-green-100">
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
