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
  house_a_score: number | null;
  house_b_score: number | null;
  winner: number | null;
  winner_name: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  venue: string;
}

export default function SchedulePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filterSport, setFilterSport] = useState('');
  const [filterHouse, setFilterHouse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // View mode
  const [viewMode, setViewMode] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterMatches();
  }, [filterSport, filterHouse, filterStatus, viewMode]);

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
      
      // Fetch all matches
      await filterMatches();
      
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const filterMatches = async () => {
    try {
      const params = new URLSearchParams();
      
      if (filterSport) params.append('sport', filterSport);
      if (filterHouse) params.append('house', filterHouse);
      
      // Map view mode to status filter
      if (viewMode === 'upcoming') {
        params.append('status', 'scheduled');
      } else if (viewMode === 'completed') {
        params.append('status', 'completed');
      } else if (filterStatus) {
        params.append('status', filterStatus);
      }
      
      const matchesRes = await api.get(`/api/log/schedule/?${params.toString()}`);
      setMatches(matchesRes.data);
      
    } catch (err: any) {
      console.error('Error filtering matches:', err);
      setError(err.response?.data?.error || 'Failed to filter matches');
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    let relativeTime = '';
    if (diffDays === 0) relativeTime = 'Today';
    else if (diffDays === 1) relativeTime = 'Tomorrow';
    else if (diffDays > 1 && diffDays < 7) relativeTime = `In ${diffDays} days`;
    else if (diffDays < 0) relativeTime = 'Past';
    
    return { formattedDate, formattedTime, relativeTime };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Loading schedule...</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Match Schedule</h1>
          <p className="text-gray-600 mt-2">View all LOG matches and results</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setViewMode('all')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              viewMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Matches
          </button>
          <button
            onClick={() => setViewMode('upcoming')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              viewMode === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setViewMode('completed')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              viewMode === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Results
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches found</h3>
            <p className="text-gray-500">
              {viewMode === 'upcoming' && 'No upcoming matches scheduled'}
              {viewMode === 'completed' && 'No completed matches yet'}
              {viewMode === 'all' && 'No matches have been created'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group by sport */}
            {sports
              .filter(sport => matches.some(m => m.sport === sport.id))
              .map(sport => {
                const sportMatches = matches.filter(m => m.sport === sport.id);
                return (
                  <div key={sport.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                      <h2 className="text-xl font-bold text-white">{sport.sports_name}</h2>
                      <p className="text-blue-100 text-sm">{sportMatches.length} match{sportMatches.length !== 1 ? 'es' : ''}</p>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {sportMatches.map(match => {
                        const { formattedDate, formattedTime, relativeTime } = formatDate(match.scheduled_date);
                        return (
                          <div key={match.id} className="p-6 hover:bg-gray-50 transition">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                              {/* Teams and Score */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex-1">
                                    <div className={`text-lg font-semibold ${
                                      match.winner === match.house_a ? 'text-green-600' : 'text-gray-900'
                                    }`}>
                                      {match.house_a_name}
                                    </div>
                                  </div>
                                  <div className="text-2xl font-bold mx-6">
                                    {match.house_a_score !== null ? match.house_a_score : '-'}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className={`text-lg font-semibold ${
                                      match.winner === match.house_b ? 'text-green-600' : 'text-gray-900'
                                    }`}>
                                      {match.house_b_name}
                                    </div>
                                  </div>
                                  <div className="text-2xl font-bold mx-6">
                                    {match.house_b_score !== null ? match.house_b_score : '-'}
                                  </div>
                                </div>
                                
                                {match.winner_name && (
                                  <div className="mt-3 text-sm font-medium text-green-600">
                                    🏆 Winner: {match.winner_name}
                                  </div>
                                )}
                                {match.winner === null && match.status === 'completed' && (
                                  <div className="mt-3 text-sm font-medium text-gray-600">
                                    🤝 Match Drawn
                                  </div>
                                )}
                              </div>
                              
                              {/* Match Info */}
                              <div className="md:text-right space-y-2">
                                <div className="flex md:justify-end">
                                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(match.status)}`}>
                                    {match.status.replace('_', ' ').toUpperCase()}
                                  </span>
                                </div>
                                
                                <div className="text-sm text-gray-600">
                                  <div className="font-medium">{formattedDate}</div>
                                  <div>{formattedTime}</div>
                                  {relativeTime && match.status === 'scheduled' && (
                                    <div className="text-blue-600 font-semibold mt-1">{relativeTime}</div>
                                  )}
                                </div>
                                
                                <div className="text-sm text-gray-500">
                                  📍 {match.venue}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Stats Summary */}
        {matches.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{matches.length}</div>
                <div className="text-sm text-gray-600">Total Matches</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">
                  {matches.filter(m => m.status === 'scheduled').length}
                </div>
                <div className="text-sm text-gray-600">Scheduled</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {matches.filter(m => m.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {matches.filter(m => m.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
