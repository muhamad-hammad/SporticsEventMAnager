'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';


interface Sport {
    id: number;
    sports_name: string;
}

interface Team {
    id: number;
    team_name: string;
    sport: {
        id: number;
        sports_name: string;
    };
}

interface Match {
    id: number;
    sport: {
        id: number;
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
    time: string;
    location: string;
    score_team1: number | null;
    score_team2: number | null;
    status: string;
    olympiad_match_winner_id: number | null;
}

export default function MatchManagementPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form States
    const [selectedSport, setSelectedSport] = useState<number | null>(null);
    const [team1, setTeam1] = useState<number | null>(null);
    const [team2, setTeam2] = useState<number | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [round, setRound] = useState('');
    const [creating, setCreating] = useState(false);

    // Result Update State
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [score1, setScore1] = useState<number | string>('');
    const [score2, setScore2] = useState<number | string>('');
    const [winnerId, setWinnerId] = useState<number | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [matchesRes, sportsRes, teamsRes] = await Promise.all([
                api.get('/api/olympiad/matches/'),
                api.get('/api/olympiad/sports/'),
                api.get('/api/olympiad/teams/')
            ]);
            setMatches(matchesRes.data);
            setSports(sportsRes.data);
            // Filter only approved teams
            setTeams(teamsRes.data.filter((t: any) => t.approved));
        } catch (err) {
            console.error('Failed to fetch data', err);
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSport || !team1 || !team2 || !date || !time || !location || !round) {
            alert('Please fill all fields');
            return;
        }
        if (team1 === team2) {
            alert('Teams must be different');
            return;
        }

        setCreating(true);
        try {
            /*
            const payload = {
                sport: selectedSport,
                olympiad_team1: team1,
                olympiad_team2: team2,
                date,
                time,
                location,
                round
            };
            */
            const payload = {
                sport_id: selectedSport,
                olympiad_team1: team1,
                olympiad_team2: team2,
                event_type: "OLYMPIAD",

                // Combine date + time into a valid Django DateTimeField format
                date: `${date}T${time}:00`,

                //time,
                location,
                round
            }
            const res = await api.post('/api/olympiad/match/create/', payload);
            setMatches([...matches, res.data]);
            // Reset form
            setTeam1(null);
            setTeam2(null);
            setDate('');
            setTime('');
            setLocation('');
            setRound('');
            alert('Match scheduled successfully!');
        } catch (err: any) {
            console.error(err);
            const errorMsg = err.response?.data?.error
                || err.response?.data?.detail
                || JSON.stringify(err.response?.data)
                || 'Failed to create match';
            alert(errorMsg);
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateResult = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingMatch) return;

        setUpdating(true);
        try {
            const payload = {
                score_team1: score1,
                score_team2: score2,
                olympiad_match_winner_id: winnerId
            };
            const res = await api.patch(`/api/olympiad/match/${editingMatch.id}/result/`, payload);

            setMatches(matches.map(m => m.id === editingMatch.id ? res.data : m));
            setEditingMatch(null);
            setScore1('');
            setScore2('');
            setWinnerId(null);
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to update result');
        } finally {
            setUpdating(false);
        }
    };

    const openResultModal = (match: Match) => {
        setEditingMatch(match);
        setScore1(match.score_team1 ?? 0);
        setScore2(match.score_team2 ?? 0);
        setWinnerId(match.olympiad_match_winner_id);
    };

    const filteredTeams = teams.filter(t => t.sport.id === Number(selectedSport));

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Match Management</h1>

            {/* Create Match Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Schedule New Match</h2>
                <form onSubmit={handleCreateMatch} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Sport</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            value={selectedSport || ''}
                            onChange={e => {
                                setSelectedSport(Number(e.target.value));
                                setTeam1(null);
                                setTeam2(null);
                            }}
                        >
                            <option value="">Select Sport</option>
                            {sports.map(s => (
                                <option key={s.id} value={s.id}>{s.sports_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Team 1</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            value={team1 || ''}
                            onChange={e => setTeam1(Number(e.target.value))}
                            disabled={!selectedSport}
                        >
                            <option value="">Select Team 1</option>
                            {filteredTeams.map(t => (
                                <option key={t.id} value={t.id}>{t.team_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Team 2</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            value={team2 || ''}
                            onChange={e => setTeam2(Number(e.target.value))}
                            disabled={!selectedSport}
                        >
                            <option value="">Select Team 2</option>
                            {filteredTeams.filter(t => t.id !== team1).map(t => (
                                <option key={t.id} value={t.id}>{t.team_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Time</label>
                        <input
                            type="time"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            value={time}
                            onChange={e => setTime(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            placeholder="e.g. Court 1"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Round</label>
                        <select
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                            value={round}
                            onChange={e => setRound(e.target.value)}
                        >
                            <option value="">Select Round</option>
                            <option value="knockout">Knockout</option>
                            <option value="round_robin">Round Robin</option>
                            <option value="quarter_final">Quarter Final</option>
                            <option value="semi_final">Semi Final</option>
                            <option value="final">Final</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                        <button
                            type="submit"
                            disabled={creating}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {creating ? 'Scheduling...' : 'Schedule Match'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Match List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <h2 className="text-xl font-bold p-6 border-b">Scheduled Matches</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sport</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matchup</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {matches.map(match => (
                                <tr key={match.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{match.date}</div>
                                        <div className="text-sm text-gray-500">{match.time}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {match.sport.sports_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {match.olympiad_team1.team_name} vs {match.olympiad_team2.team_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {match.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {match.status === 'completed' ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {match.score_team1} - {match.score_team2}
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => openResultModal(match)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Update Result
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Result Modal */}
            {editingMatch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Update Match Result</h3>
                        <p className="mb-4 text-sm text-gray-600">
                            {editingMatch.olympiad_team1.team_name} vs {editingMatch.olympiad_team2.team_name}
                        </p>

                        <form onSubmit={handleUpdateResult}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {editingMatch.olympiad_team1.team_name} Score
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border rounded p-2"
                                        value={score1}
                                        onChange={e => setScore1(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {editingMatch.olympiad_team2.team_name} Score
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full border rounded p-2"
                                        value={score2}
                                        onChange={e => setScore2(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Winner</label>
                                <select
                                    className="w-full border rounded p-2"
                                    value={winnerId || ''}
                                    onChange={e => setWinnerId(Number(e.target.value))}
                                >
                                    <option value="">Select Winner (Optional)</option>
                                    <option value={editingMatch.olympiad_team1.id}>{editingMatch.olympiad_team1.team_name}</option>
                                    <option value={editingMatch.olympiad_team2.id}>{editingMatch.olympiad_team2.team_name}</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingMatch(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {updating ? 'Saving...' : 'Save Result'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
