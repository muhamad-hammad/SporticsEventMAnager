'use client';

import { useState, useEffect } from 'react';
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

interface Sport {
    id: number;
    sports_name: string;
    min_players: number;
    max_players: number;
    status: string;
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

interface SportCaptainInput {
    sport_id: number;
    name: string;
    roll_no: string;
    email: string;
}

export default function HouseProposalPage() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [proposals, setProposals] = useState<HouseProposal[]>([]);
    const [houseName, setHouseName] = useState('');
    const [sportCaptains, setSportCaptains] = useState<SportCaptainInput[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchSports();
        fetchProposals();
    }, []);

    const fetchSports = async () => {
        try {
            const response = await api.get('/api/log/sports/');
            setSports(response.data);
            // Initialize sport captains array with empty values for each sport
            setSportCaptains(response.data.map((sport: Sport) => ({
                sport_id: sport.id,
                name: '',
                roll_no: '',
                email: ''
            })));
        } catch (err) {
            console.error('Failed to fetch sports', err);
            setError('Failed to load sports available for LOG events');
        }
    };

    const fetchProposals = async () => {
        try {
            const response = await api.get('/api/log/house/propose/');
            setProposals(response.data);
        } catch (err) {
            console.error('Failed to fetch proposals', err);
        }
    };

    const handleCaptainChange = (sportId: number, field: keyof SportCaptainInput, value: string) => {
        setSportCaptains(prev =>
            prev.map(captain =>
                captain.sport_id === sportId
                    ? { ...captain, [field]: value }
                    : captain
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!houseName.trim()) {
            setError('Please enter a house name');
            return;
        }

        // Filter out sport captains with any filled field
        const filledCaptains = sportCaptains.filter(
            captain => captain.name.trim() || captain.roll_no.trim() || captain.email.trim()
        );

        // Validate that filled captains have all required fields
        const invalidCaptains = filledCaptains.filter(
            captain => !captain.name.trim() || !captain.roll_no.trim() || !captain.email.trim()
        );

        if (invalidCaptains.length > 0) {
            setError('Please fill all fields (Name, Roll No, Email) for each sport captain you want to add');
            return;
        }

        if (filledCaptains.length === 0) {
            setError('Please add at least one sport captain');
            return;
        }

        setLoading(true);

        try {
            await api.post('/api/log/house/propose/', {
                house_name: houseName,
                sport_captain_details: filledCaptains
            });

            setSuccess('House proposal submitted successfully! Awaiting admin approval.');
            setHouseName('');
            setSportCaptains(sports.map(sport => ({
                sport_id: sport.id,
                name: '',
                roll_no: '',
                email: ''
            })));
            setShowForm(false);
            fetchProposals(); // Refresh the list
        } catch (err: any) {
            console.error('Failed to submit proposal', err);
            const errorMsg = err.response?.data?.sport_captain_details?.[0] 
                || err.response?.data?.detail 
                || 'Failed to submit house proposal. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
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

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">LOG House Proposals</h1>
                        <p className="mt-2 text-gray-600">
                            Submit a house proposal to participate in LOG events
                        </p>
                    </div>

                    {/* Success/Error Messages */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800">{success}</p>
                        </div>
                    )}

                    {/* New Proposal Button */}
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            + New House Proposal
                        </button>
                    )}

                    {/* Proposal Form */}
                    {showForm && (
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-900">Create House Proposal</h2>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setError('');
                                        setHouseName('');
                                        setSportCaptains(sports.map(sport => ({
                                            sport_id: sport.id,
                                            name: '',
                                            roll_no: '',
                                            email: ''
                                        })));
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* House Name */}
                                <div>
                                    <label htmlFor="houseName" className="block text-sm font-medium text-gray-700 mb-2">
                                        House Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="houseName"
                                        value={houseName}
                                        onChange={(e) => setHouseName(e.target.value)}
                                        placeholder="e.g., Phoenix House, Dragon House"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Sport Captains Entry */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Sport Captains * (You will automatically become House Captain)
                                    </label>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Fill in the details for sport captains. You can add captains for any or all sports.
                                    </p>
                                    
                                    <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                                        {sports.length === 0 ? (
                                            <p className="text-gray-500 text-center py-4">Loading sports...</p>
                                        ) : (
                                            sports.map((sport) => {
                                                const captain = sportCaptains.find(c => c.sport_id === sport.id);
                                                return (
                                                    <div key={sport.id} className="bg-gray-50 p-4 rounded-lg">
                                                        <h4 className="font-medium text-gray-900 mb-3">{sport.sports_name}</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                    Captain Name
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={captain?.name || ''}
                                                                    onChange={(e) => handleCaptainChange(sport.id, 'name', e.target.value)}
                                                                    placeholder="Full Name"
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                    Roll Number
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={captain?.roll_no || ''}
                                                                    onChange={(e) => handleCaptainChange(sport.id, 'roll_no', e.target.value)}
                                                                    placeholder="e.g., 2021001"
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                    Email
                                                                </label>
                                                                <input
                                                                    type="email"
                                                                    value={captain?.email || ''}
                                                                    onChange={(e) => handleCaptainChange(sport.id, 'email', e.target.value)}
                                                                    placeholder="email@example.com"
                                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Filled: {sportCaptains.filter(c => c.name.trim() && c.roll_no.trim() && c.email.trim()).length} / {sports.length} sports
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                                    >
                                        {loading ? 'Submitting...' : 'Submit Proposal'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setError('');
                                            setHouseName('');
                                            setSportCaptains(sports.map(sport => ({
                                                sport_id: sport.id,
                                                name: '',
                                                roll_no: '',
                                                email: ''
                                            })));
                                        }}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Proposals List */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">My House Proposals</h2>
                        </div>

                        {proposals.length === 0 ? (
                            <div className="p-8 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <p className="mt-4 text-gray-500">No house proposals yet</p>
                                <p className="text-sm text-gray-400">Click &quot;New House Proposal&quot; to get started</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {proposals.map((proposal) => (
                                    <div key={proposal.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {proposal.house.house_name}
                                                    </h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                                                        {proposal.status.toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="space-y-2 text-sm text-gray-600">
                                                    <p>
                                                        <span className="font-medium">House Captain:</span> {proposal.captain.username}
                                                    </p>
                                                    <div>
                                                        <span className="font-medium">Sport Captains ({proposal.sport_captains.length}):</span>
                                                        <div className="mt-2 space-y-2">
                                                            {proposal.sport_captains.map((captain) => (
                                                                <div
                                                                    key={captain.id}
                                                                    className="bg-gray-50 p-2 rounded"
                                                                >
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {captain.sport_name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-600">
                                                                        {captain.name} • {captain.roll_no} • {captain.email}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        Submitted: {new Date(proposal.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
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
