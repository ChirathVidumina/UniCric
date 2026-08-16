import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Calendar, Target, Activity, Flame, ShieldAlert, 
  ArrowRight, CheckCircle2, MapPin, Users, Award, TrendingUp, Zap, ChevronRight, RefreshCw, AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://unicric-backend.onrender.com';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/dashboard`);
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        } else {
          setDashboardData(null);
          setError("Failed to load dashboard data from API.");
        }
      } catch (err) {
        console.error("Error fetching dashboard telemetry:", err);
        setDashboardData(null);
        setError("Unable to connect to FastAPI backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const uomTeam = dashboardData?.uomTeam || { played: 0, won: 0, points: 0, nrr: '0.000' };
  const schedule = dashboardData?.schedule || [];
  const uomCompletedMatch = dashboardData?.uomCompletedMatch;
  const nextTargetMatch = dashboardData?.nextTargetMatch;
  const upcomingMatch = dashboardData?.upcomingMatch;
  const groupTeams = dashboardData?.groupTeams || [];
  const topPerformers = dashboardData?.topPerformers || [];
  const topBowler = dashboardData?.topBowler;

  return (
    <div className="dashboard-page" style={{ paddingBottom: '4rem' }}>
      
      {/* Hero Welcome Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0b1329 0%, #1e1b4b 50%, #0f172a 100%)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ zIndex: 2, maxWidth: '650px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(220, 38, 38, 0.2)', color: '#ef4444', padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.85rem', border: '1px solid rgba(220, 38, 38, 0.4)' }}>
            <ShieldAlert size={14} /> UNIVERSITY OF MORATUWA (UOM) CRICKET DASHBOARD
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
            Inter-University Championship 2026
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Welcome to the official UOM Cricket Dashboard. Monitor match schedules, team performance, Group C standings, and launch deep opponent scouting analytics.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <Link 
              to="/analytics" 
              className="btn-primary"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
              }}
            >
              <Target size={18} /> Launch Opponent Scouting Analytics
            </Link>

            <Link 
              to="/tournaments" 
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              <Trophy size={18} color="#fbbf24" /> View Full Standings
            </Link>
          </div>
        </div>

        {/* UOM Crest Badge */}
        <div 
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '1.25rem 1.75rem',
            borderRadius: '14px',
            border: '1px solid rgba(220, 38, 38, 0.4)',
            textAlign: 'center',
            minWidth: '220px',
            zIndex: 2
          }}
        >
          <img 
            src="/mora_logo.png" 
            alt="Moratuwa Logo" 
            style={{ width: '64px', height: '64px', borderRadius: '10px', marginBottom: '0.5rem', border: '2px solid #dc2626' }}
          />
          <div style={{ fontWeight: '900', color: 'white', fontSize: '1.1rem' }}>Moratuwa University</div>
          <div style={{ color: '#ef4444', fontWeight: '800', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Group C • {uomTeam.played > 0 ? `NRR ${uomTeam.nrr}` : 'Ready for Telemetry'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Record: {uomTeam.played} Played, {uomTeam.won} Won ({uomTeam.points} Pts)
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <RefreshCw className="animate-spin" size={28} color="#ef4444" />
          <span style={{ fontSize: '1rem', fontWeight: '700' }}>Loading championship dashboard telemetry...</span>
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '10px', color: '#ef4444', marginBottom: '2rem' }}>
          <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} /><br />
          <strong>Dashboard Connection Warning:</strong> {error}<br />
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Ensure the FastAPI backend is running at {API_URL}</span>
        </div>
      ) : (
        <>
          {/* Primary KPI Grid */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-header">
                <span>GROUP C STANDING</span>
                <div className="stat-icon"><Trophy size={20} color="#fbbf24" /></div>
              </div>
              <div className="stat-value" style={{ color: '#fbbf24' }}>
                {uomTeam.played > 0 ? `Pts: ${uomTeam.points}` : '0 Matches'}
              </div>
              <div className="stat-change positive">
                NRR {uomTeam.nrr || '0.000'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>NEXT TARGET MATCH</span>
                <div className="stat-icon"><Flame size={20} color="#dc2626" /></div>
              </div>
              <div className="stat-value" style={{ fontSize: '1.35rem', color: '#ef4444' }}>
                {nextTargetMatch ? `${nextTargetMatch.dateLabel || 'Upcoming'} ${nextTargetMatch.opponentId || ''}` : 'Scheduled'}
              </div>
              <div className="stat-change positive">
                {nextTargetMatch ? (nextTargetMatch.opponentName || nextTargetMatch.venue || 'Target Match') : 'Pending Schedule'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>LAST MATCH RESULT</span>
                <div className="stat-icon"><CheckCircle2 size={20} color="#10b981" /></div>
              </div>
              <div className="stat-value" style={{ fontSize: '1.35rem', color: '#10b981' }}>
                {uomCompletedMatch ? uomCompletedMatch.result : 'No Match Data'}
              </div>
              <div className="stat-change positive">
                {uomCompletedMatch ? uomCompletedMatch.scoreSummary : 'Upload PDF scorecard to log telemetry'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>KEY STRIKE BOWLER</span>
                <div className="stat-icon"><Award size={20} color="#3b82f6" /></div>
              </div>
              <div className="stat-value" style={{ fontSize: '1.35rem', color: '#60a5fa' }}>
                {topBowler ? topBowler.name : 'N/A'}
              </div>
              <div className="stat-change positive">
                {topBowler ? `${topBowler.wickets} Wkts (Econ ${topBowler.econ || 0})` : 'No Bowler Logged Yet'}
              </div>
            </div>
          </div>

          {/* Main Two Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
            
            {/* Left Column: Match Schedule Timeline */}
            <div className="content-card" style={{ borderLeft: '4px solid #dc2626' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={22} color="#dc2626" />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>UOM Match Schedule & Fixtures</h2>
                </div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626', padding: '0.25rem 0.65rem', borderRadius: '12px', fontWeight: '800' }}>
                  GROUP C FIXTURES
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {schedule.length > 0 ? (
                  <>
                    {/* Match 1: Completed */}
                    {uomCompletedMatch && (
                      <div 
                        style={{ 
                          background: 'rgba(16, 185, 129, 0.08)', 
                          border: '1px solid rgba(16, 185, 129, 0.3)', 
                          borderRadius: '10px', 
                          padding: '1.1rem' 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#10b981', background: 'rgba(16, 185, 129, 0.2)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            ✓ MATCH COMPLETED
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>{uomCompletedMatch.dateLabel}</span>
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '0.3rem', color: 'white' }}>
                          {uomCompletedMatch.opponentName}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '800' }}>
                          Result: {uomCompletedMatch.result}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          Score: {uomCompletedMatch.scoreSummary}
                        </div>
                      </div>
                    )}

                    {/* Match 2: Next Target */}
                    {nextTargetMatch && (
                      <div 
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)', 
                          border: '2px solid #dc2626', 
                          borderRadius: '10px', 
                          padding: '1.1rem',
                          boxShadow: '0 4px 15px rgba(220, 38, 38, 0.2)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#dc2626', background: 'rgba(220, 38, 38, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Flame size={12} /> TARGET MATCH
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: '800' }}>{nextTargetMatch.dateLabel}</span>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '900', marginBottom: '0.3rem', color: 'white' }}>
                          {nextTargetMatch.opponentName}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                          <MapPin size={14} color="#ef4444" /> {nextTargetMatch.venue}
                        </div>
                        <Link 
                          to="/analytics"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: '#dc2626',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            textDecoration: 'none'
                          }}
                        >
                          <Target size={14} /> Analyze Opponent Data <ArrowRight size={14} />
                        </Link>
                      </div>
                    )}

                    {/* Match 3: Upcoming */}
                    {upcomingMatch && (
                      <div 
                        style={{ 
                          background: 'rgba(59, 130, 246, 0.08)', 
                          border: '1px solid rgba(59, 130, 246, 0.3)', 
                          borderRadius: '10px', 
                          padding: '1.1rem' 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.2)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            ⏳ UPCOMING MATCH
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>{upcomingMatch.dateLabel}</span>
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '0.3rem', color: 'white' }}>
                          {upcomingMatch.opponentName}
                        </h3>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={14} color="#10b981" /> {upcomingMatch.venue}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    No match schedule or fixtures logged yet in database.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Group C Table Snapshot & Top Performers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Group C Standings Snapshot */}
              <div className="content-card" style={{ borderLeft: '4px solid #fbbf24' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={20} color="#fbbf24" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0 }}>Group C Points Table</h3>
                  </div>
                  <Link to="/tournaments" style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: '700', textDecoration: 'none' }}>
                    Full Table →
                  </Link>
                </div>

                {groupTeams.length > 0 ? (
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#94a3b8', fontSize: '0.75rem' }}>
                        <th style={{ padding: '0.5rem 0' }}>#</th>
                        <th>Team</th>
                        <th style={{ textAlign: 'center' }}>M</th>
                        <th style={{ textAlign: 'center' }}>W</th>
                        <th style={{ textAlign: 'right' }}>NRR</th>
                        <th style={{ textAlign: 'right' }}>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupTeams.map((tm, idx) => {
                        const isUOM = tm.code === 'UOM' || tm.isPrimary;
                        return (
                          <tr 
                            key={tm.code || tm.name}
                            style={{ 
                              borderBottom: '1px solid var(--border-color)',
                              background: isUOM ? 'rgba(220, 38, 38, 0.15)' : 'transparent',
                              fontWeight: isUOM ? '800' : '400'
                            }}
                          >
                            <td style={{ padding: '0.65rem 0', fontWeight: '800', color: isUOM ? '#ef4444' : idx === 0 ? '#fbbf24' : '#94a3b8' }}>
                              {idx + 1}
                            </td>
                            <td style={{ fontWeight: '800', color: isUOM ? '#ef4444' : 'white' }}>
                              {tm.name} {isUOM && '(UOM)'}
                            </td>
                            <td style={{ textAlign: 'center' }}>{tm.played}</td>
                            <td style={{ textAlign: 'center', color: '#10b981', fontWeight: '800' }}>{tm.won}</td>
                            <td style={{ textAlign: 'right', fontWeight: '700', color: tm.nrr && tm.nrr.startsWith('+') ? '#10b981' : '#94a3b8' }}>
                              {tm.nrr}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '900', color: isUOM ? '#ef4444' : '#fbbf24' }}>
                              {tm.points}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                    No Group C standings logged.
                  </div>
                )}
              </div>

              {/* Top Performers Box */}
              <div className="content-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Flame size={20} color="#dc2626" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0 }}>Moratuwa Top Performers</h3>
                </div>

                {topPerformers.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {topPerformers.map((p, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          display: 'flex', 
                          justify: 'space-between', 
                          alignItems: 'center',
                          background: 'var(--bg-subtle)',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1rem' }}>{p.icon || '🏏'}</span>
                          <div>
                            <div style={{ fontWeight: '800', fontSize: '0.85rem', color: 'white' }}>{p.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.note}</div>
                          </div>
                        </div>
                        <div style={{ fontWeight: '900', fontSize: '0.85rem', color: '#10b981' }}>
                          {p.stat}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px border var(--border-color)' }}>
                    No Player Telemetry Uploaded Yet.<br />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Connect backend database to populate player stats.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <Link 
              to="/analytics"
              style={{
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                borderRadius: '12px',
                padding: '1.25rem',
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ color: '#ef4444', fontWeight: '800', fontSize: '0.8rem' }}>SCOUTING & METRICS</div>
                <div style={{ fontWeight: '900', fontSize: '1.1rem', marginTop: '0.2rem' }}>Opponent Scouting Analytics</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Analyze venue telemetry & form</div>
              </div>
              <ChevronRight size={24} color="#ef4444" />
            </Link>

            <Link 
              to="/tournaments"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '1.25rem',
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ color: '#fbbf24', fontWeight: '800', fontSize: '0.8rem' }}>OFFICIAL SLUSA 2026</div>
                <div style={{ fontWeight: '900', fontSize: '1.1rem', marginTop: '0.2rem' }}>Championship & Scoreboards</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>View match scorecards & groups</div>
              </div>
              <ChevronRight size={24} color="#fbbf24" />
            </Link>

            <Link 
              to="/teams-players"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '1.25rem',
                textDecoration: 'none',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ color: '#10b981', fontWeight: '800', fontSize: '0.8rem' }}>SQUAD DATABASE</div>
                <div style={{ fontWeight: '900', fontSize: '1.1rem', marginTop: '0.2rem' }}>Teams & Player Rosters</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Orange & Purple cap leaderboards</div>
              </div>
              <ChevronRight size={24} color="#10b981" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
