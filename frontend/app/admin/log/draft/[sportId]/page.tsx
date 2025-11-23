'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface User {
    id: number;
    username: string;
    email: string;
}

interface PlayerRegistration {
    id: number;
    user: User;
    sport: number;
    status: string;
}

interface Team {
    id: number;
    team_name: string;
    house: {
        id: number;
        house_name: string;
    };
    captain: User | null;
    sport: number;
}

interface DraftPick {
    id: number;
    team: number;
    team_name: string;
    player: number;
    player_name: string;
    picked_by: number;
    picked_by_name: string;
    status: string;
    round_number: number;
    pick_order: number;
    picked_at: string;
}

interface DraftSession {
    id: number;
    sport: number;
    sport_name: string;
    status: string;
    current_round: number;
    current_pick_index: number;
}

export default function DraftSessionPage() {
    const params = useParams();
    const router = useRouter();
    const sportId = params.sportId as string;

    const [session, setSession] = useState<DraftSession | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
    const [picks, setPicks] = useState<DraftPick[]>([]);
    const [availablePlayers, setAvailablePlayers] = useState<PlayerRegistration[]>([]);
    const [canPick, setCanPick] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchDraftData = async () => {
        try {
            const response = await api.get(`/api/log/draft/session/${sportId}/`);
            setSession(response.data.session);
            setTeams(response.data.teams);
            setCurrentTeam(response.data.current_team);
            setPicks(response.data.picks);
            setAvailablePlayers(response.data.available_players);
            setCanPick(response.data.can_pick);
            setLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch draft data', err);
            setError(err.response?.data?.error || 'Failed to load draft session');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDraftData();
    }, [sportId]);

    useEffect(() => {
        if (autoRefresh && session?.status === 'in_progress') {
            const interval = setInterval(fetchDraftData, 3000); // Refresh every 3 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh, session]);

    const handlePickPlayer = async () => {
        if (!selectedPlayer) {
            setError('Please select a player');
            return;
        }

        setError('');
        setSuccess('');

        try {
            const response = await api.post('/api/log/draft/pick/', {
                player_id: selectedPlayer,
                sport_id: sportId
            });
            setSuccess(response.data.msg);
            setSelectedPlayer(null);
            await fetchDraftData();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to pick player');
        }
    };

    const getTeamPicks = (teamId: number) => {
        return picks.filter(p => p.team === teamId && p.status === 'approved');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!session) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-500">Draft session not found</p>
                        <button
                            onClick={() => router.back()}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{session.sport_name} Draft</h1>
                                <p className="mt-1 text-gray-600">
                                    Round {session.current_round} • Pick #{session.current_pick_index + 1}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                                    {session.status === 'in_progress' ? 'Live Draft' : 'Completed'}
                                </span>
                                {session.status === 'in_progress' && (
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={autoRefresh}
                                            onChange={(e) => setAutoRefresh(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        Auto-refresh
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800">{success}</p>
                        </div>
                    )}

                    {/* Current Turn */}
                    {session.status === 'in_progress' && currentTeam && (
                        <div className="mb-6 bg-blue-50 border-2 border-blue-500 rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-600 font-medium mb-1">NOW PICKING</p>
                                    <h2 className="text-2xl font-bold text-blue-900">{currentTeam.team_name}</h2>
                                    <p className="text-blue-700">Captain: {currentTeam.captain?.username || 'Not assigned'}</p>
                                </div>
                                {canPick && (
                                    <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium">
                                        YOUR TURN!
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Available Players */}
                        {session.status === 'in_progress' && canPick && (
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Pick a Player ({availablePlayers.length} available)
                                    </h3>
                                    <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
                                        {availablePlayers.map((player) => (
                                            <label
                                                key={player.id}
                                                className={`block p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                                                    selectedPlayer === player.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="player"
                                                    value={player.id}
                                                    checked={selectedPlayer === player.id}
                                                    onChange={() => setSelectedPlayer(player.id)}
                                                    className="sr-only"
                                                />
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{player.user.username}</p>
                                                        <p className="text-sm text-gray-600">{player.user.email}</p>
                                                    </div>
                                                    {selectedPlayer === player.id && (
                                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handlePickPlayer}
                                        disabled={!selectedPlayer}
                                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        Confirm Pick
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Teams and their picks */}
                        <div className={canPick && session.status === 'in_progress' ? 'lg:col-span-2' : 'lg:col-span-3'}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {teams.map((team) => {
                                    const teamPicks = getTeamPicks(team.id);
                                    const isCurrent = currentTeam?.id === team.id;
                                    return (
                                        <div
                                            key={team.id}
                                            className={`bg-white rounded-lg shadow-md p-6 ${
                                                isCurrent && session.status === 'in_progress'
                                                    ? 'ring-2 ring-blue-500'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {team.team_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">{team.house.house_name}</p>
                                                    <p className="text-xs text-gray-500">Captain: {team.captain?.username || 'None'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-blue-600">{teamPicks.length}</p>
                                                    <p className="text-xs text-gray-500">Players</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {teamPicks.length === 0 ? (
                                                    <p className="text-gray-400 text-center py-4">No picks yet</p>
                                                ) : (
                                                    teamPicks.map((pick, index) => (
                                                        <div
                                                            key={pick.id}
                                                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-sm text-gray-900">
                                                                    {pick.player_name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    Round {pick.round_number}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-600">
                                                                #{index + 1}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Recent Picks */}
                    {picks.length > 0 && (
                        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Picks</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {picks.slice(0, 10).map((pick) => (
                                    <div key={pick.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-gray-500">#{pick.pick_order + 1}</span>
                                            <div>
                                                <p className="font-medium text-gray-900">{pick.player_name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {pick.team_name} • Round {pick.round_number}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(pick.picked_at).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
