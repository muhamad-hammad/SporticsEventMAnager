'use client';


import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BookingAdminDashboard() {
    const actions = [
        {
            title: "Manage Bookings",
            description: "Review pending booking requests, approve or reject them.",
            href: "/admin/bookings/manage",
            icon: "📝",
            color: "from-yellow-400 to-orange-500",
            shadow: "shadow-orange-200"
        },
        {
            title: "Booking History",
            description: "View the complete history of all court bookings.",
            href: "/admin/bookings/history",
            icon: "📚",
            color: "from-purple-500 to-indigo-600",
            shadow: "shadow-indigo-200"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-100">

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                            Court Management
                        </h1>
                        <p className="text-lg text-emerald-100">
                            Handle court reservations and view usage history.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Action Cards */}
            <div className="container mx-auto px-4 -mt-12 relative z-20 mb-24">
                <div className="grid md:grid-cols-2 gap-8">
                    {actions.map((action, index) => (
                        <Link href={action.href} key={action.title} className="block h-full">
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
                                whileHover={{ y: -8 }}
                                className={`group relative bg-white h-full rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 ${action.shadow}`}
                            >
                                <div className={`h-2 w-full bg-gradient-to-r ${action.color}`} />
                                <div className="p-8">
                                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{action.icon}</div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{action.title}</h2>
                                    <p className="text-gray-500 mb-6">{action.description}</p>
                                    <div className="text-blue-600 font-bold flex items-center group-hover:translate-x-2 transition-transform">
                                        View <span className="ml-2">→</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
