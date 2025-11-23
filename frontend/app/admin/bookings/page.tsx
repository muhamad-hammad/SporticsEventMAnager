'use client';

import AdminRoute from "@/components/AdminRoute";

export default function BookingAdminDashboard() {
    return (
        <AdminRoute>
            <div className="p-8 max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-gray-800">Bookings Admin Panel</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    <a href="/admin/bookings/manage" className="bg-white rounded-xl shadow-lg p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-6 border border-gray-100">
                        <div className="text-6xl bg-yellow-50 p-4 rounded-full">📝</div>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">Manage Bookings</h3>
                            <p className="text-lg text-gray-600">Review and approve pending requests</p>
                        </div>
                    </a>

                    <a href="/admin/bookings/history" className="bg-white rounded-xl shadow-lg p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-6 border border-gray-100">
                        <div className="text-6xl bg-purple-50 p-4 rounded-full">📚</div>
                        <div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">All Bookings</h3>
                            <p className="text-lg text-gray-600">View complete booking history</p>
                        </div>
                    </a>
                </div>
            </div>
        </AdminRoute>
    );
}
