import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Sportics Event Manager
          </h1>
          <p className="text-xl text-gray-600">
            Manage your sports events, houses, and teams efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Link
            to="/sports"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="text-4xl mb-4">⚽</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Sports</h2>
            <p className="text-gray-600">
              View and manage all sports events (LOG & OLYMPIAD)
            </p>
          </Link>

          <Link
            to="/houses"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="text-4xl mb-4">🏠</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Houses</h2>
            <p className="text-gray-600">
              Manage houses and their captains
            </p>
          </Link>

          <Link
            to="/teams"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Teams</h2>
            <p className="text-gray-600">
              View and organize team registrations
            </p>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              Backend API connected at http://127.0.0.1:8000/
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
