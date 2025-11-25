'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';


interface Player {
    name: string;
    age: number;
}

interface Team {
    id: number;
    team_name: string;
    sport: {
        sports_name: string;
    };
    captain: {
        username: string;
    };
    approved: boolean;
    rejected: boolean;
    rejection_reason: string | null;
    players: Player[];
    created_at: string;
}

export default function AdminOlympiadTeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await api.get('/api/olympiad/teams/');

            // In a real app, you might want a specific admin endpoint that returns ALL teams including rejected ones,
            // but for now we'll use the list endpoint and filter client-side if needed.
            // Assuming the list endpoint returns all teams.
            setTeams(response.data);
        } catch (err) {
            console.error('Failed to fetch teams', err);
            setError('Failed to load teams.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (teamId: number) => {
        setActionLoading(teamId);
        try {
            await api.post(`/api/olympiad/team/${teamId}/approve/`);
            // Update local state
            setTeams(teams.map(t => t.id === teamId ? { ...t, approved: true, rejected: false, rejection_reason: null } : t));
        } catch (err) {
            console.error('Failed to approve team', err);
            alert('Failed to approve team. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const openRejectModal = (teamId: number) => {
        setSelectedTeam(teamId);
        setRejectModalOpen(true);
        setRejectionReason('');
    };

    const closeRejectModal = () => {
        setRejectModalOpen(false);
        setSelectedTeam(null);
        setRejectionReason('');
    };

    const handleReject = async () => {
        if (!selectedTeam) return;
        
        setActionLoading(selectedTeam);
        try {
            await api.post(`/api/olympiad/team/${selectedTeam}/reject/`, {
                reason: rejectionReason
            });
            // Update local state
            setTeams(teams.map(t => t.id === selectedTeam ? { 
                ...t, 
                rejected: true, 
                approved: false, 
                rejection_reason: rejectionReason 
            } : t));
            closeRejectModal();
        } catch (err) {
            console.error('Failed to reject team', err);
            alert('Failed to reject team. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const pendingTeams = teams.filter(t => !t.approved && !t.rejected);
    const approvedTeams = teams.filter(t => t.approved);
    const rejectedTeams = teams.filter(t => t.rejected);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Teams</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                </div>
            )}

            {/* Pending Approvals Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Pending Approvals ({pendingTeams.length})</h2>

                {loading ? (
                    <div className="text-gray-500">Loading...</div>
                ) : pendingTeams.length === 0 ? (
                    <div className="text-gray-500 italic">No pending team registrations.</div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {pendingTeams.map((team) => (
                            <div key={team.id} className="bg-white rounded-lg shadow-md border-l-4 border-yellow-400 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{team.team_name}</h3>
                                        <p className="text-lg text-blue-600 font-semibold">{team.sport.sports_name}</p>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(team.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-500 uppercase font-semibold">Captain</p>
                                        <p className="font-medium">{team.captain.username}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 uppercase font-semibold">Players</p>
                                        <p className="font-medium">{team.players.length} registered</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded p-3 mb-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Roster:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {team.players.map((p, idx) => (
                                            <span key={idx} className="bg-white border border-gray-200 px-2 py-1 rounded text-sm">
                                                {p.name} ({p.age})
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => openRejectModal(team.id)}
                                        disabled={actionLoading === team.id}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(team.id)}
                                        disabled={actionLoading === team.id}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading === team.id ? 'Approving...' : 'Approve Registration'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Approved Teams History */}
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Approved Teams ({approvedTeams.length})</h2>
                {approvedTeams.length === 0 ? (
                    <div className="text-gray-500 italic">No approved teams yet.</div>
                ) : (
                    <div className="bg-white shadow overflow-hidden rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Captain</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {approvedTeams.map((team) => (
                                    <tr key={team.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{team.team_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{team.sport.sports_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{team.captain.username}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(team.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Approved
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Rejected Teams Section */}
            {rejectedTeams.length > 0 && (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Rejected Teams ({rejectedTeams.length})</h2>
                    <div className="bg-white shadow overflow-hidden rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Captain</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rejectedTeams.map((team) => (
                                    <tr key={team.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{team.team_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{team.sport.sports_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{team.captain.username}</td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{team.rejection_reason || 'No reason provided'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Rejected
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Reject Team Registration</h3>
                        <p className="text-gray-600 mb-4">
                            Please provide a reason for rejecting this team registration. This will be visible to the team captain.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason (optional)..."
                            className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows={4}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeRejectModal}
                                disabled={actionLoading !== null}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading !== null}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                            >
                                {actionLoading ? 'Rejecting...' : 'Reject Team'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
