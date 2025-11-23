'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Player {
    name: string;
    age: number;
}

interface Team {
    id: number;
    team_name: string;
    sport: {
        sports_name: string;
    };
    captain: {
        username: string;
    };
    approved: boolean;
    players: Player[];
}

export default function OlympiadTeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await api.get('/api/olympiad/teams/');
            setTeams(response.data);
        } catch (err) {
            console.error('Failed to fetch teams', err);
            setError('Failed to load teams.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Olympiad Teams</h1>
                    <a
                        href="/olympiad/register"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Register New Team
                    </a>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-8">Loading teams...</div>
                ) : teams.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No teams registered yet. Be the first to register!
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {teams.map((team) => (
                            <div key={team.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{team.team_name}</h3>
                                            <p className="text-sm text-blue-600 font-semibold">{team.sport.sports_name}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${team.approved
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {team.approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p><strong>Captain:</strong> {team.captain.username}</p>
                                        <div>
                                            <strong>Players ({team.players.length}):</strong>
                                            <ul className="list-disc list-inside mt-1 pl-2">
                                                {team.players.map((player, idx) => (
                                                    <li key={idx}>{player.name} ({player.age})</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}

