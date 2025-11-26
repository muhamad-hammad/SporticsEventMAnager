'use client';

import { useState, useEffect } from 'react';
import AdminRoute from '@/components/AdminRoute';
import AdminNavbar from '@/components/AdminNavbar';
import api from '@/lib/api';

export default function OlympiadSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [registrationOpen, setRegistrationOpen] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/api/olympiad/settings/');
            setRegistrationOpen(res.data.registration_open);
        } catch (err) {
            console.error('Failed to fetch settings', err);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleRegistration = async () => {
        setToggling(true);
        setError('');
        setSuccessMessage('');
        
        try {
            const res = await api.post('/api/olympiad/admin/toggle-registration/');
            setRegistrationOpen(res.data.registration_open);
            setSuccessMessage(res.data.detail);
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            console.error('Failed to toggle registration', err);
            setError(err.response?.data?.detail || 'Failed to update settings');
        } finally {
            setToggling(false);
        }
    };

    return (
        <AdminRoute>
            <div className="min-h-screen bg-gray-50 font-sans">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Olympiad Settings</h1>
                        <p className="text-gray-600">Manage team registration and module settings</p>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                            {successMessage}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Loading settings...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            
                            {/* Registration Control Card */}
                            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Team Registration</h2>
                                        <p className="text-gray-600 mb-6">
                                            Control whether users can register new teams for the Olympiad. When closed, 
                                            users will see a message that registration is currently unavailable.
                                        </p>
                                        
                                        {/* Current Status */}
                                        <div className="mb-6">
                                            <span className="text-sm font-semibold text-gray-700 mr-2">Current Status:</span>
                                            <span className={`px-4 py-2 rounded-full font-bold text-sm ${
                                                registrationOpen 
                                                    ? 'bg-green-100 text-green-800 border border-green-300' 
                                                    : 'bg-red-100 text-red-800 border border-red-300'
                                            }`}>
                                                {registrationOpen ? '✅ OPEN' : '🚫 CLOSED'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Toggle Button */}
                                <button
                                    onClick={handleToggleRegistration}
                                    disabled={toggling}
                                    className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all duration-200 ${
                                        registrationOpen
                                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                            : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                    } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-opacity-50`}
                                >
                                    {toggling ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Updating...
                                        </span>
                                    ) : (
                                        registrationOpen ? '🔒 Close Team Registration' : '🔓 Open Team Registration'
                                    )}
                                </button>

                                {/* Info Box */}
                                <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                    <p className="text-sm text-blue-900">
                                        <strong>ℹ️ Note:</strong> Closing registration will prevent new team registrations. 
                                        Existing teams and their statuses will not be affected.
                                    </p>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </AdminRoute>
    );
}
