'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { Court } from '@/types';

export default function CourtsInfoPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      const response = await api.get('/api/courts/');
      setCourts(response.data);
    } catch (error) {
      console.error('Failed to fetch courts:', error);
    } finally {
      setLoading(false);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Courts</h1>
          <p className="text-gray-600">Browse all available courts and their details</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => (
            <div 
              key={court.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{court.court_name}</h2>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  court.status ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
                }`}>
                  {court.status ? '✓ Available' : '✗ Unavailable'}
                </span>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-start">
                  <span className="text-3xl mr-3">📍</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-lg font-semibold text-gray-800">{court.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-3xl mr-3">💰</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Hourly Rate</p>
                    <p className="text-2xl font-bold text-blue-600">${court.hourly_rate}</p>
                    <p className="text-sm text-gray-500">per hour</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="text-3xl mr-3">🎾</span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">Court ID</p>
                    <p className="text-lg font-semibold text-gray-800">#{court.id}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {courts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">No courts available at the moment.</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
