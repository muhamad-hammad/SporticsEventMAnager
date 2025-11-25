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

export default function LeaderboardPage() {
  const [standings, setStandings] = useState<OverallStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/api/log/leaderboard/');
      setStandings(response.data);
      
    } catch (err: any) {
      console.error('Error fetching leaderboard:', err);
      setError(err.response?.data?.error || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 2: return 'bg-gray-50 border-l-4 border-gray-400';
      case 3: return 'bg-orange-50 border-l-4 border-orange-500';
      default: return 'hover:bg-gray-50';
    }
  };

  const calculateWinRate = (wins: number, matchesPlayed: number) => {
    if (matchesPlayed === 0) return 0;
    return ((wins / matchesPlayed) * 100).toFixed(1);
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">LOG Leaderboard</h1>
          <p className="text-gray-600 mt-2">Track house standings across all sports</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => {
              setViewMode('all');
              setSelectedSport(null);
              fetchLeaderboard();
            }}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              viewMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Sports
          </button>
          
          {leaderboards.length > 0 && leaderboards.map(lb => (
            <button
              key={lb.sport.id}
              onClick={() => fetchSportLeaderboard(lb.sport.id)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                selectedSport === lb.sport.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {lb.sport.sports_name}
            </button>
          ))}
        </div>

        {/* Leaderboard Tables */}
        {leaderboards.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No data yet</h3>
            <p className="text-gray-500">Leaderboard will appear once matches are completed</p>
          </div>
        ) : (
          <div className="space-y-8">
            {leaderboards.map(sportLeaderboard => (
              <div key={sportLeaderboard.sport.id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Sport Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white">{sportLeaderboard.sport.sports_name}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {sportLeaderboard.standings.length} house{sportLeaderboard.standings.length !== 1 ? 's' : ''} competing
                  </p>
                </div>

                {/* Standings Table */}
                {sportLeaderboard.standings.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No matches completed for this sport yet
                  </div>
                ) : (
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
                            Played
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
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            GF
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            GA
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            GD
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Win %
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider bg-blue-50">
                            Points
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sportLeaderboard.standings.map((entry, index) => {
                          const position = index + 1;
                          const medal = getMedalIcon(position);
                          const winRate = calculateWinRate(entry.wins, entry.matches_played);
                          
                          return (
                            <tr key={entry.id} className={`transition ${getPositionColor(position)}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-gray-700">{position}</span>
                                  {medal && <span className="text-xl">{medal}</span>}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-gray-900">{entry.house_name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                {entry.matches_played}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-green-600">
                                {entry.wins}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                                {entry.draws}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-red-600">
                                {entry.losses}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                {entry.goals_for}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                                {entry.goals_against}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                <span className={`font-medium ${
                                  entry.goal_difference > 0 ? 'text-green-600' :
                                  entry.goal_difference < 0 ? 'text-red-600' :
                                  'text-gray-600'
                                }`}>
                                  {entry.goal_difference > 0 ? '+' : ''}{entry.goal_difference}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                                {winRate}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center bg-blue-50">
                                <span className="text-lg font-bold text-blue-700">{entry.points}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Legend */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                    <div><span className="font-semibold">GF:</span> Goals For</div>
                    <div><span className="font-semibold">GA:</span> Goals Against</div>
                    <div><span className="font-semibold">GD:</span> Goal Difference</div>
                    <div><span className="font-semibold">Points:</span> Win = 3, Draw = 1, Loss = 0</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Overall Summary (only in "all sports" view) */}
        {viewMode === 'all' && leaderboards.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Statistics</h3>
            
            {(() => {
              // Calculate overall stats
              const houseStats = new Map<string, {
                totalPoints: number;
                totalWins: number;
                totalMatches: number;
              }>();
              
              leaderboards.forEach(sportLb => {
                sportLb.standings.forEach(entry => {
                  const existing = houseStats.get(entry.house_name) || { totalPoints: 0, totalWins: 0, totalMatches: 0 };
                  houseStats.set(entry.house_name, {
                    totalPoints: existing.totalPoints + entry.points,
                    totalWins: existing.totalWins + entry.wins,
                    totalMatches: existing.totalMatches + entry.matches_played
                  });
                });
              });
              
              const sortedHouses = Array.from(houseStats.entries())
                .sort((a, b) => b[1].totalPoints - a[1].totalPoints);
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sortedHouses.map(([houseName, stats], index) => (
                    <div key={houseName} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{getMedalIcon(index + 1)}</span>
                        <span className="text-xs font-semibold text-gray-500">#{index + 1}</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900 mb-1">{houseName}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Points:</span>
                          <span className="font-bold text-blue-700">{stats.totalPoints}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Wins:</span>
                          <span className="font-semibold text-green-600">{stats.totalWins}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Matches:</span>
                          <span className="font-medium text-gray-700">{stats.totalMatches}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ How Points Work</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Win:</strong> 3 points</li>
            <li>• <strong>Draw:</strong> 1 point</li>
            <li>• <strong>Loss:</strong> 0 points</li>
            <li>• <strong>Tiebreaker:</strong> Goal difference, then goals scored</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
