'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface User {
    id: number;
    username: string;
    email: string;
}

interface Sport {
    id: number;
    sports_name: string;
}

interface PlayerRegistration {
    id: number;
    user: User;
    sport: Sport;
    status: string;
}

export default function AdminPlayerRegistrationsPage() {
    const [registrations, setRegistrations] = useState<PlayerRegistration[]>([]);
    const [filteredRegistrations, setFilteredRegistrations] = useState<PlayerRegistration[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredRegistrations(registrations);
        } else {
            setFilteredRegistrations(registrations.filter(r => r.status === statusFilter));
        }
    }, [statusFilter, registrations]);

    const fetchRegistrations = async () => {
        try {
            // Get all player registrations for LOG sports (admin endpoint)
            const response = await api.get('/api/log/admin/players/');
            console.log('API Response:', response.data);
            console.log('Number of registrations:', response.data.length);
            setRegistrations(response.data);
            setLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch registrations', err);
            console.error('Error details:', err.response?.data);
            setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to load player registrations');
            setLoading(false);
        }
    };

    const handleApprove = async (regId: number, username: string, sportName: string) => {
        setError('');
        setSuccess('');
        setProcessingId(regId);

        try {
            await api.post(`/api/log/admin/player/${regId}/decision/`, {
                action: 'approved'
            });
            setSuccess(`Approved ${username} for ${sportName}`);
            await fetchRegistrations();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to approve registration');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (regId: number, username: string, sportName: string) => {
        setError('');
        setSuccess('');
        setProcessingId(regId);

        try {
            await api.post(`/api/log/admin/player/${regId}/decision/`, {
                action: 'rejected'
            });
            setSuccess(`Rejected ${username} for ${sportName}`);
            await fetchRegistrations();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to reject registration');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
            case 'approved':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>;
            case 'rejected':
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const getStats = () => {
        return {
            total: registrations.length,
            pending: registrations.filter(r => r.status === 'pending').length,
            approved: registrations.filter(r => r.status === 'approved').length,
            rejected: registrations.filter(r => r.status === 'rejected').length,
        };
    };

    const stats = getStats();

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600">Loading player registrations...</p>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">LOG Player Registrations</h1>
                        <p className="mt-2 text-gray-600">
                            Review and manage player registrations for League of Games sports
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <p className="text-sm text-gray-600 mb-1">Total Registrations</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg shadow-md p-6 border-2 border-yellow-200">
                            <p className="text-sm text-yellow-800 mb-1">Pending Review</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg shadow-md p-6 border-2 border-green-200">
                            <p className="text-sm text-green-800 mb-1">Approved</p>
                            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg shadow-md p-6 border-2 border-red-200">
                            <p className="text-sm text-red-800 mb-1">Rejected</p>
                            <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                        </div>
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

                    {/* Filter */}
                    <div className="mb-6 bg-white rounded-lg shadow-md p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    statusFilter === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                All ({stats.total})
                            </button>
                            <button
                                onClick={() => setStatusFilter('pending')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    statusFilter === 'pending'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Pending ({stats.pending})
                            </button>
                            <button
                                onClick={() => setStatusFilter('approved')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    statusFilter === 'approved'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Approved ({stats.approved})
                            </button>
                            <button
                                onClick={() => setStatusFilter('rejected')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    statusFilter === 'rejected'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Rejected ({stats.rejected})
                            </button>
                        </div>
                    </div>

                    {/* Registrations List */}
                    {filteredRegistrations.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <p className="text-gray-500">
                                {registrations.length === 0 
                                    ? 'No player registrations found'
                                    : `No ${statusFilter} registrations found`
                                }
                            </p>
                            {registrations.length > 0 && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Try changing the filter above
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Player
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sport
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRegistrations.map((reg) => (
                                        <tr key={reg.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{reg.user.username}</div>
                                                    <div className="text-sm text-gray-500">{reg.user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{reg.sport.sports_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(reg.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {reg.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApprove(reg.id, reg.user.username, reg.sport.sports_name)}
                                                            disabled={processingId === reg.id}
                                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(reg.id, reg.user.username, reg.sport.sports_name)}
                                                            disabled={processingId === reg.id}
                                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {reg.status !== 'pending' && (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
