'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Sport {
    id: number;
    sports_name: string;
    registration_fee: string | null;
    min_players: number;
    max_players: number;
}

export default function OlympiadSportsPage() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSports();
    }, []);

    const fetchSports = async () => {
        try {
            const response = await api.get('/api/olympiad/sports/');
            // Filter sports that have registration fee set (implying they are Olympiad sports)
            const olympiadSports = response.data.filter((s: Sport) => s.registration_fee !== null);
            setSports(olympiadSports);
        } catch (err) {
            console.error('Failed to fetch sports', err);
            setError('Failed to load sports. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Olympiad Sports</h1>

                {loading ? (
                    <p>Loading sports...</p>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sports.map((sport) => (
                            <div key={sport.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{sport.sports_name}</h2>
                                <p className="text-gray-600 mb-4">
                                    Registration Fee: <span className="font-semibold">Rs. {sport.registration_fee}</span>
                                    <br />
                                    <span className="text-sm text-gray-500">
                                        Players: {sport.min_players} - {sport.max_players}
                                    </span>
                                </p>
                                <a
                                    href="/olympiad/register"
                                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                >
                                    Register Team
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
