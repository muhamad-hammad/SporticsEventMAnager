'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { Court, Booking } from '@/types';

export default function BookingsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    court: '',
    date: '',
    start_time: '',
    end_time: '',
  });

  useEffect(() => {
    fetchCourts();
    fetchBookings();
  }, []);

  const fetchCourts = async () => {
    try {
      console.log('Fetching courts...');
      const response = await api.get('/api/courts/');
      console.log('Courts response:', response.data);
      setCourts(response.data.filter((c: Court) => c.status));
    } catch (error: any) {
      console.error('Failed to fetch courts:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const fetchBookings = async () => {
    try {
      console.log('Fetching bookings...');
      const response = await api.get('/api/my-bookings/');
      console.log('Bookings response:', response.data);
      // Ensure we always set an array
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      console.error('Error details:', error.response?.data);
      setBookings([]); // Set empty array on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const payload = {
        court: parseInt(formData.court),
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
      };
      console.log('Sending booking payload:', payload);
      const response = await api.post('/api/book-slot/', payload);
      console.log('Booking response:', response.data);
      setMessage(response.data.message || 'Booking confirmed successfully!');
      setFormData({ court: '', date: '', start_time: '', end_time: '' });
      fetchBookings(); // Refresh bookings list
    } catch (error: any) {
      console.error('Booking error:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.non_field_errors?.[0] ||
                      error.response?.data?.error || 
                      error.response?.data?.detail ||
                      JSON.stringify(error.response?.data) ||
                      'Failed to create booking. Please try again.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Book a Court</h1>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          {message && (
            <div className={`mb-4 p-4 rounded ${
              message.includes('confirmed') || message.includes('success') || message.includes('submitted')
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Court
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.court}
                onChange={(e) => setFormData({ ...formData, court: e.target.value })}
              >
                <option value="">Choose a court</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.court_name} - {court.location} (${court.hourly_rate}/hr)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Booking...' : 'Book Court'}
            </button>
          </form>
        </div>

        {/* My Bookings */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Bookings</h2>
          {bookings.length === 0 ? (
            <p className="text-gray-600">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {booking.court_details?.court_name || `Court ${booking.court}`}
                      </h3>
                      <p className="text-gray-600">
                        📅 {new Date(booking.date).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">
                        🕐 {booking.start_time} - {booking.end_time}
                      </p>
                      {booking.court_details && (
                        <p className="text-sm text-gray-500">
                          📍 {booking.court_details.location} | ${booking.court_details.hourly_rate}/hr
                        </p>
                      )}
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                        booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
