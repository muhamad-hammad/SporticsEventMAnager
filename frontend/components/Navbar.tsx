'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const commonLinks = [
    { href: '/dashboard', label: 'Home' },
  ];

  const courtLinks = [
    { href: '/courts-info', label: 'Courts' },
    { href: '/courts', label: 'Book Court' },
    { href: '/bookings', label: 'View Bookings' },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Admin Panel' },
    { href: '/admin/bookings', label: 'All Bookings' },
  ];

  const olympiadLinks = [
    { href: '/olympiad/sports', label: 'Sports' },
    { href: '/olympiad/teams', label: 'Teams' },
  ];

  const logLinks = [
    { href: '/log/register', label: 'Register' },
    { href: '/log/drafts', label: 'Drafts' },
    { href: '/log/events', label: 'Events' },
  ];

  const isOlympiadPage = pathname?.startsWith('/olympiad');
  const isCourtsPage = pathname?.startsWith('/courts') || pathname?.startsWith('/bookings');
  const isLogPage = pathname?.startsWith('/log');

  let currentLinks: { href: string; label: string }[] = [];
  if (isOlympiadPage) {
    currentLinks = olympiadLinks;
  } else if (isCourtsPage) {
    currentLinks = courtLinks;
  } else if (isLogPage) {
    currentLinks = logLinks;
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center text-2xl font-bold text-blue-600">
              Sportics
            </Link>
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {/* Common Links (Dashboard) */}
                {commonLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === link.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Admin Links - Context Aware */}
                {user?.role === 'admin' && (
                  <>
                    {/* Show generic links if not in specific context - REMOVED as per user request */}
                    {/* The user wants only 'Dashboard' on the main page. Navigation is via page widgets. */}

                    {/* Olympiad Admin Context */}
                    {pathname?.startsWith('/admin/olympiad') && (
                      <>
                        <Link
                          href="/admin/olympiad"
                          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/admin/olympiad'
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                          Admin Panel
                        </Link>
                        <Link
                          href="/admin/olympiad/teams"
                          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/admin/olympiad/teams'
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                          Manage Teams
                        </Link>
                        <Link
                          href="/admin/olympiad/matches"
                          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/admin/olympiad/matches'
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                          Manage Matches
                        </Link>
                      </>
                    )}

                    {/* Booking Admin Context */}
                    {pathname?.startsWith('/admin/bookings') && (
                      <>
                        <Link
                          href="/admin/bookings"
                          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/admin/bookings'
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                          Admin Panel
                        </Link>
                        <Link
                          href="/admin/bookings/manage"
                          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/admin/bookings/manage'
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                          Manage Bookings
                        </Link>
                        <Link
                          href="/admin/bookings/history"
                          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/admin/bookings/history'
                            ? 'border-blue-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                          All Bookings
                        </Link>
                      </>
                    )}
                  </>
                )}

                {/* User Context-Aware Links */}
                {user?.role !== 'admin' && currentLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === link.href
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700 mr-4">
                  {user?.username} ({user?.role})
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
