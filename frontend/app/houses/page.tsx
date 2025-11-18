'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { House } from '@/types';

export default function HousesPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    house_name: '',
    status: 'pending',
  });

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      const response = await api.get('/api/houses/');
      setHouses(response.data);
    } catch (error) {
      console.error('Failed to fetch houses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/houses/', formData);
      setShowForm(false);
      setFormData({ house_name: '', status: 'pending' });
      fetchHouses();
    } catch (error) {
      console.error('Failed to create house:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this house?')) {
      try {
        await api.delete(`/api/houses/${id}/`);
        fetchHouses();
      } catch (error) {
        console.error('Failed to delete house:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Houses</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            {showForm ? 'Cancel' : 'Add House'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  House Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.house_name}
                  onChange={(e) => setFormData({ ...formData, house_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
              >
                Create House
              </button>
            </div>
          </form>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house) => (
            <div key={house.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{house.house_name}</h2>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Captain:</span>{' '}
                {house.captain?.username || 'Not assigned'}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Status:</span>{' '}
                <span className={`capitalize ${
                  house.status === 'active' ? 'text-green-600' :
                  house.status === 'inactive' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {house.status}
                </span>
              </p>
              <p className="text-gray-600 mb-4 text-sm">
                Created: {new Date(house.created_at).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleDelete(house.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {houses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No houses available. Add one to get started!</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
