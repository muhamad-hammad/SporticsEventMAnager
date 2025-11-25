'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Player {
    id: number;
    first_name: string;
    username: string;
    email: string;
    round: number;
    pick_order: number;
    is_me?: boolean;
}

interface Sport {
    id: number;
    sport_name: string;
}

interface House {
    id: number;
    house_name: string;
}

interface Captain {
    id: number;
    username: string;
    first_name: string;
}

interface Team {
    id: number;
    team_name: string;
    sport: Sport;
    house: House;
    captain: Captain | null;
    players: Player[];
    player_count: number;
    max_players: number;
    picked_in_round?: number;
    picked_at?: string;
}

interface MyTeamsData {
    role: 'house_captain' | 'player';
    house_name?: string;
    teams: Team[];
}

export default function MyTeamsPage() {
    const [data, setData] = useState<MyTeamsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSport, setSelectedSport] = useState<number | 'all'>('all');

    useEffect(() => {
        fetchMyTeams();
    }, []);

    const fetchMyTeams = async () => {
        try {
            const response = await api.get('/api/log/my-teams/');
            setData(response.data);
            setLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch teams', err);
            setError(err.response?.data?.error || 'Failed to load teams');
            setLoading(false);
        }
    };

    const filteredTeams = data?.teams.filter(team => 
        selectedSport === 'all' || team.sport.id === selectedSport
    ) || [];

    const uniqueSports = data?.teams.reduce((acc, team) => {
        if (!acc.find(s => s.id === team.sport.id)) {
            acc.push(team.sport);
        }
        return acc;
    }, [] as Sport[]) || [];

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {data?.role === 'house_captain' ? 'House Teams' : 'My Teams'}
                        </h1>
                        {data?.role === 'house_captain' && data.house_name && (
                            <p className="text-lg text-gray-600">
                                Managing teams for <span className="font-semibold text-blue-600">{data.house_name}</span>
                            </p>
                        )}
                        {data?.role === 'player' && (
                            <p className="text-lg text-gray-600">
                                Teams you&apos;ve been drafted to
                            </p>
                        )}
                    </div>

                    {/* Sport Filter */}
                    {uniqueSports.length > 1 && (
                        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Sport
                            </label>
                            <select
                                value={selectedSport}
                                onChange={(e) => setSelectedSport(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Sports ({data?.teams.length})</option>
                                {uniqueSports.map(sport => (
                                    <option key={sport.id} value={sport.id}>
                                        {sport.sport_name} ({data?.teams.filter(t => t.sport.id === sport.id).length})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Teams Grid */}
                    {filteredTeams.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Found</h3>
                            <p className="text-gray-500">
                                {data?.role === 'house_captain' 
                                    ? 'No teams have been created for your house yet.'
                                    : "You haven't been picked by any team yet."
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredTeams.map((team) => (
                                <div key={team.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    {/* Team Header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-2xl font-bold mb-1">{team.team_name}</h3>
                                                <p className="text-blue-100">{team.sport.sport_name}</p>
                                                <p className="text-sm text-blue-200">{team.house.house_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold">{team.player_count}</div>
                                                <div className="text-sm text-blue-200">/ {team.max_players} Players</div>
                                            </div>
                                        </div>
                                        {team.captain && (
                                            <div className="mt-4 pt-4 border-t border-blue-500">
                                                <p className="text-sm text-blue-200">Team Captain</p>
                                                <p className="font-semibold">{team.captain.first_name} ({team.captain.username})</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Players List */}
                                    <div className="p-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                            Team Roster
                                        </h4>
                                        {team.players.length === 0 ? (
                                            <p className="text-gray-400 text-center py-8">No players drafted yet</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {team.players.map((player, index) => (
                                                    <div
                                                        key={player.id}
                                                        className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                                                            player.is_me
                                                                ? 'border-green-500 bg-green-50'
                                                                : 'border-gray-200 bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                                                {index + 1}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                                                    {player.first_name}
                                                                    {player.is_me && (
                                                                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                                                                            You
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <p className="text-sm text-gray-600">{player.username}</p>
                                                                <p className="text-xs text-gray-500">{player.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-xs text-gray-500">
                                                            <p>Round {player.round}</p>
                                                            <p>Pick #{player.pick_order}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer for players */}
                                    {data?.role === 'player' && team.picked_in_round && (
                                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                            <p className="text-sm text-gray-600">
                                                You were picked in <span className="font-semibold">Round {team.picked_in_round}</span>
                                                {team.picked_at && (
                                                    <span className="text-gray-500"> • {new Date(team.picked_at).toLocaleDateString()}</span>
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    {/* Team Status */}
                                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Team Status</span>
                                            {team.player_count >= team.max_players ? (
                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                    ✓ Full Roster
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                                    {team.max_players - team.player_count} spots remaining
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Summary Stats */}
                    {filteredTeams.length > 0 && (
                        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-3xl font-bold text-blue-600">{filteredTeams.length}</p>
                                    <p className="text-sm text-gray-600">Total Teams</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-3xl font-bold text-green-600">
                                        {filteredTeams.reduce((sum, team) => sum + team.player_count, 0)}
                                    </p>
                                    <p className="text-sm text-gray-600">Total Players</p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <p className="text-3xl font-bold text-purple-600">
                                        {filteredTeams.filter(t => t.player_count >= t.max_players).length}
                                    </p>
                                    <p className="text-sm text-gray-600">Complete Teams</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
