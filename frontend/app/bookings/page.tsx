'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { Booking } from '@/types';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/my-bookings/');
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>
        
        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">No bookings yet.</p>
            <p className="text-gray-500 mt-2">Book a court to see your reservations here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {booking.court_details?.court_name || `Court ${booking.court}`}
                      </h3>
                      <span className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${
                        booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                        booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <span className="text-xl mr-2">📍</span>
                          <span className="font-medium">
                            {booking.court_details?.location || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <span className="text-xl mr-2">📅</span>
                          <span className="font-medium">
                            {new Date(booking.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <span className="text-xl mr-2">🕐</span>
                          <span className="font-medium">
                            {booking.start_time} - {booking.end_time}
                          </span>
                        </div>
                        
                        {booking.total_cost && (
                          <div className="flex items-center text-gray-700">
                            <span className="text-xl mr-2">💰</span>
                            <span className="font-bold text-blue-600 text-lg">
                              ${booking.total_cost}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              (${booking.court_details?.hourly_rate}/hr)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
