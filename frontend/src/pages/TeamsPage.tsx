import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, ArrowLeft, Trophy, Home, Shield, Zap, Award, Star } from 'lucide-react';
import { teamsApi } from '../services/sporticsApi';
import { Team } from '../types';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsApi.getAll();
      setTeams(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch teams. Make sure the backend is running.');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const teamColors = [
    { primary: '#ef4444', secondary: '#dc2626', light: '#fef2f2' },
    { primary: '#3b82f6', secondary: '#2563eb', light: '#eff6ff' },
    { primary: '#10b981', secondary: '#059669', light: '#f0fdf4' },
    { primary: '#f59e0b', secondary: '#d97706', light: '#fffbeb' },
    { primary: '#8b5cf6', secondary: '#7c3aed', light: '#faf5ff' },
    { primary: '#ec4899', secondary: '#db2777', light: '#fdf2f8' },
    { primary: '#14b8a6', secondary: '#0d9488', light: '#f0fdfa' },
    { primary: '#f97316', secondary: '#ea580c', light: '#fff7ed' },
  ];

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(20px); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.1); }
          50% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.3); }
        }

        .team-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .team-card:hover {
          transform: translateY(-12px) scale(1.02);
        }

        .team-card::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 1.5rem;
          padding: 2px;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.3), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s;
        }

        .team-card:hover::before {
          opacity: 1;
        }

        .float-animation {
          animation: float 4s ease-in-out infinite;
        }

        .wave-animation {
          animation: wave 3s ease-in-out infinite;
        }

        .glow-effect {
          animation: glow 2s ease-in-out infinite;
        }

        .gradient-border {
          position: relative;
          border-radius: 1rem;
          padding: 2px;
          background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
        }

        .gradient-border-inner {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: calc(1rem - 2px);
          padding: 1.5rem;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Animated background grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.3,
        }}></div>

        {/* Floating shapes */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.1 }}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${100 + Math.random() * 100}px`,
                height: `${100 + Math.random() * 100}px`,
                background: `linear-gradient(135deg, #667eea, #764ba2)`,
                borderRadius: `${Math.random() * 50}%`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                filter: 'blur(50px)',
                animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            ></div>
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          {/* Header */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            <div className="container mx-auto px-4 sm:px-6 py-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 text-white hover:text-gray-300 mb-3 transition-colors group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Home</span>
                  </Link>
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-3 rounded-xl relative overflow-hidden glow-effect"
                      style={{
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Users className="w-8 h-8 text-white relative z-10" />
                      <div 
                        className="wave-animation absolute inset-0"
                        style={{
                          background: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.2))',
                        }}
                      ></div>
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-black text-white">Teams</h1>
                      <p className="text-white text-opacity-80 text-sm">Manage team registrations</p>
                    </div>
                  </div>
                </div>
                <button 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-2xl transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                  }}
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Team</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {loading && (
              <div className="text-center py-20">
                <div className="inline-block relative">
                  <Shield className="w-20 h-20 text-white animate-pulse" />
                  <div 
                    className="absolute inset-0"
                    style={{
                      border: '4px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '50%',
                      borderTopColor: 'white',
                      animation: 'spin 1s linear infinite',
                    }}
                  ></div>
                </div>
                <p className="mt-6 text-white text-lg font-medium">Loading teams...</p>
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
                      <h3 className="text-white font-semibold mb-1">Error Loading Teams</h3>
                      <p className="text-white text-opacity-90 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && teams.length === 0 && (
              <div className="max-w-2xl mx-auto">
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '1.5rem',
                  padding: '4rem 2rem',
                  textAlign: 'center',
                }}>
                  <div className="float-animation inline-block mb-6">
                    <Users className="w-20 h-20 text-white opacity-50" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No Teams Yet</h3>
                  <p className="text-white text-opacity-80 mb-6">
                    Start building your competition by registering your first team!
                  </p>
                  <button 
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    <span>Register Your First Team</span>
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && teams.length > 0 && (
              <>
                {/* Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="gradient-border">
                    <div className="gradient-border-inner">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white bg-opacity-10 rounded-lg">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-white">{teams.length}</div>
                          <div className="text-white text-opacity-80 text-sm">Total Teams</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="gradient-border">
                    <div className="gradient-border-inner">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white bg-opacity-10 rounded-lg">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-white">
                            {teams.filter(t => t.event_type === 'LOG').length}
                          </div>
                          <div className="text-white text-opacity-80 text-sm">LOG Teams</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="gradient-border">
                    <div className="gradient-border-inner">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white bg-opacity-10 rounded-lg">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-white">
                            {teams.filter(t => t.event_type === 'OLYMPIAD').length}
                          </div>
                          <div className="text-white text-opacity-80 text-sm">OLYMPIAD Teams</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="gradient-border">
                    <div className="gradient-border-inner">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white bg-opacity-10 rounded-lg">
                          <Home className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-white">
                            {teams.filter(t => t.house).length}
                          </div>
                          <div className="text-white text-opacity-80 text-sm">Assigned Houses</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teams Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teams.map((team, index) => {
                    const color = teamColors[index % teamColors.length];
                    const isLog = team.event_type === 'LOG';
                    
                    return (
                      <div
                        key={team.id}
                        className="team-card"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '1.5rem',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Team Header with color accent */}
                        <div 
                          style={{
                            background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})`,
                            padding: '1.5rem',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <div 
                            style={{
                              position: 'absolute',
                              top: '-50%',
                              right: '-30%',
                              width: '200px',
                              height: '200px',
                              background: 'rgba(255, 255, 255, 0.1)',
                              borderRadius: '50%',
                              filter: 'blur(50px)',
                            }}
                          ></div>
                          
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div 
                                className="p-3 rounded-xl"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.2)',
                                  backdropFilter: 'blur(10px)',
                                }}
                              >
                                <Shield className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                  {team.team_name}
                                </h3>
                                <span 
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                    isLog
                                      ? 'bg-green-500 bg-opacity-30 text-green-100'
                                      : 'bg-purple-500 bg-opacity-30 text-purple-100'
                                  }`}
                                >
                                  {isLog ? (
                                    <Zap className="w-3 h-3" />
                                  ) : (
                                    <Award className="w-3 h-3" />
                                  )}
                                  {team.event_type}
                                </span>
                              </div>
                            </div>
                            <Star className="w-6 h-6 text-white opacity-50" />
                          </div>
                        </div>

                        {/* Team Body */}
                        <div className="p-6 space-y-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                              }}
                            >
                              <Trophy className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-xs text-white text-opacity-60 font-medium">Sport ID</div>
                              <div className="text-white font-semibold">#{team.sport}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                              }}
                            >
                              <Home className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-xs text-white text-opacity-60 font-medium">House</div>
                              <div className="text-white font-semibold">
                                {team.house ? `#${team.house}` : 'Not assigned'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                              }}
                            >
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-xs text-white text-opacity-60 font-medium">Team ID</div>
                              <div className="text-white font-semibold">#{team.id}</div>
                            </div>
                          </div>
                        </div>

                        {/* Team Footer */}
                        <div 
                          className="px-6 py-4 border-t"
                          style={{
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            background: 'rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          <button 
                            className="w-full text-white text-sm font-semibold hover:text-opacity-80 transition-all flex items-center justify-center gap-2 group"
                          >
                            <span>Manage Team</span>
                            <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
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