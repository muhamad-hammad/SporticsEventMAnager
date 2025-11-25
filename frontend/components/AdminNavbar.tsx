'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminNavbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    // Base admin link (always shown)
    const baseLinks = [
        { href: '/admin/dashboard', label: 'Home' },
    ];

    // Context-specific links
    const olympiadAdminLinks = [
        { href: '/admin/olympiad', label: 'Admin Panel' },
        { href: '/admin/olympiad/teams', label: 'Manage Teams' },
        { href: '/admin/olympiad/matches', label: 'Manage Matches' },
        { href: '/admin/olympiad/settings', label: 'Settings' },
    ];

    const bookingAdminLinks = [
        { href: '/admin/bookings', label: 'Admin Panel' },
        { href: '/admin/bookings/manage', label: 'Manage Bookings' },
        { href: '/admin/bookings/history', label: 'All Bookings' },
    ];

    const logAdminLinks = [
        { href: '/admin/log', label: 'Admin Panel' },
        { href: '/admin/log/draft', label: 'Draft' },
        { href: '/admin/log/house-proposals', label: 'Proposals' },
        { href: '/admin/log/players', label: 'Players' },
        { href: '/admin/log/matches', label: 'Matches' },
        { href: '/admin/log/settings', label: 'Settings' },
        { href: '/admin/log/conclusion', label: 'Conclusion' },
    ];

    const dashboardLinks = [
        { href: '/admin/olympiad', label: 'Olympiad' },
        { href: '/admin/log', label: 'League of Glory' },
        { href: '/admin/bookings', label: 'Bookings' },
    ];

    // Determine which context we're in
    const isOlympiadAdmin = pathname?.startsWith('/admin/olympiad');
    const isBookingAdmin = pathname?.startsWith('/admin/bookings');
    const isLogAdmin = pathname?.startsWith('/admin/log');
    const isDashboard = pathname === '/admin/dashboard';

    let contextLinks: { href: string; label: string }[] = [];
    if (isDashboard) {
        contextLinks = dashboardLinks;
    } else if (isOlympiadAdmin) {
        contextLinks = olympiadAdminLinks;
    } else if (isBookingAdmin) {
        contextLinks = bookingAdminLinks;
    } else if (isLogAdmin) {
        contextLinks = logAdminLinks;
    }

    return (
        <nav className="bg-gradient-to-r from-gray-900 to-slate-900 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <Link href="/admin/dashboard" className="flex items-center space-x-2">
                        <span className="text-2xl">⚙️</span>
                        <span className="text-xl font-bold">Admin Portal</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* Base links (Dashboard/Home) */}
                        {baseLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === link.href
                                    ? 'bg-white/20 text-white'
                                    : 'text-gray-100 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Context-specific links */}
                        {contextLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === link.href
                                    ? 'bg-white/20 text-white'
                                    : 'text-gray-100 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User Info & Logout */}
                    <div className="flex items-center space-x-4">
                        {pathname !== '/admin/dashboard' && (
                            <Link
                                href="/admin/dashboard"
                                className="text-sm text-gray-100 hover:text-white transition-colors flex items-center space-x-1"
                            >
                                <span>←</span>
                                <span>Admin Dashboard</span>
                            </Link>
                        )}
                        <span className="text-sm text-gray-100">
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
