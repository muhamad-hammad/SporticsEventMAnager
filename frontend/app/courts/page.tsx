'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { Court } from '@/types';

export default function CourtsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Courts</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court) => (
            <div key={court.id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{court.court_name}</h2>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Location:</span> {court.location}
              </p>
              <p className="text-gray-600 mb-1">
                <span className="font-semibold">Hourly Rate:</span> ${court.hourly_rate}
              </p>
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">Status:</span>{' '}
                <span className={court.status ? 'text-green-600' : 'text-red-600'}>
                  {court.status ? 'Available' : 'Unavailable'}
                </span>
              </p>
            </div>
          ))}
        </div>

        {courts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No courts available at the moment.</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
