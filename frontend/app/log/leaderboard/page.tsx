'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface House {
  id: number;
  house_name: string;
}

interface OverallStanding {
  house: House;
  total_points: number;
  total_wins: number;
  total_draws: number;
  total_losses: number;
  total_matches: number;
}

interface Conclusion {
  id: number;
  champion: number | null;
  champion_name: string | null;
  runner_up: number | null;
  runner_up_name: string | null;
  is_concluded: boolean;
  concluded_at: string | null;
  concluded_by_name: string | null;
}

export default function LeaderboardPage() {
  const [standings, setStandings] = useState<OverallStanding[]>([]);
  const [conclusion, setConclusion] = useState<Conclusion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchData();
    checkAdmin();
  }, []);

  const checkAdmin = () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setIsAdmin(userData.role === 'admin' || userData.is_staff);
      }
    } catch (e) {
      console.error('Error checking admin status:', e);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [standingsRes, conclusionRes] = await Promise.all([
        api.get('/api/log/leaderboard/'),
        api.get('/api/log/conclusion/')
      ]);
      
      setStandings(standingsRes.data);
      setConclusion(conclusionRes.data);
      
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleConcludeLOG = async () => {
    if (!confirm('Are you sure you want to conclude LOG? This will determine the champion and runner-up based on current standings.')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const response = await api.post('/api/log/admin/conclude/');
      setSuccess(response.data.msg);
      setConclusion(response.data.conclusion);
      
    } catch (err: any) {
      console.error('Error concluding LOG:', err);
      setError(err.response?.data?.error || 'Failed to conclude LOG');
    }
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return 'bg-yellow-50';
    if (position === 2) return 'bg-gray-50';
    if (position === 3) return 'bg-orange-50';
    return 'hover:bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Loading leaderboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Overall LOG Leaderboard</h1>
          <p className="text-gray-600 mt-2">Total points across all sports</p>
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

        {/* Conclusion Banner */}
        {conclusion?.is_concluded && (
          <div className="mb-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">🏆 LOG Concluded!</h2>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-sm text-gray-700">Champion:</span>
                    <div className="text-xl font-bold text-gray-900">{conclusion.champion_name}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-700">Runner-up:</span>
                    <div className="text-lg font-semibold text-gray-900">{conclusion.runner_up_name}</div>
                  </div>
                </div>
              </div>
              <div className="text-6xl">🏆</div>
            </div>
          </div>
        )}

        {/* Admin Actions */}
        {isAdmin && !conclusion?.is_concluded && standings.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <button
              onClick={handleConcludeLOG}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition shadow-md"
            >
              🏆 Conclude LOG & Declare Champion
            </button>
            <p className="text-sm text-gray-600 text-center mt-2">
              This will finalize standings and determine champion/runner-up
            </p>
          </div>
        )}

        {/* Leaderboard Table */}
        {standings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No data yet</h3>
            <p className="text-gray-500">Leaderboard will appear once matches are completed</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">House Standings</h2>
              <p className="text-blue-100 text-sm mt-1">
                {standings.length} house{standings.length !== 1 ? 's' : ''} competing
              </p>
            </div>

            {/* Standings Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      House
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Matches
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Won
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Draw
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Lost
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider bg-blue-50">
                      <div className="font-bold">Total Points</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {standings.map((standing, index) => {
                    const position = index + 1;
                    const medal = getMedalIcon(position);
                    
                    return (
                      <tr key={standing.house.id} className={`transition ${getPositionColor(position)}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-700">{position}</span>
                            {medal && <span className="text-2xl">{medal}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-lg text-gray-900">
                            {standing.house.house_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-gray-700">{standing.total_matches}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-green-600 font-semibold">{standing.total_wins}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-yellow-600 font-semibold">{standing.total_draws}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-red-600 font-semibold">{standing.total_losses}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center bg-blue-50">
                          <span className="text-2xl font-bold text-blue-600">
                            {standing.total_points}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Points:</span>
                  <span>Win = 3 pts</span>
                  <span>|</span>
                  <span>Draw = 1 pt</span>
                  <span>|</span>
                  <span>Loss = 0 pts</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
