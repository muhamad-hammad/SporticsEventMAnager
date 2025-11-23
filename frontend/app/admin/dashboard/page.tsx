'use client';

import { useEffect, useState } from "react";
import api from "@/lib/api";
import AdminRoute from "@/components/AdminRoute";

interface Booking {
  id: number;
  user: { username: string };
  court_details: { court_name: string };
  date: string;
  start_time: string;
  end_time: string;
  total_cost: string;
  status: string;
}

export default function AdminDashboard() {
  const [pending, setPending] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch pending bookings
  const fetchData = async () => {
    try {
      setError("");
      const response = await api.get<Booking[]>("/api/admin/bookings/pending/");
      setPending(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to load bookings");
    } finally {
      setLoadingData(false);
    }
  };

  // Update booking status (approve/reject)
  const updateBookingStatus = async (id: number, status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status} this booking?`)) return;

    try {
      setError('');
      await api.post(`/api/admin/bookings/update-status/${id}/`, { status });

      // Optimistically update pending bookings
      setPending(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || `Failed to ${status} booking`);
    }
  };

  const statusColors: Record<string, string> = {
    approved: "text-green-600",
    pending: "text-yellow-600",
    rejected: "text-red-600",
  };

  if (loadingData) return <p>Loading...</p>;

  return (
    <AdminRoute>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Olympiad Management */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Olympiad Management</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <a href="/admin/olympiad" className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4">
              <div className="text-4xl">🏅</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Manage Teams</h3>
                <p className="text-gray-600">Approve team registrations</p>
              </div>
            </a>

            <a href="/admin/olympiad/matches" className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4">
              <div className="text-4xl">⚽</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Manage Matches</h3>
                <p className="text-gray-600">Schedule & Update Results</p>
              </div>
            </a>
          </div>
        </section>

        {/* Pending Bookings */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Pending Bookings</h2>
          {pending.length === 0 ? (
            <p>No pending bookings</p>
          ) : (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-2 py-1">User</th>
                  <th className="border px-2 py-1">Court</th>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Time</th>
                  <th className="border px-2 py-1">Total Cost</th>
                  <th className="border px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((b) => (
                  <tr key={b.id} className="border">
                    <td className="border px-2 py-1">{b.user.username}</td>
                    <td className="border px-2 py-1">{b.court_details.court_name}</td>
                    <td className="border px-2 py-1">{b.date}</td>
                    <td className="border px-2 py-1">{b.start_time} - {b.end_time}</td>
                    <td className="border px-2 py-1">{b.total_cost}</td>
                    <td className="border px-2 py-1 flex gap-2">
                      <button
                        onClick={() => updateBookingStatus(b.id, 'approved')}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateBookingStatus(b.id, 'rejected')}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </AdminRoute>
  );
}
