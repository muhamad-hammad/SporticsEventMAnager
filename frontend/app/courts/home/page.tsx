'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function CourtsHomePage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-green-700 to-emerald-800 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="container mx-auto px-4 py-20 relative z-10 text-center">
                        <span className="text-6xl mb-4 block">🎾</span>
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                            Court Booking
                        </h1>
                        <p className="text-2xl text-green-100 font-light mb-8">Reserve Your Court Today</p>
                    </div>
                </div>

                {/* Available Courts Section */}
                <div className="container mx-auto px-4 py-16 mb-16">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Available Courts</h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Basketball Court */}
                            <CourtCard
                                icon="🏀"
                                name="Basketball Court"
                                description="Full-size indoor basketball court with professional flooring and lighting."
                                color="from-orange-500 to-red-500"
                            />

                            {/* Badminton Court */}
                            <CourtCard
                                icon="🏸"
                                name="Badminton Court"
                                description="Indoor badminton court with high-quality nets and proper court markings."
                                color="from-blue-500 to-indigo-500"
                            />

                            {/* Tennis Court */}
                            <CourtCard
                                icon="🎾"
                                name="Tennis Court"
                                description="Outdoor tennis court with synthetic grass and professional-grade nets."
                                color="from-green-500 to-teal-500"
                            />

                            {/* Futsal Court */}
                            <CourtCard
                                icon="⚽"
                                name="Futsal Court"
                                description="Indoor futsal court with artificial turf and goal posts."
                                color="from-yellow-500 to-orange-500"
                            />

                            {/* Volleyball Court */}
                            <CourtCard
                                icon="🏐"
                                name="Volleyball Court"
                                description="Sand volleyball court with regulation net height and boundary lines."
                                color="from-pink-500 to-rose-500"
                            />

                            {/* Table Tennis */}
                            <CourtCard
                                icon="🏓"
                                name="Table Tennis"
                                description="Indoor table tennis area with multiple tables and equipment available."
                                color="from-purple-500 to-violet-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-gray-900 text-white pt-16 pb-8">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-12 mb-12 text-center md:text-left">
                            <div>
                                <h3 className="text-2xl font-bold mb-6 text-green-400">Contact Us</h3>
                                <p className="text-gray-300 text-lg">+92 312 0323690</p>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold mb-6 text-green-400">About the Developers</h3>
                                <ul className="text-gray-300 space-y-2">
                                    <li>Syed Muhammad Shubair haider</li>
                                    <li>Muhammad Ayesh</li>
                                    <li>Muhammad hammad</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold mb-6 text-green-400">Repository</h3>
                                <a href="#" className="inline-flex items-center text-gray-300 hover:text-white transition-colors">
                                    <span className="mr-2">Star on GitHub</span>
                                    <span className="bg-gray-800 px-2 py-1 rounded text-sm">6</span>
                                </a>
                            </div>
                        </div>

                        <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
                            <p>&copy; 2026 Sportics | All rights reserved</p>
                        </div>
                    </div>
                </footer>
            </div>
        </ProtectedRoute>
    );
}

function CourtCard({ icon, name, description, color }: {
    icon: string;
    name: string;
    description: string;
    color: string;
}) {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className={`h-2 bg-gradient-to-r ${color}`} />
            <div className="p-6">
                <div className="text-5xl mb-4 text-center">{icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{name}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
