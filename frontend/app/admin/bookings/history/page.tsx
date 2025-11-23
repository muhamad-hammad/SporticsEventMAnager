'use client';

import { useState, useEffect } from "react";
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

export default function AllBookingsPage() {
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setError("");
            const response = await api.get<Booking[]>("/api/admin/bookings/all/");
            setAllBookings(response.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to load bookings");
        } finally {
            setLoadingData(false);
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
                <h1 className="text-3xl font-bold mb-8">Booking History</h1>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="w-full border-collapse bg-white">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">User</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Court</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Time</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Cost</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {allBookings.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{b.user.username}</td>
                                    <td className="px-4 py-3">{b.court_details.court_name}</td>
                                    <td className="px-4 py-3">{b.date}</td>
                                    <td className="px-4 py-3">{b.start_time} - {b.end_time}</td>
                                    <td className="px-4 py-3">{b.total_cost}</td>
                                    <td className={`px-4 py-3 font-medium ${statusColors[b.status] || ''}`}>
                                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminRoute>
    );
}
