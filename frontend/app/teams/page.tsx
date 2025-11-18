'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { Team, Sport, House } from '@/types';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    team_name: '',
    event_type: 'LOG',
    sport: '',
    house: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, sportsRes, housesRes] = await Promise.all([
        api.get('/api/teams/'),
        api.get('/api/sports/'),
        api.get('/api/houses/'),
      ]);
      setTeams(teamsRes.data);
      setSports(sportsRes.data);
      setHouses(housesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        team_name: formData.team_name,
        event_type: formData.event_type,
        sport: parseInt(formData.sport),
        house: formData.house ? parseInt(formData.house) : undefined,
      };
      await api.post('/api/teams/', payload);
      setShowForm(false);
      setFormData({ team_name: '', event_type: 'LOG', sport: '', house: '' });
      fetchData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.team_name?.[0] || 
                      error.response?.data?.detail ||
                      error.response?.data?.non_field_errors?.[0] ||
                      'Failed to create team';
      alert(errorMsg);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this team?')) {
      try {
        await api.delete(`/api/teams/${id}/`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete team:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            {showForm ? 'Cancel' : 'Add Team'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.team_name}
                  onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                >
                  <option value="LOG">LOG</option>
                  <option value="OLYMPIAD">OLYMPIAD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                >
                  <option value="">Select a sport</option>
                  {sports.map((sport) => (
                    <option key={sport.id} value={sport.id}>
                      {sport.sport_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  House (Optional)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.house}
                  onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                >
                  <option value="">No house</option>
                  {houses.map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.house_name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Create Team
              </button>
            </div>
          </form>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{team.team_name}</h2>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Sport:</span> {team.sport.sport_name}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Event Type:</span> {team.event_type}
              </p>
              {team.house && (
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">House:</span> {team.house.house_name}
                </p>
              )}
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Captain:</span> {team.captain.username}
              </p>
              <p className="text-gray-600 mb-4 text-sm">
                Created by: {team.created_by.username}
              </p>
              <button
                onClick={() => handleDelete(team.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No teams available. Add one to get started!</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
