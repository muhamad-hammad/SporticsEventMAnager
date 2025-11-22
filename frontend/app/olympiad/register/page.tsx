'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Sport {
    id: number;
    sports_name: string;
    registration_fee: string | null;
    min_players: number;
    max_players: number;
}

interface Player {
    name: string;
    age: string;
}

export default function OlympiadRegisterPage() {
    const router = useRouter();
    const [sports, setSports] = useState<Sport[]>([]);
    const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
    const [teamName, setTeamName] = useState('');
    const [players, setPlayers] = useState<Player[]>([{ name: '', age: '' }]);
    const [loading, setLoading] = useState(false);
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
        }
    };

    const handleAddPlayer = () => {
        if (selectedSport && players.length >= selectedSport.max_players) {
            setError(`Maximum ${selectedSport.max_players} players allowed for ${selectedSport.sports_name}`);
            return;
        }
        setPlayers([...players, { name: '', age: '' }]);
        setError(''); // Clear error when adding valid player
    };

    const handleRemovePlayer = (index: number) => {
        const newPlayers = [...players];
        newPlayers.splice(index, 1);
        setPlayers(newPlayers);
        setError('');
    };

    const handlePlayerChange = (index: number, field: keyof Player, value: string) => {
        const newPlayers = [...players];
        newPlayers[index][field] = value;
        setPlayers(newPlayers);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSport) {
            setError('Please select a sport');
            return;
        }

        if (players.length < selectedSport.min_players) {
            setError(`${selectedSport.sports_name} requires at least ${selectedSport.min_players} players.`);
            return;
        }

        if (players.length > selectedSport.max_players) {
            setError(`${selectedSport.sports_name} allows at most ${selectedSport.max_players} players.`);
            return;
        }

        if (players.some(p => !p.name || !p.age)) {
            setError('Please fill in all player details');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                sport_id: selectedSport.id,
                team_name: teamName,
                players: players.map(p => ({
                    name: p.name,
                    age: parseInt(p.age)
                }))
            };

            await api.post('/api/olympiad/team/register/', payload);
            router.push('/olympiad/teams');
        } catch (err: any) {
            console.error('Registration failed', err);
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Olympiad Team Registration</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">

                    {/* Sport Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Sport</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={selectedSport?.id || ''}
                            onChange={(e) => {
                                const sport = sports.find(s => s.id === parseInt(e.target.value));
                                setSelectedSport(sport || null);
                                setPlayers([{ name: '', age: '' }]); // Reset players when sport changes
                                setError('');
                            }}
                            required
                        >
                            <option value="">-- Select a Sport --</option>
                            {sports.map(sport => (
                                <option key={sport.id} value={sport.id}>
                                    {sport.sports_name} (Fee: Rs. {sport.registration_fee})
                                </option>
                            ))}
                        </select>
                        {selectedSport && (
                            <p className="text-sm text-gray-500 mt-1">
                                Players required: {selectedSport.min_players} - {selectedSport.max_players}
                            </p>
                        )}
                    </div>

                    {/* Team Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Team Name</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            required
                            placeholder="Enter your team name"
                        />
                    </div>

                    {/* Players */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-semibold text-gray-700">Team Players</label>
                            <button
                                type="button"
                                onClick={handleAddPlayer}
                                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                            >
                                + Add Player
                            </button>
                        </div>

                        <div className="space-y-3">
                            {players.map((player, index) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Player Name"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={player.name}
                                            onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            placeholder="Age"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            value={player.age}
                                            onChange={(e) => handlePlayerChange(index, 'age', e.target.value)}
                                            required
                                            min="1"
                                        />
                                    </div>
                                    {players.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePlayer(index)}
                                            className="text-red-500 hover:text-red-700 p-2"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary & Submit */}
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-600">Total Entry Fee:</span>
                            <span className="text-xl font-bold text-gray-900">
                                Rs. {selectedSport?.registration_fee || '0.00'}
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Registering...' : 'Register Team'}
                        </button>
                    </div>

                </form>
            </div>
        </ProtectedRoute>
    );
}
