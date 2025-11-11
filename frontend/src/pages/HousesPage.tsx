import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Plus, ArrowLeft, Users, Crown, Sparkles } from 'lucide-react';
import { housesApi } from '../services/sporticsApi';
import { House } from '../types';

export default function HousesPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHouses();
  }, []);

  const fetchHouses = async () => {
    try {
      setLoading(true);
      const response = await housesApi.getAll();
      setHouses(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch houses. Make sure the backend is running.');
      console.error('Error fetching houses:', err);
    } finally {
      setLoading(false);
    }
  };

  const houseColors = [
    { bg: 'from-red-500 to-pink-500', light: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    { bg: 'from-blue-500 to-indigo-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    { bg: 'from-green-500 to-emerald-500', light: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    { bg: 'from-yellow-500 to-orange-500', light: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    { bg: 'from-purple-500 to-pink-500', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    { bg: 'from-teal-500 to-cyan-500', light: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  ];

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .house-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .house-card:hover {
          transform: translateY(-8px) scale(1.02);
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
        }

        .shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background elements */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.3 }}>
          <div style={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-5%',
            width: '400px',
            height: '400px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}></div>
        </div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          {/* Header */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <div className="container mx-auto px-4 sm:px-6 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 text-white hover:text-gray-200 mb-3 transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Home</span>
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-black text-white">Houses</h1>
                      <p className="text-white text-opacity-80 text-sm">Manage your house system</p>
                    </div>
                  </div>
                </div>
                <button 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                    color: '#667eea',
                  }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Add House</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block relative">
                  <div className="w-16 h-16 border-4 border-white border-opacity-30 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="mt-6 text-white text-lg font-medium">Loading houses...</p>
              </div>
            )}

            {error && (
              <div className="max-w-2xl mx-auto">
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">
                      !
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Error Loading Houses</h3>
                      <p className="text-white text-opacity-90 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && houses.length === 0 && (
              <div className="max-w-2xl mx-auto">
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '1.5rem',
                  padding: '4rem 2rem',
                  textAlign: 'center',
                }}>
                  <div className="float-animation inline-block mb-6">
                    <Home className="w-20 h-20 text-white opacity-50" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No Houses Yet</h3>
                  <p className="text-white text-opacity-80 mb-6">
                    Get started by adding your first house to the system!
                  </p>
                  <button 
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                      color: '#667eea',
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Your First House</span>
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && houses.length > 0 && (
              <>
                {/* Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                        <Home className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">{houses.length}</div>
                        <div className="text-white text-opacity-80 text-sm">Total Houses</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">
                          {houses.filter(h => h.status === 'active').length}
                        </div>
                        <div className="text-white text-opacity-80 text-sm">Active Houses</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">
                          {houses.filter(h => h.captain).length}
                        </div>
                        <div className="text-white text-opacity-80 text-sm">With Captains</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Houses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {houses.map((house, index) => {
                    const colorScheme = houseColors[index % houseColors.length];
                    return (
                      <div
                        key={house.id}
                        className="house-card"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '1.5rem',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Card Header with Gradient */}
                        <div 
                          className={`bg-gradient-to-r ${colorScheme.bg} p-6 relative overflow-hidden`}
                        >
                          <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-20%',
                            width: '200px',
                            height: '200px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            filter: 'blur(40px)',
                          }}></div>
                          
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                                <Home className="w-8 h-8 text-white" />
                              </div>
                              <h3 className="text-2xl font-bold text-white">{house.house_name}</h3>
                            </div>
                            <Sparkles className="w-6 h-6 text-white opacity-50" />
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              house.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {house.status?.toUpperCase() || 'UNKNOWN'}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-white text-opacity-90">
                              <Crown className="w-5 h-5 text-yellow-300" />
                              <div>
                                <div className="text-xs text-white text-opacity-60 font-medium">Captain</div>
                                <div className="font-semibold">
                                  {house.captain || 'Not assigned'}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-white text-opacity-90">
                              <Users className="w-5 h-5 text-blue-300" />
                              <div>
                                <div className="text-xs text-white text-opacity-60 font-medium">House ID</div>
                                <div className="font-semibold">#{house.id}</div>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button 
                            className="w-full mt-6 px-4 py-3 rounded-xl font-semibold transition-all"
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: 'white',
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}