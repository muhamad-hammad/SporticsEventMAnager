'use client';

import { useState, useEffect } from 'react';

import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface House {
    id: number;
    house_name: string;
}

interface Sport {
    id: number;
    sports_name: string;
}

interface SportWinner {
    id: number;
    sport: Sport;
    winner: House | null;
    is_tie: boolean;
    manually_set: boolean;
}

interface Conclusion {
    is_concluded: boolean;
    champion: House | null;
    runner_up: House | null;
    concluded_at: string;
    final_standings: any[];
}

export default function LogConclusionPage() {
    const [conclusion, setConclusion] = useState<Conclusion | null>(null);
    const [sportWinners, setSportWinners] = useState<SportWinner[]>([]);
    const [loading, setLoading] = useState(true);
    const [houses, setHouses] = useState<House[]>([]);
    const [selectedWinners, setSelectedWinners] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        fetchData();
        fetchHouses();
    }, []);

    const fetchData = async () => {
        try {
            const [conclusionRes, winnersRes] = await Promise.all([
                axios.get('http://localhost:8000/api/log/conclusion/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }),
                axios.get('http://localhost:8000/api/log/sport-winners/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            setConclusion(conclusionRes.data.conclusion);
            setSportWinners(winnersRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
            setLoading(false);
        }
    };

    const fetchHouses = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/houses/', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setHouses(res.data);
        } catch (error) {
            console.error('Error fetching houses:', error);
        }
    };

    const handleConclude = async () => {
        if (!confirm('Are you sure you want to conclude the season? This action cannot be undone.')) return;

        try {
            const res = await axios.post('http://localhost:8000/api/log/admin/conclude/', {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setConclusion(res.data.conclusion);
            toast.success('Season concluded successfully!');
            fetchData(); // Refresh to get updated winners
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to conclude season');
        }
    };

    const handleSetWinner = async (sportId: number) => {
        const winnerId = selectedWinners[sportId];
        if (!winnerId) {
            toast.error('Please select a winner');
            return;
        }

        try {
            await axios.post(`http://localhost:8000/api/log/admin/sport-winners/${sportId}/`,
                { winner_id: winnerId },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            toast.success('Winner updated successfully');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to set winner');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Season Conclusion</h1>
                            <p className="text-gray-500 mt-1">Manage final results and sport winners</p>
                        </div>
                        {!conclusion?.is_concluded && (
                            <button
                                onClick={handleConclude}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                                Conclude Season
                            </button>
                        )}
                    </div>
                </div>

                {/* Overall Results */}
                {conclusion?.is_concluded && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid md:grid-cols-2 gap-6"
                    >
                        <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl p-8 border border-yellow-200 shadow-sm">
                            <div className="text-yellow-600 font-semibold mb-2 uppercase tracking-wider">Champion</div>
                            <div className="text-4xl font-extrabold text-gray-900">{conclusion.champion?.house_name || 'TBD'}</div>
                            <div className="mt-4 text-yellow-700 text-sm">Overall Winner</div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-100 to-slate-200 rounded-2xl p-8 border border-gray-200 shadow-sm">
                            <div className="text-gray-600 font-semibold mb-2 uppercase tracking-wider">Runner Up</div>
                            <div className="text-4xl font-extrabold text-gray-900">{conclusion.runner_up?.house_name || 'TBD'}</div>
                            <div className="mt-4 text-gray-700 text-sm">Second Place</div>
                        </div>
                    </motion.div>
                )}

                {/* Sport Winners Management */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">Sport Winners</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {sportWinners.map((item) => (
                            <div key={item.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${item.is_tie ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {item.is_tie ? '⚠️' : '🏆'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{item.sport.sports_name}</h3>
                                        <p className={`text-sm ${item.is_tie ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                            {item.is_tie ? 'Tie - Manual Selection Required' : (item.winner?.house_name || 'No winner yet')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <select
                                        className="block w-full md:w-48 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={selectedWinners[item.sport.id] || ''}
                                        onChange={(e) => setSelectedWinners({ ...selectedWinners, [item.sport.id]: e.target.value })}
                                    >
                                        <option value="">Select Winner</option>
                                        {houses.map(house => (
                                            <option key={house.id} value={house.id}>{house.house_name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => handleSetWinner(item.sport.id)}
                                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                                    >
                                        Update
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
