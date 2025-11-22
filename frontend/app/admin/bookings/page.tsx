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

export default function AdminAllBookings() {
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
                <h1 className="text-3xl font-bold mb-4">All Bookings</h1>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border px-2 py-1">User</th>
                            <th className="border px-2 py-1">Court</th>
                            <th className="border px-2 py-1">Date</th>
                            <th className="border px-2 py-1">Time</th>
                            <th className="border px-2 py-1">Total Cost</th>
                            <th className="border px-2 py-1">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allBookings.map((b) => (
                            <tr key={b.id} className="border">
                                <td className="border px-2 py-1">{b.user.username}</td>
                                <td className="border px-2 py-1">{b.court_details.court_name}</td>
                                <td className="border px-2 py-1">{b.date}</td>
                                <td className="border px-2 py-1">{b.start_time} - {b.end_time}</td>
                                <td className="border px-2 py-1">{b.total_cost}</td>
                                <td className={`border px-2 py-1 ${statusColors[b.status] || ''}`}>
                                    {b.status}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminRoute>
    );
}
