'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface LogSettings {
    id: number;
    house_proposals_open: boolean;
    player_registration_open: boolean;
    houses_finalized: boolean;
    registration_finalized: boolean;
    updated_at: string;
    updated_by_username: string | null;
}

export default function LogSettingsPage() {
    const [settings, setSettings] = useState<LogSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/api/log/settings/');
            setSettings(response.data);
            setLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch settings', err);
            setError(err.response?.data?.error || 'Failed to load settings');
            setLoading(false);
        }
    };

    const handleToggleHouseProposals = async () => {
        if (settings?.houses_finalized) {
            setError('Cannot toggle house proposals - houses have been finalized');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setActionLoading('house_proposals');
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/api/log/admin/toggle-house-proposals/', {});
            setSuccess(response.data.msg);
            await fetchSettings();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Toggle house proposals error:', err);
            console.error('Error response:', err.response);
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to toggle house proposals';
            setError(errorMsg);
            setTimeout(() => setError(''), 5000);
        } finally {
            setActionLoading(null);
        }
    };

    const handleTogglePlayerRegistration = async () => {
        if (settings?.registration_finalized) {
            setError('Cannot toggle player registration - registration has been finalized');
            setTimeout(() => setError(''), 3000);
            return;
        }

        setActionLoading('player_registration');
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/api/log/admin/toggle-player-registration/', {});
            setSuccess(response.data.msg);
            await fetchSettings();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Toggle player registration error:', err);
            console.error('Error response:', err.response);
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to toggle player registration';
            setError(errorMsg);
            setTimeout(() => setError(''), 5000);
        } finally {
            setActionLoading(null);
        }
    };

    const handleFinalizeHouses = async () => {
        if (!confirm('Are you sure you want to finalize houses? This action cannot be undone and will permanently close house proposals.')) {
            return;
        }

        setActionLoading('finalize_houses');
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/api/log/admin/finalize-houses/', {});
            setSuccess(response.data.msg);
            await fetchSettings();
            setTimeout(() => setSuccess(''), 5000);
        } catch (err: any) {
            console.error('Finalize houses error:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to finalize houses';
            setError(errorMsg);
            setTimeout(() => setError(''), 3000);
        } finally {
            setActionLoading(null);
        }
    };

    const handleFinalizeRegistration = async () => {
        if (!confirm('Are you sure you want to finalize player registration? This action cannot be undone and will permanently close player registrations.')) {
            return;
        }

        setActionLoading('finalize_registration');
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/api/log/admin/finalize-registration/', {});
            setSuccess(response.data.msg);
            await fetchSettings();
            setTimeout(() => setSuccess(''), 5000);
        } catch (err: any) {
            console.error('Finalize registration error:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to finalize registration';
            setError(errorMsg);
            setTimeout(() => setError(''), 3000);
        } finally {
            setActionLoading(null);
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

    if (!settings) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-50 p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">{error || 'Failed to load settings'}</p>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">LOG Module Settings</h1>
                        <p className="text-gray-600">Control access and states for the LOG event system</p>
                        {settings.updated_by_username && (
                            <p className="text-sm text-gray-500 mt-2">
                                Last updated by <span className="font-medium">{settings.updated_by_username}</span> on{' '}
                                {new Date(settings.updated_at).toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Alert Messages */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800">{success}</p>
                        </div>
                    )}

                    {/* Settings Cards */}
                    <div className="space-y-6">
                        {/* House Proposals Card */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">House Proposals</h2>
                                    <p className="text-gray-600">Allow users to propose new houses</p>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    settings.houses_finalized
                                        ? 'bg-gray-100 text-gray-800'
                                        : settings.house_proposals_open
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {settings.houses_finalized ? '🔒 Finalized' : settings.house_proposals_open ? '✓ Open' : '✗ Closed'}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleToggleHouseProposals}
                                    disabled={settings.houses_finalized || actionLoading === 'house_proposals'}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {actionLoading === 'house_proposals' ? 'Loading...' : settings.house_proposals_open ? 'Close Proposals' : 'Open Proposals'}
                                </button>
                                {!settings.houses_finalized && (
                                    <button
                                        onClick={handleFinalizeHouses}
                                        disabled={actionLoading === 'finalize_houses'}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {actionLoading === 'finalize_houses' ? 'Finalizing...' : 'Finalize Houses'}
                                    </button>
                                )}
                            </div>
                            {settings.houses_finalized && (
                                <p className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded">
                                    ⚠️ Houses have been finalized. Users can no longer submit house proposals.
                                </p>
                            )}
                        </div>

                        {/* Player Registration Card */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Player Registration</h2>
                                    <p className="text-gray-600">Allow players to register for LOG sports</p>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    settings.registration_finalized
                                        ? 'bg-gray-100 text-gray-800'
                                        : settings.player_registration_open
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {settings.registration_finalized ? '🔒 Finalized' : settings.player_registration_open ? '✓ Open' : '✗ Closed'}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleTogglePlayerRegistration}
                                    disabled={settings.registration_finalized || actionLoading === 'player_registration'}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {actionLoading === 'player_registration' ? 'Loading...' : settings.player_registration_open ? 'Close Registration' : 'Open Registration'}
                                </button>
                                {!settings.registration_finalized && (
                                    <button
                                        onClick={handleFinalizeRegistration}
                                        disabled={actionLoading === 'finalize_registration'}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {actionLoading === 'finalize_registration' ? 'Finalizing...' : 'Finalize Registration'}
                                    </button>
                                )}
                            </div>
                            {settings.registration_finalized && (
                                <p className="mt-4 text-sm text-gray-500 bg-gray-50 p-3 rounded">
                                    ⚠️ Player registration has been finalized. Players can no longer register for sports.
                                </p>
                            )}
                        </div>

                        {/* Info Card */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3">ℹ️ How it works</h3>
                            <ul className="space-y-2 text-blue-800">
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span><strong>Open/Close:</strong> Temporarily enable or disable features. Can be toggled multiple times.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span><strong>Finalize:</strong> Permanently locks the feature. This action cannot be undone.</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span><strong>Draft Access:</strong> Only house captains and admins can access draft features.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
