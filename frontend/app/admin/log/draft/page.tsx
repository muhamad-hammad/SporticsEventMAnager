'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Sport {
    id: number;
    sports_name: string;
    min_players: number;
    max_players: number;
    is_availableinLog: boolean;
}

interface DraftSession {
    id: number;
    sport: number;
    sport_name: string;
    status: string;
    current_round: number;
    current_pick_index: number;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
}

export default function AdminDraftManagementPage() {
    const router = useRouter();
    const [sports, setSports] = useState<Sport[]>([]);
    const [sessions, setSessions] = useState<{ [key: number]: DraftSession }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const sportsResponse = await api.get('/api/log/sports/');
            setSports(sportsResponse.data);

            // Fetch draft sessions for each sport
            const sessionsData: { [key: number]: DraftSession } = {};
            for (const sport of sportsResponse.data) {
                try {
                    const sessionResponse = await api.get(`/api/log/draft/session/${sport.id}/`);
                    sessionsData[sport.id] = sessionResponse.data.session;
                } catch (err: any) {
                    // Session doesn't exist yet, that's okay
                    if (err.response?.status !== 404) {
                        console.error(`Error fetching session for sport ${sport.id}:`, err);
                    }
                }
            }
            setSessions(sessionsData);
        } catch (err: any) {
            console.error('Failed to fetch data', err);
            setError('Failed to load sports and draft sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleInitialize = async (sportId: number) => {
        setError('');
        setSuccess('');
        setProcessingId(sportId);

        try {
            const response = await api.post(`/api/log/draft/session/${sportId}/initialize/`);
            setSuccess(response.data.msg);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to initialize draft session');
        } finally {
            setProcessingId(null);
        }
    };

    const handleStart = async (sportId: number) => {
        setError('');
        setSuccess('');
        setProcessingId(sportId);

        try {
            const response = await api.post(`/api/log/draft/session/${sportId}/start/`);
            setSuccess(response.data.msg);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to start draft session');
        } finally {
            setProcessingId(null);
        }
    };

    const handleViewDraft = (sportId: number) => {
        router.push(`/admin/log/draft/${sportId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'not_started':
                return 'bg-gray-100 text-gray-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'not_started':
                return 'Not Started';
            case 'in_progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            default:
                return status;
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">LOG Draft Management</h1>
                        <p className="mt-2 text-gray-600">
                            Initialize and manage draft sessions for each sport
                        </p>
                    </div>

                    {/* Success/Error Messages */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                            <p className="text-red-800">{error}</p>
                            <button onClick={() => setError('')} className="text-red-800 hover:text-red-900">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                            <p className="text-green-800">{success}</p>
                            <button onClick={() => setSuccess('')} className="text-green-800 hover:text-green-900">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Sports List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : sports.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <p className="text-gray-500">No sports available for LOG</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sports.map((sport) => {
                                const session = sessions[sport.id];
                                return (
                                    <div key={sport.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {sport.sports_name}
                                                </h3>
                                                {session && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                                        {getStatusLabel(session.status)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                                <p>Max Players: {sport.max_players}</p>
                                                {session && (
                                                    <>
                                                        <p>Round: {session.current_round}</p>
                                                        <p>Pick #{session.current_pick_index + 1}</p>
                                                    </>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                {!session ? (
                                                    <button
                                                        onClick={() => handleInitialize(sport.id)}
                                                        disabled={processingId === sport.id}
                                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                                    >
                                                        {processingId === sport.id ? 'Initializing...' : 'Initialize Draft'}
                                                    </button>
                                                ) : session.status === 'not_started' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleStart(sport.id)}
                                                            disabled={processingId === sport.id}
                                                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                                        >
                                                            {processingId === sport.id ? 'Starting...' : 'Start Draft'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewDraft(sport.id)}
                                                            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                                        >
                                                            View Details
                                                        </button>
                                                    </>
                                                ) : session.status === 'in_progress' ? (
                                                    <button
                                                        onClick={() => handleViewDraft(sport.id)}
                                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                    >
                                                        Monitor Draft
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleViewDraft(sport.id)}
                                                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                                    >
                                                        View Results
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
