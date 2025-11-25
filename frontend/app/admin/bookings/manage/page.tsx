'use client';

import { useState, useEffect } from "react";
import api from "@/lib/api";
import AdminRoute from "@/components/AdminRoute";
import AdminNavbar from "@/components/AdminNavbar";

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

export default function ManageBookingsPage() {
    const [pending, setPending] = useState<Booking[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetchData();
    }, []);

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

    const updateBookingStatus = async (id: number, status: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${status} this booking?`)) return;

        try {
            setError('');
            await api.post(`/api/admin/bookings/update-status/${id}/`, { status });

            // Update local state
            setPending(prev => prev.filter(b => b.id !== id));
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || `Failed to ${status} booking`);
        }
    };

    if (loadingData) return <p>Loading...</p>;

    return (
        <AdminRoute>
            <AdminNavbar />
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-8">Manage Pending Bookings</h1>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {pending.length === 0 ? (
                    <p className="text-gray-500 italic">No pending bookings</p>
                ) : (
                    <div className="overflow-x-auto shadow-md rounded-lg">
                        <table className="w-full border-collapse bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">User</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Court</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Time</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Cost</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pending.map((b) => (
                                    <tr key={b.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{b.user.username}</td>
                                        <td className="px-4 py-3">{b.court_details.court_name}</td>
                                        <td className="px-4 py-3">{b.date}</td>
                                        <td className="px-4 py-3">{b.start_time} - {b.end_time}</td>
                                        <td className="px-4 py-3">{b.total_cost}</td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                onClick={() => updateBookingStatus(b.id, 'approved')}
                                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => updateBookingStatus(b.id, 'rejected')}
                                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminRoute>
    );
}
