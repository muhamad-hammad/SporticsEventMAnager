'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

interface Match {
    id: number;
    sport: {
        sports_name: string;
    };
    olympiad_team1: {
        id: number;
        team_name: string;
    };
    olympiad_team2: {
        id: number;
        team_name: string;
    };
    date: string;
    location: string;
    round: string;
    status: string;
    score_team1: number | null;
    score_team2: number | null;
    olympiad_match_winner_id: number | null;
}

interface Team {
    id: number;
    team_name: string;
    sport: {
        sports_name: string;
    };
    approved: boolean;
    rejected: boolean;
    rejection_reason: string | null;
}

export default function MyMatchesPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [matchesRes, teamsRes] = await Promise.all([
                api.get('/api/olympiad/my-matches/'),
                api.get('/api/olympiad/my-teams/')
            ]);
            setMatches(matchesRes.data);
            setTeams(teamsRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
            setError('Failed to load your matches and teams');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRoundDisplay = (round: string) => {
        const roundMap: { [key: string]: string } = {
            'knockout': 'Knockout',
            'round_robin': 'Round Robin',
            'quarter_final': 'Quarter Final',
            'semi_final': 'Semi Final',
            'final': 'Final'
        };
        return roundMap[round] || round;
    };

    const getMatchResult = (match: Match, teamId: number) => {
        if (match.status !== 'completed') return null;
        if (!match.olympiad_match_winner_id) return 'Draw';
        return match.olympiad_match_winner_id === teamId ? 'Win' : 'Loss';
    };

    const approvedTeams = teams.filter(t => t.approved);
    const pendingTeams = teams.filter(t => !t.approved && !t.rejected);
    const rejectedTeams = teams.filter(t => t.rejected);

    const upcomingMatches = matches.filter(m => m.status === 'scheduled');
    const completedMatches = matches.filter(m => m.status === 'completed');

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">My Olympiad Matches</h1>
                        <p className="text-gray-600">View your team registrations and scheduled matches</p>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Loading your data...</p>
                        </div>
                    ) : (
                        <>
                            {/* Teams Status Section */}
                            <div className="mb-8 grid md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                                    <div className="text-3xl font-bold text-green-600">{approvedTeams.length}</div>
                                    <div className="text-gray-600">Approved Teams</div>
                                </div>
                                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                                    <div className="text-3xl font-bold text-yellow-600">{pendingTeams.length}</div>
                                    <div className="text-gray-600">Pending Approval</div>
                                </div>
                                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                                    <div className="text-3xl font-bold text-blue-600">{upcomingMatches.length}</div>
                                    <div className="text-gray-600">Upcoming Matches</div>
                                </div>
                            </div>

                            {/* Rejected Teams Alert */}
                            {rejectedTeams.length > 0 && (
                                <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-6 rounded">
                                    <h3 className="text-lg font-bold text-red-900 mb-2">❌ Rejected Registrations</h3>
                                    {rejectedTeams.map(team => (
                                        <div key={team.id} className="mb-2">
                                            <span className="font-semibold">{team.team_name}</span> ({team.sport.sports_name})
                                            {team.rejection_reason && (
                                                <p className="text-sm text-red-700 mt-1">Reason: {team.rejection_reason}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upcoming Matches */}
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">🔜 Upcoming Matches</h2>
                                {upcomingMatches.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                                        No upcoming matches scheduled yet. Check back later!
                                    </div>
                                ) : (
                                    <div className="grid gap-6 lg:grid-cols-2">
                                        {upcomingMatches.map(match => (
                                            <div key={match.id} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                                        {getRoundDisplay(match.round)}
                                                    </span>
                                                    <span className="text-sm text-gray-500">{match.sport.sports_name}</span>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="text-center mb-2">
                                                        <div className="text-xl font-bold text-gray-900">{match.olympiad_team1.team_name}</div>
                                                        <div className="text-gray-500 my-2">vs</div>
                                                        <div className="text-xl font-bold text-gray-900">{match.olympiad_team2.team_name}</div>
                                                    </div>
                                                </div>

                                                <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        📅 <span>{formatDate(match.date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        📍 <span>{match.location}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Completed Matches */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Match History</h2>
                                {completedMatches.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                                        No completed matches yet.
                                    </div>
                                ) : (
                                    <div className="grid gap-6 lg:grid-cols-2">
                                        {completedMatches.map(match => {
                                            const myTeam = approvedTeams.find(t => 
                                                t.id === match.olympiad_team1.id || t.id === match.olympiad_team2.id
                                            );
                                            const result = myTeam ? getMatchResult(match, myTeam.id) : null;
                                            
                                            return (
                                                <div key={match.id} className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-gray-400">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                                                            {getRoundDisplay(match.round)}
                                                        </span>
                                                        {result && (
                                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                                result === 'Win' ? 'bg-green-100 text-green-800' :
                                                                result === 'Loss' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {result === 'Win' ? '🏆 Won' : result === 'Loss' ? '❌ Lost' : '🤝 Draw'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mb-4">
                                                        <div className="grid grid-cols-3 items-center gap-2">
                                                            <div className={`text-right ${match.olympiad_match_winner_id === match.olympiad_team1.id ? 'font-bold text-green-600' : 'text-gray-700'}`}>
                                                                {match.olympiad_team1.team_name}
                                                                {match.olympiad_match_winner_id === match.olympiad_team1.id && ' 👑'}
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="bg-gray-100 rounded px-3 py-2 font-bold text-lg">
                                                                    {match.score_team1 ?? '-'} : {match.score_team2 ?? '-'}
                                                                </div>
                                                            </div>
                                                            <div className={`text-left ${match.olympiad_match_winner_id === match.olympiad_team2.id ? 'font-bold text-green-600' : 'text-gray-700'}`}>
                                                                {match.olympiad_match_winner_id === match.olympiad_team2.id && '👑 '}
                                                                {match.olympiad_team2.team_name}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                                                        <div>📅 {formatDate(match.date)}</div>
                                                        <div>📍 {match.location}</div>
                                                        <div>⚽ {match.sport.sports_name}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
