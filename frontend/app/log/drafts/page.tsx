'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface DraftSession {
    id: number;
    sport: number;
    sport_name: string;
    status: string;
    current_round: number;
    current_pick_index: number;
}

interface DraftWithSport extends DraftSession {
    can_participate: boolean;
    your_turn: boolean;
}

export default function DraftsListPage() {
    const router = useRouter();
    const [drafts, setDrafts] = useState<DraftWithSport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDrafts = async () => {
        try {
            const response = await api.get('/api/log/draft/sessions/');
            setDrafts(response.data);
            setLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch drafts', err);
            setError(err.response?.data?.error || 'Failed to load draft sessions');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
        // Auto-refresh every 5 seconds
        const interval = setInterval(fetchDrafts, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'in_progress':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Live
                    </span>
                );
            case 'completed':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Completed</span>;
            case 'not_started':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">⏳ Pending</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
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

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">LOG Draft Sessions</h1>
                        <p className="mt-2 text-gray-600">
                            View and participate in active draft sessions for League of Games
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Drafts List */}
                    {drafts.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Draft Sessions</h3>
                            <p className="text-gray-500">There are no draft sessions available at the moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {drafts.map((draft) => (
                                <div
                                    key={draft.id}
                                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                                        draft.your_turn ? 'ring-2 ring-green-500' : ''
                                    }`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-xl font-semibold text-gray-900">
                                                        {draft.sport_name}
                                                    </h3>
                                                    {getStatusBadge(draft.status)}
                                                    {draft.your_turn && (
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white animate-pulse">
                                                            🎯 YOUR TURN!
                                                        </span>
                                                    )}
                                                </div>

                                                {draft.status === 'in_progress' && (
                                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                            Round {draft.current_round}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                                            </svg>
                                                            Pick #{draft.current_pick_index + 1}
                                                        </span>
                                                    </div>
                                                )}

                                {draft.status === 'not_started' && (
                                    <p className="text-sm text-gray-500 mb-3">
                                        ⏳ Waiting for admin to start the draft session
                                    </p>
                                )}                                                {draft.status === 'completed' && (
                                                    <p className="text-sm text-green-600 mb-3">
                                                        Draft completed - All teams finalized
                                                    </p>
                                                )}
                                            </div>

                                            <div className="ml-4">
                                                {draft.status === 'in_progress' ? (
                                                    <button
                                                        onClick={() => router.push(`/log/draft/${draft.sport}`)}
                                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                                            draft.your_turn
                                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                        }`}
                                                    >
                                                        {draft.your_turn ? 'Pick Now!' : 'View Draft'}
                                                    </button>
                                                ) : draft.status === 'completed' ? (
                                                    <button
                                                        onClick={() => router.push(`/log/draft/${draft.sport}`)}
                                                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                                    >
                                                        View Results
                                                    </button>
                                                ) : (
                                                    <button
                                                        disabled
                                                        className="px-4 py-2 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed"
                                                    >
                                                        Not Started
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {!draft.can_participate && draft.status !== 'completed' && (
                                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <p className="text-sm text-yellow-800">
                                                    ℹ️ You can view this draft but cannot participate
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Info Card */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 mb-2">How Draft Works</h3>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Captains take turns picking players for their team&apos;s roster</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>You&apos;ll be notified when it&apos;s your turn to pick</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Each team continues picking until all rosters are full</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>This page auto-refreshes to show live updates</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
