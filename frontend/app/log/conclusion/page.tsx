'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion } from 'framer-motion';
import axios from 'axios';
import Link from 'next/link';

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
}

interface Conclusion {
    is_concluded: boolean;
    champion: House | null;
    runner_up: House | null;
    concluded_at: string;
}

export default function LogResultsPage() {
    const [conclusion, setConclusion] = useState<Conclusion | null>(null);
    const [sportWinners, setSportWinners] = useState<SportWinner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!conclusion?.is_concluded) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
                    <div className="text-center max-w-lg">
                        <div className="text-6xl mb-6">⏳</div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Season In Progress</h1>
                        <p className="text-gray-600 mb-8">
                            The League of Glory season hasn't concluded yet. Keep playing and check back later for the final results!
                        </p>
                        <Link
                            href="/user/dashboard"
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* Header */}
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
                                Season Results
                            </h1>
                            <p className="text-xl text-gray-600">The champions have been crowned!</p>
                        </motion.div>
                    </div>

                    {/* Champions Podium */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Champion */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-100 rounded-3xl p-8 text-center border border-yellow-200 shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">🏆</div>
                            <div className="relative z-10">
                                <div className="text-yellow-600 font-bold uppercase tracking-widest mb-2">Season Champion</div>
                                <h2 className="text-5xl font-black text-gray-900 mb-4">{conclusion.champion?.house_name}</h2>
                                <div className="inline-block bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full font-bold text-sm">
                                    1st Place
                                </div>
                            </div>
                        </motion.div>

                        {/* Runner Up */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-gray-100 via-slate-50 to-gray-200 rounded-3xl p-8 text-center border border-gray-300 shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">🥈</div>
                            <div className="relative z-10">
                                <div className="text-gray-500 font-bold uppercase tracking-widest mb-2">Runner Up</div>
                                <h2 className="text-4xl font-black text-gray-800 mb-4">{conclusion.runner_up?.house_name}</h2>
                                <div className="inline-block bg-gray-300 text-gray-800 px-4 py-1 rounded-full font-bold text-sm">
                                    2nd Place
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sport Winners Grid */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 text-center">Sport Champions</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sportWinners.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center gap-4 hover:shadow-lg transition-shadow"
                                >
                                    <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                                        🏅
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500 font-medium">{item.sport.sports_name}</div>
                                        <div className="text-lg font-bold text-gray-900">
                                            {item.is_tie ? 'Tie' : (item.winner?.house_name || 'TBD')}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="text-center pt-8">
                        <Link
                            href="/user/dashboard"
                            className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center justify-center gap-2"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>

                </div>
            </div>
        </ProtectedRoute>
    );
}
