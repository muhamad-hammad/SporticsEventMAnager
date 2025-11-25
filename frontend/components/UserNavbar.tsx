'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function UserNavbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    // Base user link (always shown)
    const baseLinks = [
        { href: '/user/dashboard', label: 'Home' },
    ];

    // Context-specific links
    const olympiadLinks = [
        { href: '/olympiad/home', label: 'Olympiad Home' },
        { href: '/olympiad/sports', label: 'Sports' },
        { href: '/olympiad/teams', label: 'Teams' },
    ];

    const courtLinks = [
        { href: '/courts/home', label: 'Courts Info' },
        { href: '/courts/book', label: 'Book a Court' },
        { href: '/bookings', label: 'My Bookings' },
    ];

    const logLinks = [
        { href: '/log', label: 'LOG Home' },
        { href: '/log/register', label: 'Register' },
        { href: '/log/events', label: 'Events' },
        ...(user?.role === 'captain' ? [{ href: '/log/drafts', label: 'Drafts' }] : []),
    ];

    const dashboardLinks = [
        { href: '/olympiad/home', label: 'Olympiad' },
        { href: '/log', label: 'League of Glory' },
        { href: '/courts/home', label: 'Book a Court' },
    ];

    // Determine which context we're in
    const isOlympiad = pathname?.startsWith('/olympiad');
    const isCourts = pathname?.startsWith('/courts') || pathname?.startsWith('/bookings');
    const isLog = pathname?.startsWith('/log');
    const isDashboard = pathname === '/user/dashboard';

    let contextLinks: { href: string; label: string }[] = [];
    if (isDashboard) {
        contextLinks = dashboardLinks;
    } else if (isOlympiad) {
        contextLinks = olympiadLinks;
    } else if (isCourts) {
        contextLinks = courtLinks;
    } else if (isLog) {
        contextLinks = logLinks;
    }

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <Link href="/user/dashboard" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-blue-600">Sportics</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {/* Base links (Dashboard/Home) */}
                        {baseLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === link.href
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
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
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* User Info & Logout */}
                    <div className="flex items-center space-x-4">
                        {pathname !== '/user/dashboard' && (
                            <Link
                                href="/user/dashboard"
                                className="text-sm text-gray-600 hover:text-blue-600 transition-colors flex items-center space-x-1"
                            >
                                <span>←</span>
                                <span>Dashboard</span>
                            </Link>
                        )}
                        <span className="text-sm text-gray-700 font-medium">
                            {user?.username}
                        </span>
                        <button
                            onClick={logout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
