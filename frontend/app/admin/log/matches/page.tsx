'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Sport {
  id: number;
  sports_name: string;
  is_availableinLog: boolean;
}

interface House {
  id: number;
  house_name: string;
  status: string;
}

interface Match {
  id: number;
  sport: number;
  sport_name: string;
  house_a: number;
  house_a_name: string;
  house_b: number;
  house_b_name: string;
  house_a_score: string | null;  // Changed to string for flexible scoring
  house_b_score: string | null;  // Changed to string for flexible scoring
  winner: number | null;
  winner_name: string | null;
  is_draw: boolean;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  venue: string;
  created_at: string;
  updated_at: string;
}

export default function MatchManagementPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [filterSport, setFilterSport] = useState('');
  const [filterHouse, setFilterHouse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Create/Edit form
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [formData, setFormData] = useState({
    sport: '',
    house_a: '',
    house_b: '',
    scheduled_date: '',
    venue: ''
  });
  
  // Score update form
  const [showScoreForm, setShowScoreForm] = useState(false);
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);
  const [scoreData, setScoreData] = useState({
    house_a_score: '',
    house_b_score: '',
    winner_id: ''  // 'house_a', 'house_b', or 'draw'
  });

  useEffect(() => {
    fetchData();
  }, [filterSport, filterHouse, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch sports (LOG only)
      const sportsRes = await api.get('/api/sports/');
      const logSports = sportsRes.data.filter((s: Sport) => s.is_availableinLog === true);
      setSports(logSports);
      
      // Fetch houses
      const housesRes = await api.get('/api/houses/');
      setHouses(housesRes.data);
      
      // Fetch matches with filters
      const params = new URLSearchParams();
      if (filterSport) params.append('sport', filterSport);
      if (filterHouse) params.append('house', filterHouse);
      if (filterStatus) params.append('status', filterStatus);
      
      const matchesRes = await api.get(`/api/log/admin/matches/?${params.toString()}`);
      setMatches(matchesRes.data);
      
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.house_a === formData.house_b) {
      setError('House A and House B must be different');
      return;
    }
    
    try {
      await api.post('/api/log/admin/matches/create/', formData);
      setSuccess('Match created successfully!');
      setShowForm(false);
      setFormData({ sport: '', house_a: '', house_b: '', scheduled_date: '', venue: '' });
      fetchData();
    } catch (err: any) {
      console.error('Error creating match:', err);
      setError(err.response?.data?.error || 'Failed to create match');
    }
  };

  const handleUpdateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMatch) return;
    
    setError('');
    setSuccess('');
    
    try {
      await api.patch(`/api/log/admin/matches/${editingMatch.id}/`, {
        venue: formData.venue,
        scheduled_date: formData.scheduled_date,
        status: filterStatus || editingMatch.status
      });
      setSuccess('Match updated successfully!');
      setShowForm(false);
      setEditingMatch(null);
      fetchData();
    } catch (err: any) {
      console.error('Error updating match:', err);
      setError(err.response?.data?.error || 'Failed to update match');
    }
  };

  const handleUpdateScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringMatch) return;
    
    setError('');
    setSuccess('');
    
    try {
      await api.post(`/api/log/admin/matches/${scoringMatch.id}/result/`, {
        house_a_score: scoreData.house_a_score,
        house_b_score: scoreData.house_b_score,
        winner_id: scoreData.winner_id === 'draw' ? null : scoreData.winner_id
      });
      setSuccess('Score updated! Leaderboard updated.');
      setShowScoreForm(false);
      setScoringMatch(null);
      setScoreData({ house_a_score: '', house_b_score: '', winner_id: '' });
      fetchData();
    } catch (err: any) {
      console.error('Error updating score:', err);
      setError(err.response?.data?.error || 'Failed to update score');
    }
  };

  const handleDeleteMatch = async (matchId: number) => {
    if (!confirm('Are you sure you want to delete this match? This will recalculate the leaderboard.')) {
      return;
    }
    
    setError('');
    setSuccess('');
    
    try {
      await api.delete(`/api/log/admin/matches/${matchId}/delete/`);
      setSuccess('Match deleted successfully!');
      fetchData();
    } catch (err: any) {
      console.error('Error deleting match:', err);
      setError(err.response?.data?.error || 'Failed to delete match');
    }
  };

  const openEditForm = (match: Match) => {
    setEditingMatch(match);
    setFormData({
      sport: match.sport.toString(),
      house_a: match.house_a.toString(),
      house_b: match.house_b.toString(),
      scheduled_date: match.scheduled_date.slice(0, 16),
      venue: match.venue
    });
    setShowForm(true);
  };

  const openScoreForm = (match: Match) => {
    setScoringMatch(match);
    setScoreData({
      house_a_score: match.house_a_score || '',
      house_b_score: match.house_b_score || '',
      winner_id: match.is_draw ? 'draw' : (match.winner ? match.winner.toString() : '')
    });
    setShowScoreForm(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Loading matches...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Match Management</h1>
          <p className="text-gray-600 mt-2">Create and manage LOG matches</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => {
              setEditingMatch(null);
              setFormData({ sport: '', house_a: '', house_b: '', scheduled_date: '', venue: '' });
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create New Match
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Sport</label>
            <select
              value={filterSport}
              onChange={(e) => setFilterSport(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sports</option>
              {sports.map(sport => (
                <option key={sport.id} value={sport.id}>{sport.sports_name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by House</label>
            <select
              value={filterHouse}
              onChange={(e) => setFilterHouse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Houses</option>
              {houses.map(house => (
                <option key={house.id} value={house.id}>{house.house_name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Matches List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {matches.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No matches found. Create your first match!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sport</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teams</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Venue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matches.map(match => (
                    <tr key={match.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {match.sport_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{match.house_a_name}</div>
                        <div className="text-gray-500">vs</div>
                        <div className="font-medium">{match.house_b_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {match.house_a_score !== null && match.house_b_score !== null ? (
                          <div className="font-bold">
                            <div className={match.winner === match.house_a ? 'text-green-600' : ''}>
                              {match.house_a_score}
                            </div>
                            <div className={match.winner === match.house_b ? 'text-green-600' : ''}>
                              {match.house_b_score}
                            </div>
                            {match.winner_name && (
                              <div className="text-xs text-gray-500 mt-1">
                                Winner: {match.winner_name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(match.status)}`}>
                          {match.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{new Date(match.scheduled_date).toLocaleString()}</div>
                        <div className="text-gray-500">{match.venue}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => openScoreForm(match)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Score
                        </button>
                        <button
                          onClick={() => openEditForm(match)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMatch(match.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Match Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">
                {editingMatch ? 'Edit Match' : 'Create New Match'}
              </h2>
              
              <form onSubmit={editingMatch ? handleUpdateMatch : handleCreateMatch}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
                    <select
                      value={formData.sport}
                      onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                      required
                      disabled={!!editingMatch}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Sport</option>
                      {sports.map(sport => (
                        <option key={sport.id} value={sport.id}>{sport.sports_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">House A</label>
                    <select
                      value={formData.house_a}
                      onChange={(e) => setFormData({ ...formData, house_a: e.target.value })}
                      required
                      disabled={!!editingMatch}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select House</option>
                      {houses.map(house => (
                        <option key={house.id} value={house.id}>{house.house_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">House B</label>
                    <select
                      value={formData.house_b}
                      onChange={(e) => setFormData({ ...formData, house_b: e.target.value })}
                      required
                      disabled={!!editingMatch}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select House</option>
                      {houses.map(house => (
                        <option key={house.id} value={house.id}>{house.house_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Match Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                    <input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      required
                      placeholder="e.g., Main Field"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingMatch ? 'Update Match' : 'Create Match'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMatch(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Score Update Modal */}
        {showScoreForm && scoringMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">Update Match Score</h2>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">{scoringMatch.sport_name}</div>
                <div className="font-bold">{scoringMatch.house_a_name} vs {scoringMatch.house_b_name}</div>
              </div>
              
              <form onSubmit={handleUpdateScore}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {scoringMatch.house_a_name} Score
                    </label>
                    <input
                      type="text"
                      value={scoreData.house_a_score}
                      onChange={(e) => setScoreData({ ...scoreData, house_a_score: e.target.value })}
                      required
                      placeholder="e.g., 3 goals, 156/10, 21-19"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {scoringMatch.house_b_name} Score
                    </label>
                    <input
                      type="text"
                      value={scoreData.house_b_score}
                      onChange={(e) => setScoreData({ ...scoreData, house_b_score: e.target.value })}
                      required
                      placeholder="e.g., 2 goals, 142/10, 19-21"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Winner
                    </label>
                    <select
                      value={scoreData.winner_id}
                      onChange={(e) => setScoreData({ ...scoreData, winner_id: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Winner</option>
                      <option value={scoringMatch.house_a}>{scoringMatch.house_a_name}</option>
                      <option value={scoringMatch.house_b}>{scoringMatch.house_b_name}</option>
                      <option value="draw">Draw</option>
                    </select>
                  </div>

                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    <strong>Note:</strong> Enter scores as text (e.g., "3 goals", "156/10") and manually select the winner.
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Update Score
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowScoreForm(false);
                      setScoringMatch(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
