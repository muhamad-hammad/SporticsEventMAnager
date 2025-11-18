'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { Sport } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function PlayerRegistrationPage() {
  const { user } = useAuth();
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isPlayer, setIsPlayer] = useState(false);
  const [selectedSport, setSelectedSport] = useState('');

  useEffect(() => {
    fetchSports();
    checkPlayerStatus();
  }, []);

  const fetchSports = async () => {
    try {
      const response = await api.get('/api/sports/');
      setSports(response.data);
    } catch (error) {
      console.error('Failed to fetch sports:', error);
    }
  };

  const checkPlayerStatus = () => {
    // Check if user is already registered as a player
    // This is a simplified check - you might want to add an API endpoint for this
    setIsPlayer(user?.role === 'player' || user?.role === 'captain');
  };

  const handleRegisterAsPlayer = async () => {
    setMessage('');
    setLoading(true);

    try {
      await api.post('/api/player/register/');
      setMessage('Successfully registered as a player!');
      setIsPlayer(true);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.detail ||
                      'Failed to register as player. You may already be registered.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSport = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      await api.post('/api/register-sport/', {
        sport_id: parseInt(selectedSport),
      });
      setMessage('Successfully registered for the sport!');
      setSelectedSport('');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.detail ||
                      'Failed to register for sport. You may already be registered.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Player Registration</h1>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Register as Player */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Step 1: Register as Player</h2>
            {message && (
              <div className={`mb-4 p-4 rounded ${
                message.includes('Successfully') 
                  ? 'bg-green-100 border border-green-400 text-green-700' 
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {!isPlayer ? (
              <>
                <p className="text-gray-600 mb-4">
                  You need to register as a player before you can register for sports.
                </p>
                <button
                  onClick={handleRegisterAsPlayer}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register as Player'}
                </button>
              </>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-700">✓ You are registered as a player!</p>
              </div>
            )}
          </div>

          {/* Register for Sports */}
          {isPlayer && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Step 2: Register for Sports</h2>
              
              <form onSubmit={handleRegisterSport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select a Sport
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                  >
                    <option value="">Choose a sport</option>
                    {sports.map((sport) => (
                      <option key={sport.id} value={sport.id}>
                        {sport.sport_name} ({sport.event_type}) - {sport.team_based ? 'Team' : 'Individual'}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedSport}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Registering...' : 'Register for Sport'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Your sport registration will need to be approved by an admin before you can participate.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
