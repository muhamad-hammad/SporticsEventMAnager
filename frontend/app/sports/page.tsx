'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { Sport } from '@/types';

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sport_name: '',
    event_type: 'LOG',
    team_based: true,
  });

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      const response = await api.get('/api/sports/');
      setSports(response.data);
    } catch (error) {
      console.error('Failed to fetch sports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/sports/', formData);
      setShowForm(false);
      setFormData({ sport_name: '', event_type: 'LOG', team_based: true });
      fetchSports();
    } catch (error) {
      console.error('Failed to create sport:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this sport?')) {
      try {
        await api.delete(`/api/sports/${id}/`);
        fetchSports();
      } catch (error) {
        console.error('Failed to delete sport:', error);
      }
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Sports</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            {showForm ? 'Cancel' : 'Add Sport'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.sport_name}
                  onChange={(e) => setFormData({ ...formData, sport_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value as 'LOG' | 'OLYMPIAD' })}
                >
                  <option value="LOG">LOG</option>
                  <option value="OLYMPIAD">OLYMPIAD</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="team_based"
                  className="mr-2"
                  checked={formData.team_based}
                  onChange={(e) => setFormData({ ...formData, team_based: e.target.checked })}
                />
                <label htmlFor="team_based" className="text-sm font-medium text-gray-700">
                  Team Based
                </label>
              </div>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Create Sport
              </button>
            </div>
          </form>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sport) => (
            <div key={sport.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{sport.sport_name}</h2>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Event Type:</span> {sport.event_type}
              </p>
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">Team Based:</span> {sport.team_based ? 'Yes' : 'No'}
              </p>
              <button
                onClick={() => handleDelete(sport.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {sports.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No sports available. Add one to get started!</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
