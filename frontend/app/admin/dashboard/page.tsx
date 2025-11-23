'use client';

import AdminRoute from "@/components/AdminRoute";

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

        {/* Olympiad Management */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-700 border-b pb-2">Olympiad Management</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <a href="/admin/olympiad" className="bg-white rounded-xl shadow-lg p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-6 border border-gray-100">
              <div className="text-6xl bg-blue-50 p-4 rounded-full">🏅</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Manage Teams</h3>
                <p className="text-lg text-gray-600">Approve and view team registrations</p>
              </div>
            </a>

            <a href="/admin/olympiad/matches" className="bg-white rounded-xl shadow-lg p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-6 border border-gray-100">
              <div className="text-6xl bg-green-50 p-4 rounded-full">⚽</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Manage Matches</h3>
                <p className="text-lg text-gray-600">Schedule matches and update results</p>
              </div>
            </a>
          </div>
        </section>

        {/* Court Management */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-700 border-b pb-2">Court Management</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <a href="/admin/bookings" className="bg-white rounded-xl shadow-lg p-10 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-6 border border-gray-100">
              <div className="text-6xl bg-purple-50 p-4 rounded-full">📅</div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Manage Bookings</h3>
                <p className="text-lg text-gray-600">Review pending requests and history</p>
              </div>
            </a>
          </div>
        </section>
      </div>
    </AdminRoute>
  );
}
