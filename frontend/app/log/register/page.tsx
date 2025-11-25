'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Sport {
    id: number;
    sports_name: string;
    max_players: number;
    is_availableinLog: boolean;
}

interface PlayerRegistration {
    id: number;
    user: number;
    sport: number;
    status: string;
}

export default function LogPlayerRegisterPage() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [registrations, setRegistrations] = useState<PlayerRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [settings, setSettings] = useState<{
        player_registration_open: boolean;
        registration_finalized: boolean;
    } | null>(null);

    useEffect(() => {
        fetchData();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/api/log/settings/');
            setSettings(response.data);
        } catch (err) {
            console.error('Failed to fetch settings', err);
        }
    };

    const fetchData = async () => {
        try {
            const [sportsResponse, registrationsResponse] = await Promise.all([
                api.get('/api/log/sports/'),
                api.get('/api/log/player/register/')
            ]);
            
            setSports(sportsResponse.data);
            setRegistrations(registrationsResponse.data);
            setLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch data', err);
            setError('Failed to load sports and registrations');
            setLoading(false);
        }
    };

    const handleRegister = async (sportId: number) => {
        setError('');
        setSuccess('');
        setProcessingId(sportId);

        try {
            const response = await api.post('/api/log/player/register/', {
                sport_id: sportId
            });
            setSuccess(response.data.msg);
            await fetchData();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to register for sport');
        } finally {
            setProcessingId(null);
        }
    };

    const getRegistrationStatus = (sportId: number) => {
        return registrations.find(reg => reg.sport === sportId);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">⏳ Pending</span>;
            case 'approved':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Approved</span>;
            case 'rejected':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">✗ Rejected</span>;
            default:
                return null;
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
                        <h1 className="text-3xl font-bold text-gray-900">Register for LOG Sports</h1>
                        <p className="mt-2 text-gray-600">
                            Select sports you want to participate in for League of Games
                        </p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                            <p className="text-red-800">{error}</p>
                            <button onClick={() => setError('')} className="text-red-800 hover:text-red-900">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                            <p className="text-green-800">{success}</p>
                            <button onClick={() => setSuccess('')} className="text-green-800 hover:text-green-900">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Lock Messages */}
                    {settings?.registration_finalized && (
                        <div className="mb-6 p-6 bg-gray-100 border-2 border-gray-300 rounded-lg">
                            <div className="flex items-center gap-3">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Player Registration Has Been Finalized</h3>
                                    <p className="text-gray-700">New player registrations are no longer being accepted. Registration has been finalized by the admin.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {settings && !settings.registration_finalized && !settings.player_registration_open && (
                        <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                            <div className="flex items-center gap-3">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="text-lg font-semibold text-yellow-900">Player Registration Currently Closed</h3>
                                    <p className="text-yellow-800">Player registration is temporarily closed. Please wait for the admin to open it.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* My Registrations Summary */}
                    {registrations.length > 0 && (
                        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-900 mb-3">Your Registrations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-lg p-4">
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {registrations.filter(r => r.status === 'pending').length}
                                    </p>
                                    <p className="text-sm text-gray-600">Pending Approval</p>
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                    <p className="text-2xl font-bold text-green-600">
                                        {registrations.filter(r => r.status === 'approved').length}
                                    </p>
                                    <p className="text-sm text-gray-600">Approved</p>
                                </div>
                                <div className="bg-white rounded-lg p-4">
                                    <p className="text-2xl font-bold text-red-600">
                                        {registrations.filter(r => r.status === 'rejected').length}
                                    </p>
                                    <p className="text-sm text-gray-600">Rejected</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sports List */}
                    {sports.length === 0 ? (
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
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sports Available</h3>
                            <p className="text-gray-500">There are no LOG sports available for registration at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sports.map((sport) => {
                                const registration = getRegistrationStatus(sport.id);
                                const isRegistered = !!registration;

                                return (
                                    <div
                                        key={sport.id}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {sport.sports_name}
                                                </h3>
                                                {isRegistered && getStatusBadge(registration.status)}
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Max Players:</span> {sport.max_players}
                                                </p>
                                            </div>

                                            {!isRegistered ? (
                                                <button
                                                    onClick={() => handleRegister(sport.id)}
                                                    disabled={
                                                        processingId === sport.id || 
                                                        settings?.registration_finalized || 
                                                        !settings?.player_registration_open
                                                    }
                                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                                >
                                                    {processingId === sport.id ? 'Registering...' : 
                                                     settings?.registration_finalized ? 'Registration Closed' :
                                                     !settings?.player_registration_open ? 'Registration Closed' :
                                                     'Register'}
                                                </button>
                                            ) : registration.status === 'approved' ? (
                                                <div className="w-full px-4 py-2 bg-green-50 border-2 border-green-500 text-green-800 rounded-lg text-center font-medium">
                                                    ✓ You&apos;re Registered
                                                </div>
                                            ) : registration.status === 'pending' ? (
                                                <div className="w-full px-4 py-2 bg-yellow-50 border-2 border-yellow-500 text-yellow-800 rounded-lg text-center font-medium">
                                                    ⏳ Awaiting Approval
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="w-full px-4 py-2 bg-red-50 border-2 border-red-500 text-red-800 rounded-lg text-center font-medium text-sm">
                                                        ✗ Registration Rejected
                                                    </div>
                                                    <button
                                                        onClick={() => handleRegister(sport.id)}
                                                        disabled={processingId === sport.id}
                                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                                                    >
                                                        {processingId === sport.id ? 'Registering...' : 'Register Again'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Info Section */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 mb-3">Registration Information</h3>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>You can register for multiple sports</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Your registration will be reviewed by the admin</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>Once approved, you&apos;ll be eligible for the draft</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span>House captains will pick you during the draft session</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
