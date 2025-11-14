import { Trophy, Users, Home, Sparkles, Activity, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const cards = [
    {
      title: "Sports",
      icon: Trophy,
      desc: "View and manage all sports events (LOG & OLYMPIAD)",
      bgColor: "#3b82f6",
      hoverColor: "#6366f1",
      link: "/sports",
    },
    {
      title: "Houses",
      icon: Home,
      desc: "Manage houses and their captains",
      bgColor: "#ec4899",
      hoverColor: "#f43f5e",
      link: "/houses",
    },
    {
      title: "Teams",
      icon: Users,
      desc: "View and organize team registrations",
      bgColor: "#10b981",
      hoverColor: "#14b8a6",
      link: "/teams",
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #1e293b 0%, #581c87 50%, #1e293b 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'auto',
    }}>
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px);
            opacity: 0.6;
          }
        }
        
        @keyframes pulse-orb {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.1);
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .card-hover {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .icon-hover {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover:hover .icon-hover {
          transform: scale(1.1) rotate(6deg);
        }

        .arrow-hover {
          transition: transform 0.3s ease;
        }

        .card-hover:hover .arrow-hover {
          transform: translateX(8px);
        }

        .gradient-text {
          background: linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-card {
          animation: float 3s ease-in-out infinite;
        }

        .particle {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>

      {/* Animated background orbs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: '-25%',
          left: '-12%',
          width: '384px',
          height: '384px',
          background: '#a855f7',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'pulse-orb 3s ease-in-out infinite',
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-25%',
          right: '-12%',
          width: '384px',
          height: '384px',
          background: '#3b82f6',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'pulse-orb 3s ease-in-out infinite',
          animationDelay: '1s',
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '384px',
          height: '384px',
          background: '#ec4899',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'pulse-orb 3s ease-in-out infinite',
          animationDelay: '0.5s',
          opacity: 0.1,
        }}></div>
      </div>

      {/* Floating particles */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: 'white',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '3rem 1.5rem',
      }}>
        <div style={{ maxWidth: '1280px', width: '100%' }}>
          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              marginBottom: '2rem',
            }}>
              <Sparkles style={{ width: '16px', height: '16px', color: '#fbbf24' }} />
              <span style={{ fontSize: '0.875rem', color: 'white', fontWeight: 500 }}>
                Powered by Innovation
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 900, marginBottom: '1.5rem' }}>
              <span className="gradient-text">
                Sportics
              </span>
              <br />
              <span style={{ color: 'white', fontSize: 'clamp(2rem, 6vw, 3.75rem)' }}>
                Event Manager
              </span>
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: '#d1d5db',
              maxWidth: '42rem',
              margin: '0 auto',
              lineHeight: 1.75,
              padding: '0 1rem',
            }}>
              A modern, unified platform to manage your sports events, houses,
              and teams — all in one place with style and efficiency.
            </p>

            {/* Stats */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '2rem',
              marginTop: '3rem',
            }}>
              {[
                { value: '100+', label: 'Events Managed' },
                { value: '50+', label: 'Active Teams' },
                { value: '24/7', label: 'Support' },
              ].map((stat, i) => (
                <div key={i} className="stat-card" style={{ textAlign: 'center', animationDelay: `${i * 0.2}s` }}>
                  <div style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cards Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            padding: '0 1rem',
            maxWidth: '1200px',
            margin: '0 auto',
          }}>
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.link}
                  className="card-hover"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '1.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    padding: '2.5rem',
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  {/* Icon container */}
                  <div 
                    className="icon-hover"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '64px',
                      height: '64px',
                      borderRadius: '1rem',
                      background: `linear-gradient(135deg, ${card.bgColor}, ${card.hoverColor})`,
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <Icon style={{ width: '32px', height: '32px', color: 'white' }} />
                  </div>

                  <h2 style={{
                    fontSize: 'clamp(1.5rem, 3vw, 1.875rem)',
                    fontWeight: 700,
                    color: 'white',
                    marginBottom: '0.75rem',
                  }}>
                    {card.title}
                  </h2>

                  <p style={{
                    fontSize: '1rem',
                    color: '#9ca3af',
                    lineHeight: 1.625,
                    marginBottom: '1.5rem',
                  }}>
                    {card.desc}
                  </p>

                  {/* Arrow indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9ca3af' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Explore</span>
                    <ArrowRight className="arrow-hover" style={{ width: '16px', height: '16px' }} />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer / API Status */}
          <div style={{ marginTop: '5rem', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '1rem 2rem',
              borderRadius: '9999px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: '#10b981',
                    borderRadius: '50%',
                    animation: 'pulse-orb 2s ease-in-out infinite',
                  }}></div>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    width: '12px',
                    height: '12px',
                    background: '#10b981',
                    borderRadius: '50%',
                    animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                  }}></div>
                </div>
                <Activity style={{ width: '16px', height: '16px', color: '#10b981' }} />
              </div>
              <span style={{ fontSize: '0.875rem', color: '#d1d5db', textAlign: 'center' }}>
                Backend API connected at{" "}
                <span style={{ color: '#34d399', fontWeight: 600 }}>
                  http://127.0.0.1:8000/
                </span>
              </span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Made with ❤️ for Sports Enthusiasts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}