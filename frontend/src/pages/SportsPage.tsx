import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { sportsApi } from '../services/sporticsApi';
import { Sport } from '../types';

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      setLoading(true);
      const response = await sportsApi.getAll();
      setSports(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch sports. Make sure the backend is running.');
      console.error('Error fetching sports:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
                ← Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">Sports Management</h1>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              + Add Sport
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading sports...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && sports.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">No sports found. Add your first sport!</p>
          </div>
        )}

        {!loading && !error && sports.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sports.map((sport) => (
              <div key={sport.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{sport.sport_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    sport.event_type === 'LOG' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {sport.event_type}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="text-sm">
                    {sport.team_based ? '👥 Team Based' : '👤 Individual'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
