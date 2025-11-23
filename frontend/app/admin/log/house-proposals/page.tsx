'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    department: string | null;
    contact_no: string | null;
}

interface SportCaptainDetail {
    id: number;
    sport: number;
    sport_name: string;
    name: string;
    roll_no: string;
    email: string;
}

interface House {
    id: number;
    house_name: string;
    captain: User | null;
    status: string;
    created_at: string;
}

interface HouseProposal {
    id: number;
    house: House;
    captain: User;
    sport_captains: SportCaptainDetail[];
    status: string;
    created_at: string;
}

export default function AdminHouseProposalsPage() {
    const router = useRouter();
    const [proposals, setProposals] = useState<HouseProposal[]>([]);
    const [filteredProposals, setFilteredProposals] = useState<HouseProposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        fetchProposals();
    }, []);

    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredProposals(proposals);
        } else {
            setFilteredProposals(proposals.filter(p => p.status === statusFilter));
        }
    }, [statusFilter, proposals]);

    const fetchProposals = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/log/house/propose/');
            setProposals(response.data);
            setFilteredProposals(response.data);
        } catch (err: any) {
            console.error('Failed to fetch proposals', err);
            setError('Failed to load house proposals');
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (houseId: number, action: 'approve' | 'reject') => {
        setError('');
        setSuccess('');
        setProcessingId(houseId);

        try {
            const response = await api.post(`/api/log/admin/house/${houseId}/decision/`, {
                action
            });

            setSuccess(response.data.msg || `House ${action}d successfully`);
            
            // Show additional info if approved
            if (action === 'approve' && response.data.house_captain) {
                setSuccess(
                    `House approved successfully! ${response.data.house_captain} is now the House Captain. ${response.data.teams_created} teams created.`
                );
            }

            // Refresh the list
            await fetchProposals();
        } catch (err: any) {
            console.error(`Failed to ${action} house`, err);
            setError(err.response?.data?.error || err.response?.data?.detail || `Failed to ${action} house. Please try again.`);
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const pendingCount = proposals.filter(p => p.status === 'pending').length;
    const approvedCount = proposals.filter(p => p.status === 'approved').length;
    const rejectedCount = proposals.filter(p => p.status === 'rejected').length;

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Manage House Proposals</h1>
                        <p className="mt-2 text-gray-600">
                            Review and approve/reject LOG house proposals
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">{proposals.length}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-yellow-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-yellow-600">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Approved</p>
                                    <p className="text-2xl font-bold text-green-900">{approvedCount}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-600">Rejected</p>
                                    <p className="text-2xl font-bold text-red-900">{rejectedCount}</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
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

                    {/* Filter Tabs */}
                    <div className="bg-white rounded-lg shadow-sm mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="flex -mb-px">
                                {['all', 'pending', 'approved', 'rejected'].map((filter) => (
                                    <button
                                        key={filter}
                                        onClick={() => setStatusFilter(filter)}
                                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                            statusFilter === filter
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                        {filter === 'all' && ` (${proposals.length})`}
                                        {filter === 'pending' && ` (${pendingCount})`}
                                        {filter === 'approved' && ` (${approvedCount})`}
                                        {filter === 'rejected' && ` (${rejectedCount})`}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Proposals List */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-4 text-gray-500">Loading proposals...</p>
                            </div>
                        ) : filteredProposals.length === 0 ? (
                            <div className="p-8 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <p className="mt-4 text-gray-500">No {statusFilter !== 'all' ? statusFilter : ''} proposals found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredProposals.map((proposal) => (
                                    <div key={proposal.id} className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                            {/* Proposal Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-xl font-semibold text-gray-900">
                                                        {proposal.house.house_name}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                                                        {proposal.status.toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-600 mb-2">
                                                            <span className="font-medium">House Captain (Proposer):</span>
                                                        </p>
                                                        <div className="bg-blue-50 p-3 rounded-lg">
                                                            <p className="font-medium text-blue-900">{proposal.captain.username}</p>
                                                            <p className="text-blue-700 text-xs">{proposal.captain.email}</p>
                                                            {proposal.captain.department && (
                                                                <p className="text-blue-600 text-xs mt-1">{proposal.captain.department}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-gray-600 mb-2">
                                                            <span className="font-medium">Sport Captains ({proposal.sport_captains.length}):</span>
                                                        </p>
                                                        <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                                                            <div className="space-y-3">
                                                                {proposal.sport_captains.map((captain) => (
                                                                    <div key={captain.id} className="border-b border-gray-200 pb-2 last:border-0">
                                                                        <p className="font-medium text-gray-900 text-xs">{captain.sport_name}</p>
                                                                        <p className="text-xs text-gray-700">{captain.name}</p>
                                                                        <p className="text-xs text-gray-600">Roll No: {captain.roll_no}</p>
                                                                        <p className="text-xs text-gray-600">{captain.email}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-gray-500 mt-3">
                                                    Submitted: {new Date(proposal.created_at).toLocaleString()}
                                                </p>
                                            </div>

                                            {/* Action Buttons */}
                                            {proposal.status === 'pending' && (
                                                <div className="flex lg:flex-col gap-2 lg:w-40">
                                                    <button
                                                        onClick={() => handleDecision(proposal.house.id, 'approve')}
                                                        disabled={processingId === proposal.house.id}
                                                        className="flex-1 lg:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                                                    >
                                                        {processingId === proposal.house.id ? 'Processing...' : '✓ Approve'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDecision(proposal.house.id, 'reject')}
                                                        disabled={processingId === proposal.house.id}
                                                        className="flex-1 lg:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                                                    >
                                                        {processingId === proposal.house.id ? 'Processing...' : '✗ Reject'}
                                                    </button>
                                                </div>
                                            )}

                                            {proposal.status !== 'pending' && (
                                                <div className="lg:w-40 flex items-center justify-center">
                                                    <span className="text-sm text-gray-500 italic">
                                                        {proposal.status === 'approved' ? 'Already approved' : 'Already rejected'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
