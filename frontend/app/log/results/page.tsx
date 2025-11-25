'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Sport {
  id: number;
  sports_name: string;
}

interface House {
  id: number;
  house_name: string;
}

interface Match {
  id: number;
  sport: number;
  sport_name: string;
  house_a: number;
  house_a_name: string;
  house_b: number;
  house_b_name: string;
  house_a_score: string | null;
  house_b_score: string | null;
  winner: number | null;
  winner_name: string | null;
  is_draw: boolean;
  status: string;
  scheduled_date: string;
  venue: string;
}

interface SportResults {
  sport: Sport;
  matches: Match[];
}

interface SportWinner {
  id: number;
  sport: number;
  sport_name: string;
  winner: number | null;
  winner_name: string | null;
  is_tie: boolean;
  manually_set: boolean;
}

export default function ResultsPage() {
  const [results, setResults] = useState<SportResults[]>([]);
  const [sportWinners, setSportWinners] = useState<SportWinner[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSport, setSelectedSport] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchData();
    fetchHouses();
    checkAdmin();
  }, [selectedSport]);

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
      
      const url = selectedSport 
        ? `/api/log/results/?sport=${selectedSport}`
        : '/api/log/results/';
      
      const [resultsRes, winnersRes] = await Promise.all([
        api.get(url),
        api.get('/api/log/sport-winners/')
      ]);
      
      setResults(resultsRes.data);
      setSportWinners(winnersRes.data);
      
    } catch (err: any) {
      console.error('Error fetching results:', err);
      setError(err.response?.data?.error || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const fetchHouses = async () => {
    try {
      const response = await api.get('/api/houses/');
      setHouses(response.data);
    } catch (err) {
      console.error('Error fetching houses:', err);
    }
  };

  const handleSetSportWinner = async (sportId: number, winnerId: number) => {
    try {
      setError('');
      setSuccess('');
      
      await api.post(`/api/log/admin/sport-winners/${sportId}/`, { winner_id: winnerId });
      setSuccess('Sport winner set successfully');
      fetchData(); // Reload winners
      
    } catch (err: any) {
      console.error('Error setting sport winner:', err);
      setError(err.response?.data?.error || 'Failed to set sport winner');
    }
  };

  const getSportWinner = (sportId: number): SportWinner | undefined => {
    return sportWinners.find(sw => sw.sport === sportId);
  };

  const getResultBadge = (match: Match) => {
    if (match.is_draw) {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">Draw</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">{match.winner_name} Won</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Loading results...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Match Results & Sport Winners</h1>
          <p className="text-gray-600 mt-2">View completed match details and sport champions</p>
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

        {/* Filter */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Sport</label>
          <select
            value={selectedSport || ''}
            onChange={(e) => setSelectedSport(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sports</option>
            {results.map(r => (
              <option key={r.sport.id} value={r.sport.id}>{r.sport.sports_name}</option>
            ))}
          </select>
        </div>

        {/* Results by Sport */}
        {results.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No completed matches yet</h3>
            <p className="text-gray-500">Results will appear here once matches are completed</p>
          </div>
        ) : (
          <div className="space-y-8">
            {results.map((sportResult) => {
              const sportWinner = getSportWinner(sportResult.sport.id);
              
              return (
                <div key={sportResult.sport.id} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Sport Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">{sportResult.sport.sports_name}</h2>
                        <p className="text-blue-100 text-sm mt-1">
                          {sportResult.matches.length} completed match{sportResult.matches.length !== 1 ? 'es' : ''}
                        </p>
                      </div>
                      
                      {/* Sport Winner Badge */}
                      {sportWinner && (
                        <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg px-4 py-2">
                          {sportWinner.is_tie && !sportWinner.winner ? (
                            <div>
                              <div className="text-yellow-200 text-sm font-semibold">⚖️ Tie</div>
                              {isAdmin && (
                                <select
                                  onChange={(e) => handleSetSportWinner(sportResult.sport.id, parseInt(e.target.value))}
                                  className="mt-2 px-2 py-1 text-sm rounded bg-white text-gray-900"
                                  defaultValue=""
                                >
                                  <option value="" disabled>Select Winner</option>
                                  {houses.map(h => (
                                    <option key={h.id} value={h.id}>{h.house_name}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          ) : sportWinner.winner ? (
                            <div>
                              <div className="text-yellow-200 text-xs">🏆 Sport Champion</div>
                              <div className="text-white font-bold text-lg">{sportWinner.winner_name}</div>
                              {sportWinner.manually_set && <div className="text-yellow-200 text-xs">Manually set</div>}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Matches List */}
                  <div className="divide-y divide-gray-200">
                    {sportResult.matches.map((match) => (
                      <div key={match.id} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          {/* Match Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <span className="text-sm text-gray-500">{formatDate(match.scheduled_date)}</span>
                            <span className="text-sm text-gray-500">📍 {match.venue}</span>
                          </div>
                          
                          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                            {/* House A */}
                            <div className={`text-right ${match.winner === match.house_a ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                              <div className="text-lg">{match.house_a_name}</div>
                            </div>

                            {/* Score */}
                            <div className="px-6 py-3 bg-gray-100 rounded-lg text-center min-w-[180px]">
                              <div className="text-2xl font-bold text-gray-900">
                                {match.house_a_score} - {match.house_b_score}
                              </div>
                            </div>

                            {/* House B */}
                            <div className={`text-left ${match.winner === match.house_b ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                              <div className="text-lg">{match.house_b_name}</div>
                            </div>
                          </div>
                        </div>

                        {/* Result Badge */}
                        <div className="flex items-center justify-center md:justify-end">
                          {getResultBadge(match)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
