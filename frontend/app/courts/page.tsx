'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { Court } from '@/types';

interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showBookingOptions, setShowBookingOptions] = useState(false);

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedCourt, selectedDate]);

  const fetchCourts = async () => {
    try {
      const response = await api.get('/api/courts/');
      const availableCourts = response.data.filter((c: Court) => c.status);
      setCourts(availableCourts);
      if (availableCourts.length > 0) {
        setSelectedCourt(availableCourts[0]);
      }
    } catch (error: any) {
      console.error('Failed to fetch courts:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedCourt || !selectedDate) return;

    try {
      console.log('Fetching slots for court:', selectedCourt.id, 'date:', selectedDate);
      const response = await api.get(`/api/courts/${selectedCourt.id}/available-slots/?date=${selectedDate}`);
      console.log('Slots response:', response.data);
      setTimeSlots(response.data.slots || []);
    } catch (error: any) {
      console.error('Failed to fetch slots:', error);
      console.error('Error response:', error.response?.data);
      // Generate default slots if API fails
      const defaultSlots: TimeSlot[] = [];
      for (let hour = 0; hour < 24; hour++) {
        defaultSlots.push({
          start_time: `${String(hour).padStart(2, '0')}:00`,
          end_time: `${String(hour + 1).padStart(2, '0')}:00`,
          is_available: true
        });
      }
      setTimeSlots(defaultSlots);
    }
  };

  const handleBooking = async () => {
    if (!selectedCourt || !selectedDate || selectedTimeSlots.length === 0) {
      setMessage('Please select a court, date, and at least one time slot.');
      return;
    }

    // Sort selected time slots
    const sortedSlots = [...selectedTimeSlots].sort();

    // Check for gaps
    let hasGaps = false;
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const currentEnd = sortedSlots[i].split('-')[1];
      const nextStart = sortedSlots[i + 1].split('-')[0];
      if (currentEnd !== nextStart) {
        hasGaps = true;
        break;
      }
    }

    if (hasGaps) {
      // Show custom confirmation dialog (using window.confirm for simplicity, or a custom modal)
      // In a real app, use a nice Modal. Here we'll use a simple approach or a custom UI state.
      // Let's use a custom UI state to ask the user.
      setShowBookingOptions(true);
      return;
    }

    // If no gaps, proceed with normal range booking
    await processBooking('range');
  };

  const processBooking = async (type: 'range' | 'individual') => {
    setMessage('');
    setLoading(true);
    setShowBookingOptions(false);

    try {
      const sortedSlots = [...selectedTimeSlots].sort();

      if (type === 'range') {
        // Book from first start to last end
        const startTime = sortedSlots[0].split('-')[0];
        const endTime = sortedSlots[sortedSlots.length - 1].split('-')[1];

        const payload = {
          court: selectedCourt!.id,
          date: selectedDate,
          start_time: startTime,
          end_time: endTime,
        };

        const response = await api.post('/api/book-slot/', payload);
        setMessage(response.data.message || 'Booking confirmed successfully!');
      } else {
        // Book individual slots (grouped by continuity)
        const bookings = [];
        let currentStart = sortedSlots[0].split('-')[0];
        let currentEnd = sortedSlots[0].split('-')[1];

        for (let i = 1; i < sortedSlots.length; i++) {
          const slotStart = sortedSlots[i].split('-')[0];
          const slotEnd = sortedSlots[i].split('-')[1];

          if (slotStart === currentEnd) {
            // Continuous
            currentEnd = slotEnd;
          } else {
            // Gap found, push previous block
            bookings.push({ start_time: currentStart, end_time: currentEnd });
            currentStart = slotStart;
            currentEnd = slotEnd;
          }
        }
        // Push last block
        bookings.push({ start_time: currentStart, end_time: currentEnd });

        const payload = {
          court: selectedCourt!.id,
          date: selectedDate,
          bookings: bookings
        };

        const response = await api.post('/api/book-slots-bulk/', payload);
        setMessage(response.data.message || 'Bookings confirmed successfully!');
      }

      setSelectedTimeSlots([]);
      fetchAvailableSlots(); // Refresh slots
    } catch (error: any) {
      const errorMsg = error.response?.data?.error ||
        error.response?.data?.detail ||
        'Failed to create booking. Please try again.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = today.toISOString().split('T')[0] === dateStr;
      const isSelected = selectedDate === dateStr;
      const isPast = new Date(dateStr) < new Date(today.toISOString().split('T')[0]);

      days.push(
        <button
          key={day}
          onClick={() => !isPast && setSelectedDate(dateStr)}
          disabled={isPast}
          className={`p-2 text-center rounded transition-colors ${isPast ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
            isSelected ? 'bg-blue-500 text-white font-bold' :
              isToday ? 'bg-blue-100 text-blue-700 font-semibold' :
                'hover:bg-gray-100'
            }`}
        >
          {String(day).padStart(2, '0')}
        </button>
      );
    }

    return days;
  };

  const toggleTimeSlot = (slot: TimeSlot) => {
    if (!slot.is_available) return;

    const slotKey = `${slot.start_time}-${slot.end_time}`;
    if (selectedTimeSlots.includes(slotKey)) {
      setSelectedTimeSlots(selectedTimeSlots.filter(s => s !== slotKey));
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, slotKey]);
    }
  };

  const changeMonth = (increment: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Book a Court</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Date Selector */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select the Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Court Selection */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Select an Available Court</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {courts.map((court) => (
                  <button
                    key={court.id}
                    onClick={() => setSelectedCourt(court)}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors ${selectedCourt?.id === court.id
                      ? 'bg-orange-400 text-white font-semibold'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                  >
                    {court.court_name} ({court.location})
                  </button>
                ))}
              </div>
            </div>

            {/* Court Description */}
            {selectedCourt && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Court Description</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Location:</strong> {selectedCourt.location}</p>
                  <p><strong>Rate:</strong> ${selectedCourt.hourly_rate}/hour</p>
                  <p><strong>Status:</strong> <span className="text-green-600">Available</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedCourt?.court_name || 'Select a Court'}
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    ←
                  </button>
                  <span className="font-semibold">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => changeMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 p-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </div>

            {/* Time Slots */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Select Booking Time</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => toggleTimeSlot(slot)}
                    disabled={!slot.is_available}
                    className={`p-2 text-xs rounded transition-colors ${!slot.is_available
                      ? 'bg-red-500 text-white cursor-not-allowed opacity-50'
                      : selectedTimeSlots.includes(`${slot.start_time}-${slot.end_time}`)
                        ? 'bg-green-500 text-white font-bold'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                  >
                    {slot.start_time}
                  </button>
                ))}
              </div>
            </div>

            {/* Message and Booking Button */}
            {message && (
              <div className={`p-4 rounded-lg ${message.includes('confirmed') || message.includes('success')
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
                }`}>
                {message}
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={loading || selectedTimeSlots.length === 0}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : `Book Court (${selectedTimeSlots.length} slot${selectedTimeSlots.length !== 1 ? 's' : ''} selected)`}
            </button>
          </div>
        </div>

        {/* Booking Options Modal */}
        {showBookingOptions && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full transform transition-all animate-[fadeIn_0.3s_ease-out] scale-100">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Booking Options</h3>
              <p className="mb-6 text-gray-600">
                You have selected non-continuous time slots. How would you like to book?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => processBooking('range')}
                  className="w-full p-4 border-2 border-blue-100 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all duration-200 text-left group"
                >
                  <div className="font-bold text-lg mb-1">Book Range</div>
                  <div className="text-sm text-blue-600/80 group-hover:text-blue-700">Book everything from start to end (including unselected slots)</div>
                </button>

                <button
                  onClick={() => processBooking('individual')}
                  className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 text-left shadow-lg hover:shadow-blue-500/30"
                >
                  <div className="font-bold text-lg mb-1">Book Selected Only</div>
                  <div className="text-sm text-blue-100">Book only the specific slots you selected</div>
                </button>

                <button
                  onClick={() => setShowBookingOptions(false)}
                  className="w-full p-2 text-gray-500 hover:text-gray-800 text-sm mt-2 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
