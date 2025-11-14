import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Plus, ArrowLeft, Users, User, Zap, Target, Award } from 'lucide-react';
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

  const sportIcons = [
    '⚽', '🏀', '🏐', '🏈', '⚾', '🎾', 
    '🏓', '🏸', '🏑', '🏏', '🥊', '🤺',
    '🏊', '🏃', '🚴', '🤸', '🧗', '🎯'
  ];

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        @keyframes shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .sport-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sport-card:hover {
          transform: translateY(-12px) scale(1.03);
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
        }

        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .shine-effect {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 200% 100%;
          animation: shine 3s infinite;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 50%, #6a11cb 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background elements */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.2 }}>
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                filter: 'blur(40px)',
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            ></div>
          ))}
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
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm relative">
                      <Trophy className="w-8 h-8 text-white" />
                      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 rounded-xl transition-opacity"></div>
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-black text-white">Sports</h1>
                      <p className="text-white text-opacity-80 text-sm">Manage LOG & OLYMPIAD events</p>
                    </div>
                  </div>
                </div>
                <button 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                    color: '#fc466b',
                  }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Sport</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block relative">
                  <div className="w-20 h-20 relative">
                    <Trophy className="w-20 h-20 text-white animate-pulse" />
                    <div 
                      className="pulse-ring absolute inset-0 border-4 border-white rounded-full"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.5)' }}
                    ></div>
                  </div>
                </div>
                <p className="mt-6 text-white text-lg font-medium">Loading sports events...</p>
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
                      <h3 className="text-white font-semibold mb-1">Error Loading Sports</h3>
                      <p className="text-white text-opacity-90 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && sports.length === 0 && (
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
                    <Trophy className="w-20 h-20 text-white opacity-50" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No Sports Yet</h3>
                  <p className="text-white text-opacity-80 mb-6">
                    Start building your sports program by adding your first event!
                  </p>
                  <button 
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                      color: '#fc466b',
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Your First Sport</span>
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && sports.length > 0 && (
              <>
                {/* Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '1rem',
                    padding: '1.5rem',
                  }}>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                        <Trophy className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">{sports.length}</div>
                        <div className="text-white text-opacity-80 text-sm">Total Sports</div>
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
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">
                          {sports.filter(s => s.event_type === 'LOG').length}
                        </div>
                        <div className="text-white text-opacity-80 text-sm">LOG Events</div>
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
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-white">
                          {sports.filter(s => s.event_type === 'OLYMPIAD').length}
                        </div>
                        <div className="text-white text-opacity-80 text-sm">OLYMPIAD Events</div>
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
                          {sports.filter(s => s.team_based).length}
                        </div>
                        <div className="text-white text-opacity-80 text-sm">Team Sports</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sports Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sports.map((sport, index) => {
                    const icon = sportIcons[index % sportIcons.length];
                    const isLog = sport.event_type === 'LOG';
                    
                    return (
                      <div
                        key={sport.id}
                        className="sport-card"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '1.5rem',
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        {/* Shine effect overlay */}
                        <div 
                          className="shine-effect absolute inset-0 pointer-events-none"
                          style={{ zIndex: 1 }}
                        ></div>

                        {/* Card Content */}
                        <div className="relative z-10">
                          {/* Header */}
                          <div className="p-6 pb-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="text-4xl p-3 rounded-xl"
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                  }}
                                >
                                  {icon}
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-white mb-1">
                                    {sport.sport_name}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    {sport.team_based ? (
                                      <span className="inline-flex items-center gap-1 text-xs text-white text-opacity-80">
                                        <Users className="w-3 h-3" />
                                        Team Sport
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-xs text-white text-opacity-80">
                                        <User className="w-3 h-3" />
                                        Individual
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Event Type Badge */}
                            <div className="flex items-center gap-2">
                              <span 
                                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
                                  isLog
                                    ? 'bg-green-500 bg-opacity-20 text-green-100 border border-green-400 border-opacity-30'
                                    : 'bg-purple-500 bg-opacity-20 text-purple-100 border border-purple-400 border-opacity-30'
                                }`}
                              >
                                {isLog ? (
                                  <Zap className="w-4 h-4" />
                                ) : (
                                  <Award className="w-4 h-4" />
                                )}
                                {sport.event_type}
                              </span>
                            </div>
                          </div>

                          {/* Footer */}
                          <div 
                            className="px-6 py-4 border-t"
                            style={{
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              background: 'rgba(0, 0, 0, 0.1)',
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white text-opacity-60 text-sm">
                                ID: #{sport.id}
                              </span>
                              <button 
                                className="text-white text-sm font-semibold hover:text-opacity-80 transition-all flex items-center gap-1 group"
                              >
                                <span>View Details</span>
                                <Target className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Decorative corner */}
                        <div 
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)',
                            borderRadius: '0 1.5rem 0 100%',
                            pointerEvents: 'none',
                          }}
                        ></div>
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