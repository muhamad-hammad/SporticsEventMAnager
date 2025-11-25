'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminNavbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const adminLinks = [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/olympiad', label: 'Olympiad' },
        { href: '/admin/log', label: 'LOG Module' },
        { href: '/admin/bookings', label: 'Bookings' },
    ];

    return (
        <nav className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <Link href="/admin/dashboard" className="flex items-center space-x-2">
                        <span className="text-2xl">⚙️</span>
                        <span className="text-xl font-bold">Admin Panel</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {adminLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    pathname?.startsWith(link.href)
                                        ? 'bg-white/20 text-white'
                                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User Info & Logout */}
                    <div className="flex items-center space-x-4">
                        {user && (
                            <span className="text-sm text-gray-300">
                                👤 {user.username} <span className="text-xs text-yellow-400">(Admin)</span>
                            </span>
                        )}
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
