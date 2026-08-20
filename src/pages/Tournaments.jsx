import React, { useState, useEffect } from 'react';
import { 
  Trophy, Calendar, MapPin, Award, CheckCircle2, ChevronRight, 
  ExternalLink, Activity, Zap, Flame, Target, BarChart3, Layers, 
  TrendingUp, FileText, X, UserCheck, Check, ArrowLeft, RefreshCw, AlertCircle 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Tournaments() {
  const [tournamentData, setTournamentData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('ALL'); // 'POINTS_TABLE', 'MATCHES', 'LEADERBOARD', 'STATS', 'ALL'
  const [selectedGroupCode, setSelectedGroupCode] = useState('GROUP_C'); // 'GROUP_C', 'GROUP_A', 'GROUP_B', 'GROUP_D', 'ALL_GROUPS'
  const [leaderboardCategory, setLeaderboardCategory] = useState('ALL'); // 'ALL', 'BAT', 'BOWL', 'FIELD'
  const [selectedCompletedMatchId, setSelectedCompletedMatchId] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Handle ESC key and prevent body scroll when modal is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedMatch(null);
      }
    };
    if (selectedMatch) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMatch]);

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      setError(null);
      try {
        const [resTourn, resAnal] = await Promise.all([
          fetch(`${API_URL}/api/tournaments`),
          fetch(`${API_URL}/api/analytics`)
        ]);
        if (resTourn.ok && resAnal.ok) {
          const dataTourn = await resTourn.json();
          const dataAnal = await resAnal.json();
          setTournamentData(dataTourn);
          setAnalyticsData(dataAnal);
        } else {
          setTournamentData(null);
          setAnalyticsData(null);
          setError("Failed to load tournament telemetry from API.");
        }
      } catch (err) {
        console.error("Error fetching tournament telemetry:", err);
        setTournamentData(null);
        setAnalyticsData(null);
        setError("Unable to connect to FastAPI backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const tournament = tournamentData?.tournament || {};
  const completedMatchScorecards = tournamentData?.completedMatchScorecards || {};
  const teams = tournamentData?.teams || [];
  const schedule = tournamentData?.schedule || [];
  const groups = tournamentData?.groups || [];

  // Dynamically load leaderboards from API
  const topBatters = analyticsData?.leaderboards?.orange_cap || [];
  const topBowlers = analyticsData?.leaderboards?.purple_cap || [];
  const topFielders = analyticsData?.leaderboards?.silver_glove || [];

  const activeScorecard = selectedCompletedMatchId ? completedMatchScorecards[selectedCompletedMatchId] : null;

  const groupC = groups.find(g => g.code === 'GROUP_C' || g.code?.includes('C')) || { teams: [] };
  const uomTeam = groupC.teams ? (groupC.teams.find(t => t.code === 'MOR' || t.code === 'UOM' || t.isPrimary) || { played: 0, won: 0, lost: 0, points: 0, nrr: '0.000' }) : { played: 0, won: 0, lost: 0, points: 0, nrr: '0.000' };

  return (
    <div className="tournaments-page" style={{ paddingBottom: '4rem' }}>
      
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            <Trophy size={14} /> OFFICIAL CRICHEROES SLUSA CHAMPIONSHIP TELEMETRY
          </div>
          <h1 className="page-title">2026 Sri Lanka University Cricket Championship</h1>
          <p className="page-subtitle">
            Official League Standings, Net Run Rates, Qualification Scenarios & Ingested Match Scorecards
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <RefreshCw className="animate-spin" size={28} color="#dc2626" />
          <span style={{ fontSize: '1rem', fontWeight: '700' }}>Loading official championship standings & scoreboards...</span>
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '10px', color: '#ef4444', marginBottom: '2rem' }}>
          <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} /><br />
          <strong>Championship API Warning:</strong> {error}<br />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ensure the FastAPI backend is running at {API_URL}</span>
        </div>
      ) : (
        <>
          {/* KPI Header Grid */}
          <div className="stats-grid mobile-col-1" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-header">
                <span>PARTICIPATING UNIVERSITIES</span>
                <div className="stat-icon"><Trophy size={20} color="#dc2626" /></div>
              </div>
              <div className="stat-value">{teams.length} Universities</div>
              <div className="stat-change positive">
                {groups.length} League Groups ({groups.map(g => g.name).join(', ')})
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>OUR MORATUWA TEAM (GROUP C)</span>
                <div className="stat-icon"><Target size={20} color="#dc2626" /></div>
              </div>
              <div className="stat-value" style={{ color: '#dc2626' }}>
                {uomTeam.played > 0 ? `${uomTeam.points} Pts (${uomTeam.nrr || '0.000'} NRR)` : '0 Matches Played'}
              </div>
              <div className="stat-change positive">
                {uomTeam.won ?? 0} Won, {uomTeam.lost ?? 0} Lost • {uomTeam.points ?? 0} Points (Group C)
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>CHAMPIONSHIP MATCHES INGESTED</span>
                <div className="stat-icon"><Activity size={20} color="var(--accent-green)" /></div>
              </div>
              <div className="stat-value">
                {tournament.completedMatches || 0} / {schedule.length || 32} Matches
              </div>
              <div className="stat-change positive">
                Verified CricHeroes Telemetry Data
              </div>
            </div>
          </div>

          {/* SECTION SELECTION BUTTONS */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('ALL')}
              style={{
                padding: '0.7rem 1.35rem',
                borderRadius: '8px',
                border: activeTab === 'ALL' ? '2px solid #dc2626' : '1px solid var(--border-color)',
                background: activeTab === 'ALL' ? 'rgba(220, 38, 38, 0.15)' : 'var(--bg-card)',
                color: activeTab === 'ALL' ? 'white' : 'var(--text-secondary)',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Layers size={16} /> Show All Sections
            </button>

            <button
              onClick={() => setActiveTab('POINTS_TABLE')}
              style={{
                padding: '0.7rem 1.35rem',
                borderRadius: '8px',
                border: activeTab === 'POINTS_TABLE' ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                background: activeTab === 'POINTS_TABLE' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-card)',
                color: activeTab === 'POINTS_TABLE' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Trophy size={16} /> 1. Points Table
            </button>

            <button
              onClick={() => setActiveTab('MATCHES')}
              style={{
                padding: '0.7rem 1.35rem',
                borderRadius: '8px',
                border: activeTab === 'MATCHES' ? '2px solid var(--accent-green)' : '1px solid var(--border-color)',
                background: activeTab === 'MATCHES' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-card)',
                color: activeTab === 'MATCHES' ? 'var(--accent-green)' : 'var(--text-secondary)',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Calendar size={16} /> 2. Past Matches & Scoreboards
            </button>

            <button
              onClick={() => setActiveTab('LEADERBOARD')}
              style={{
                padding: '0.7rem 1.35rem',
                borderRadius: '8px',
                border: activeTab === 'LEADERBOARD' ? '2px solid #dc2626' : '1px solid var(--border-color)',
                background: activeTab === 'LEADERBOARD' ? 'rgba(220, 38, 38, 0.15)' : 'var(--bg-card)',
                color: activeTab === 'LEADERBOARD' ? '#dc2626' : 'var(--text-secondary)',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Flame size={16} /> 3. Player Leaderboards
            </button>

            <button
              onClick={() => setActiveTab('STATS')}
              style={{
                padding: '0.7rem 1.35rem',
                borderRadius: '8px',
                border: activeTab === 'STATS' ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                background: activeTab === 'STATS' ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                color: activeTab === 'STATS' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <BarChart3 size={16} /> 4. Tournament Stats
            </button>
          </div>

          {/* ========================================================
              SECTION 1: 4-GROUP LEAGUE STANDINGS
          ======================================================== */}
          {(activeTab === 'ALL' || activeTab === 'POINTS_TABLE') && (
            <div className="content-card" style={{ marginBottom: '2.5rem', borderLeft: '4px solid #dc2626', background: 'var(--bg-card)' }}>
              
              {/* Card Header & CricHeroes Branding */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ background: '#dc2626', color: 'white', fontWeight: '900', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', letterSpacing: '1px' }}>
                      cric<span style={{ color: '#fbbf24' }}>heroes</span>
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Official 4-Group League Standings</h2>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: '0.35rem' }}>
                    Sri Lanka University Cricket Championship 2026 • Official Points Table & Net Run Rates
                  </p>
                </div>

                {/* Group Tab Selector Buttons */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {groups.map((grp) => (
                    <button
                      key={grp.code}
                      onClick={() => setSelectedGroupCode(grp.code)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '6px',
                        border: selectedGroupCode === grp.code ? '2px solid #dc2626' : '1px solid var(--border-color)',
                        background: selectedGroupCode === grp.code ? 'rgba(220, 38, 38, 0.2)' : 'var(--bg-subtle)',
                        color: selectedGroupCode === grp.code ? 'white' : 'var(--text-secondary)',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {grp.isOurGroup && <Target size={14} color="#dc2626" />}
                      {grp.name} {grp.isOurGroup ? '(Moratuwa)' : ''}
                    </button>
                  ))}

                  <button
                    onClick={() => setSelectedGroupCode('ALL_GROUPS')}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '6px',
                      border: selectedGroupCode === 'ALL_GROUPS' ? '2px solid white' : '1px solid var(--border-color)',
                      background: selectedGroupCode === 'ALL_GROUPS' ? 'rgba(255, 255, 255, 0.15)' : 'var(--bg-subtle)',
                      color: selectedGroupCode === 'ALL_GROUPS' ? 'white' : 'var(--text-secondary)',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    All Groups Overview
                  </button>
                </div>
              </div>

              {/* Group C Special Strategic Alert Widget */}
              {(selectedGroupCode === 'GROUP_C' || selectedGroupCode.includes('C')) && (
                <div style={{ background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.12) 0%, rgba(147, 51, 234, 0.12) 100%)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ color: '#dc2626', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Flame size={16} /> GROUP C STRATEGIC QUALIFICATION TELEMETRY
                    </div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                      {uomTeam.played > 0 ? `Moratuwa University (Pts: ${uomTeam.points} • NRR ${uomTeam.nrr})` : 'Moratuwa University Group C Telemetry Ready (0 Matches Played)'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                      {uomTeam.played > 0 ? `Record: ${uomTeam.won} Won, ${uomTeam.lost} Lost` : 'Upload official PDF scorecards to calculate points table and Net Run Rates.'}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#dc2626', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '800', border: '1px solid rgba(220, 38, 38, 0.4)' }}>
                    {uomTeam.played > 0 ? `Group C Standing: ${uomTeam.points} Pts` : 'Standing: Ready'}
                  </div>
                </div>
              )}

              {/* Render Groups Standings */}
              {groups
                .filter(g => selectedGroupCode === 'ALL_GROUPS' || g.code === selectedGroupCode)
                .map((grp) => (
                  <div key={grp.code} style={{ marginBottom: selectedGroupCode === 'ALL_GROUPS' ? '2.5rem' : '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: grp.isOurGroup ? '#dc2626' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {grp.isOurGroup && <span style={{ background: '#dc2626', color: 'white', fontSize: '0.65rem', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '900' }}>OUR GROUP</span>}
                        {grp.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>{grp.teams ? grp.teams.length : 0} Universities</span>
                    </div>

                    <div className="mobile-scroll" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <th style={{ padding: '0.75rem 1rem', width: '40px' }}>#</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Team</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>M</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>W</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>L</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Pts</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>NRR</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>For</th>
                            <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Against</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Last 5</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...grp.teams].sort((a, b) => {
                            if (b.points !== a.points) {
                              return (b.points || 0) - (a.points || 0);
                            }
                            const nrrA = parseFloat(String(a.nrr || '0').replace('+', ''));
                            const nrrB = parseFloat(String(b.nrr || '0').replace('+', ''));
                            return nrrB - nrrA;
                          }).map((tm, idx) => {
                            const isUOM = tm.code === 'UOM' || tm.code === 'MOR' || tm.isPrimary;
                            return (
                              <tr 
                                key={tm.code || tm.name || idx} 
                                style={{ 
                                  borderBottom: '1px solid var(--border-color)', 
                                  background: isUOM ? 'rgba(220, 38, 38, 0.12)' : idx % 2 === 0 ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                                  fontWeight: isUOM ? '800' : '400'
                                }}
                              >
                                <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: isUOM ? '#dc2626' : idx === 0 ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>
                                  {idx + 1}
                                </td>
                                <td style={{ padding: '0.85rem 1rem', fontWeight: '800', color: isUOM ? '#dc2626' : 'var(--text-primary)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {isUOM && <span style={{ background: '#dc2626', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' }}></span>}
                                    {tm.name}
                                    {isUOM && <span style={{ fontSize: '0.65rem', background: '#dc2626', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '900' }}>UOM</span>}
                                  </div>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: '700' }}>{tm.played ?? 0}</td>
                                <td style={{ textAlign: 'center', color: 'var(--accent-green)', fontWeight: '800' }}>{tm.won ?? 0}</td>
                                <td style={{ textAlign: 'center', color: (tm.lost ?? 0) > 0 ? '#ef4444' : 'var(--text-muted)' }}>{tm.lost ?? 0}</td>
                                <td style={{ textAlign: 'center', fontWeight: '900', fontSize: '1rem', color: isUOM ? '#dc2626' : 'var(--accent-gold)' }}>
                                  {tm.points ?? 0}
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: '800', color: String(tm.nrr || '').startsWith('+') ? 'var(--accent-green)' : tm.nrr === '0.000' || tm.nrr === '0' || !tm.nrr ? 'var(--text-muted)' : '#ef4444' }}>
                                  <span style={{ background: String(tm.nrr || '').startsWith('+') ? 'rgba(16, 185, 129, 0.15)' : tm.nrr === '0.000' || tm.nrr === '0' || !tm.nrr ? 'transparent' : 'rgba(239, 68, 68, 0.15)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                                    {tm.nrr || '0.000'}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{tm.for || '-'}</td>
                                <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{tm.against || '-'}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                    {tm.last5 && tm.last5.length > 0 ? (
                                      tm.last5.map((res, i) => (
                                        <span key={i} style={{ width: '18px', height: '18px', borderRadius: '50%', background: res === 'W' ? '#10b981' : res === 'L' ? '#ef4444' : 'var(--bg-subtle)', color: res === '-' ? 'var(--text-muted)' : 'white', fontSize: '0.65rem', fontWeight: '900', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                          {res}
                                        </span>
                                      ))
                                    ) : (
                                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* ========================================================
              SECTION 2: PAST MATCHES & INTERACTIVE SCOREBOARDS
          ======================================================== */}
          {(activeTab === 'ALL' || activeTab === 'MATCHES') && (
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Calendar size={22} color="var(--accent-green)" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>2. Championship Match Fixtures & Ingested Scoreboards</h2>
              </div>

              {schedule.length > 0 ? (
                <div className="mobile-col-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {schedule.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        if (item.status === 'COMPLETED') {
                          setSelectedCompletedMatchId(item.id);
                          setSelectedMatch({
                            ...item,
                            scorecard: completedMatchScorecards[item.id] || null
                          });
                        }
                      }}
                      style={{
                        cursor: item.status === 'COMPLETED' ? 'pointer' : 'default',
                        background: item.id === selectedMatch?.id ? 'rgba(16, 185, 129, 0.05)' : item.status === 'NEXT_TARGET' ? 'rgba(220, 38, 38, 0.15)' : 'var(--bg-card)',
                        border: item.id === selectedMatch?.id ? '2px solid #10b981' : item.status === 'NEXT_TARGET' ? '2px solid #dc2626' : '1px solid var(--border-color)',
                        boxShadow: item.id === selectedMatch?.id ? '0 0 20px rgba(16, 185, 129, 0.15)' : 'none',
                        transform: item.id === selectedMatch?.id ? 'translateY(-2px)' : 'none',
                        transition: 'all 0.2s ease',
                        borderRadius: '10px',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: item.status === 'COMPLETED' ? 'var(--accent-green)' : item.status === 'NEXT_TARGET' ? '#dc2626' : 'var(--accent-blue)' }}>
                            {item.status === 'COMPLETED' ? '✓ COMPLETED MATCH' : item.status === 'NEXT_TARGET' ? '🔥 NEXT TARGET MATCH' : '⏳ UPCOMING'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>{item.dateLabel}</span>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.35rem' }}>
                          {item.opponentName}
                        </h3>

                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <MapPin size={14} color={item.isHome ? 'var(--accent-green)' : '#dc2626'} />
                            <span>{item.venue}</span>
                          </div>
                          <div style={{ fontWeight: '700', color: item.status === 'COMPLETED' ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                            {item.scoreSummary || item.result}
                          </div>
                        </div>
                      </div>

                      {item.status === 'COMPLETED' ? (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCompletedMatchId(item.id);
                            setSelectedMatch({
                              ...item,
                              scorecard: completedMatchScorecards[item.id] || null
                            });
                          }}
                          style={{
                            width: '100%',
                            padding: '0.65rem 1rem',
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid var(--accent-green)',
                            borderRadius: '6px',
                            color: 'var(--accent-green)',
                            fontWeight: '800',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'all 0.2s ease'
                          }}
                          className="hover:!bg-emerald-600 hover:!text-white"
                        >
                          <FileText size={16} /> View Match Scorecard
                        </button>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px' }}>
                          Match Fixture Scheduled
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  No championship match fixtures logged yet.
                </div>
              )}

            </div>
          )}

          {/* ========================================================
              SECTION 3: CHAMPIONSHIP LEADERBOARD (BAT / BOWL / FIELD)
          ======================================================== */}
          {(activeTab === 'ALL' || activeTab === 'LEADERBOARD') && (
            <div style={{ marginBottom: '2.5rem' }}>
              
              {/* Header & Sub-Category Selector */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626', padding: '0.35rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flame size={22} color="#dc2626" />
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                    3. Championship Player Leaderboards
                  </h2>
                </div>

                {/* Category Selector Tabs */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: 'var(--bg-subtle)', padding: '0.3rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => setLeaderboardCategory('ALL')}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '7px',
                      border: 'none',
                      background: leaderboardCategory === 'ALL' ? 'linear-gradient(135deg, #dc2626, #991b1b)' : 'transparent',
                      color: leaderboardCategory === 'ALL' ? 'white' : 'var(--text-secondary)',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      boxShadow: leaderboardCategory === 'ALL' ? '0 4px 12px rgba(220, 38, 38, 0.3)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    All Leaderboards
                  </button>
                  <button
                    onClick={() => setLeaderboardCategory('BAT')}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '7px',
                      border: 'none',
                      background: leaderboardCategory === 'BAT' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent',
                      color: leaderboardCategory === 'BAT' ? 'white' : 'var(--text-secondary)',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      boxShadow: leaderboardCategory === 'BAT' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    🏏 Batting (Bat) • Orange Cap
                  </button>
                  <button
                    onClick={() => setLeaderboardCategory('BOWL')}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '7px',
                      border: 'none',
                      background: leaderboardCategory === 'BOWL' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent',
                      color: leaderboardCategory === 'BOWL' ? 'white' : 'var(--text-secondary)',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      boxShadow: leaderboardCategory === 'BOWL' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    🎯 Bowling (Bowl) • Purple Cap
                  </button>
                  <button
                    onClick={() => setLeaderboardCategory('FIELD')}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '7px',
                      border: 'none',
                      background: leaderboardCategory === 'FIELD' ? 'linear-gradient(135deg, #10b981, #047857)' : 'transparent',
                      color: leaderboardCategory === 'FIELD' ? 'white' : 'var(--text-secondary)',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      boxShadow: leaderboardCategory === 'FIELD' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    🧤 Fielding (Field) • Silver Glove
                  </button>
                </div>
              </div>

              <div className={`w-full ${leaderboardCategory === 'ALL' ? 'leaderboard-grid' : ''}`} style={{ marginTop: '1.5rem' }}>
                
                {/* 1. Batting Leaderboard */}
                {(leaderboardCategory === 'ALL' || leaderboardCategory === 'BAT') && (
                  <div className="content-card !p-3 lg:!p-4" style={{ borderTop: '4px solid var(--accent-gold)', borderRadius: '14px' }}>
                    <div className="card-title flex justify-between items-center mb-3 pb-2 border-b border-[var(--border-color)]">
                      <div className="flex items-center gap-2">
                        <Flame size={18} color="var(--accent-gold)" />
                        <span className="font-extrabold text-sm lg:text-[0.95rem]">Orange Cap</span>
                      </div>
                      <span className="text-[0.65rem] bg-[#f59e0b26] text-[#f59e0b] px-1.5 py-0.5 rounded font-extrabold">TOP RUNS</span>
                    </div>

                    {topBatters.length > 0 ? (
                      <div style={{ width: '100%', marginTop: '0.5rem', overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.75rem' }}>Batter</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>Team</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>Runs</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>HS</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>SR</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>4s/6s</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topBatters.map((b, idx) => (
                              <tr key={idx} style={{ background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s ease', borderBottom: idx !== topBatters.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                <td style={{ padding: '0.5rem 0.75rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, paddingRight: '0.5rem' }}>
                                    <span style={{ marginRight: '0.35rem', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0, color: idx === 0 ? 'var(--accent-gold)' : idx === 1 ? 'white' : idx === 2 ? '#f97316' : 'var(--text-muted)' }}>
                                      #{idx + 1}
                                    </span>
                                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={b.name}>{b.name}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>
                                  <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>{b.team}</span>
                                </td>
                                <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontWeight: '800', color: 'var(--accent-gold)', fontSize: '0.85rem' }}>{b.runs}</td>
                                <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontWeight: '600', color: 'white', fontSize: '0.75rem' }}>{b.hs || b.runs}</td>
                                <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontWeight: '600', color: 'white', fontSize: '0.75rem' }}>{b.sr || '0.0'}</td>
                                <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>{b.fours || 0}/{b.sixes || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'rgba(245, 158, 11, 0.12)', padding: '0.75rem', borderRadius: '50%', marginBottom: '0.75rem', display: 'inline-flex' }}>
                          <Flame size={28} color="var(--accent-gold)" />
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          Orange Cap Batting Standings Ready
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: '1.4' }}>
                          No batting telemetry logged yet in dataset.<br />Upload official match PDF scorecards to rank top batsmen.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Bowling Leaderboard */}
                {(leaderboardCategory === 'ALL' || leaderboardCategory === 'BOWL') && (
                  <div className="content-card !p-3 lg:!p-4" style={{ borderTop: '4px solid var(--accent-blue)', borderRadius: '14px' }}>
                    <div className="card-title flex justify-between items-center mb-3 pb-2 border-b border-[var(--border-color)]">
                      <div className="flex items-center gap-2">
                        <Target size={18} color="var(--accent-blue)" />
                        <span className="font-extrabold text-sm lg:text-[0.95rem]">Purple Cap</span>
                      </div>
                      <span className="text-[0.65rem] bg-[#3b82f626] text-[#3b82f6] px-1.5 py-0.5 rounded font-extrabold">MOST WICKETS</span>
                    </div>

                    {topBowlers.length > 0 ? (
                      <div style={{ width: '100%', marginTop: '0.5rem', overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.75rem' }}>Bowler</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>Team</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>Wkts</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>Best</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>Econ</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>Overs</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topBowlers.map((bw, idx) => {
                              const bestFigure = bw.bb || `${bw.wickets}/${bw.runs || bw.runsConceded || 0}`;
                              const calculatedOvers = bw.overs || (bw.balls ? `${Math.floor(bw.balls / 6)}.${bw.balls % 6}` : '0.0');

                              return (
                                <tr key={idx} style={{ background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s ease', borderBottom: idx !== topBowlers.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                  <td style={{ padding: '0.5rem 0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, paddingRight: '0.5rem' }}>
                                      <span style={{ marginRight: '0.35rem', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0, color: idx === 0 ? 'var(--accent-blue)' : idx === 1 ? 'white' : idx === 2 ? '#f97316' : 'var(--text-muted)' }}>
                                        #{idx + 1}
                                      </span>
                                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={bw.name}>{bw.name}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>
                                    <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>{bw.team}</span>
                                  </td>
                                  <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontWeight: '800', color: 'var(--accent-blue)', fontSize: '0.85rem' }}>{bw.wickets}</td>
                                  <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontWeight: '600', color: 'white', fontSize: '0.75rem' }}>{bestFigure}</td>
                                  <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontWeight: '600', color: 'white', fontSize: '0.75rem' }}>{bw.econ || '0.00'}</td>
                                  <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>{calculatedOvers}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.12)', padding: '0.75rem', borderRadius: '50%', marginBottom: '0.75rem', display: 'inline-flex' }}>
                          <Target size={28} color="var(--accent-blue)" />
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          Purple Cap Bowling Standings Ready
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: '1.4' }}>
                          No bowling telemetry logged yet in dataset.<br />Upload official match PDF scorecards to rank top wicket takers.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Fielding Leaderboard */}
                {(leaderboardCategory === 'ALL' || leaderboardCategory === 'FIELD') && (
                  <div className="content-card !p-3 lg:!p-4" style={{ borderTop: '4px solid var(--accent-green)', borderRadius: '14px' }}>
                    <div className="card-title flex justify-between items-center mb-3 pb-2 border-b border-[var(--border-color)]">
                      <div className="flex items-center gap-2">
                        <UserCheck size={18} color="var(--accent-green)" />
                        <span className="font-extrabold text-sm lg:text-[0.95rem]">Silver Glove</span>
                      </div>
                      <span className="text-[0.65rem] bg-[#10b98126] text-[#10b981] px-1.5 py-0.5 rounded font-extrabold">DISMISSALS</span>
                    </div>

                    {topFielders.length > 0 ? (
                      <div style={{ width: '100%', marginTop: '0.5rem', overflowX: 'auto' }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.75rem' }}>Fielder</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>Team</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>Ctch</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>Stmp</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>RO</th>
                              <th style={{ fontWeight: '600', padding: '0.5rem 0.25rem', textAlign: 'center' }}>Tot</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topFielders.map((fd, idx) => {
                              const totalDismissals = (fd.catches || 0) + (fd.stumpings || 0) + (fd.runOuts || 0);
                              return (
                                <tr key={idx} style={{ background: 'rgba(255,255,255,0.02)', transition: 'all 0.2s ease', borderBottom: idx !== topFielders.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                  <td style={{ padding: '0.5rem 0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, paddingRight: '0.5rem' }}>
                                      <span style={{ marginRight: '0.35rem', fontSize: '0.75rem', fontWeight: 'bold', flexShrink: 0, color: idx === 0 ? 'var(--accent-green)' : idx === 1 ? 'white' : idx === 2 ? '#f97316' : 'var(--text-muted)' }}>
                                        #{idx + 1}
                                      </span>
                                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={fd.name}>{fd.name}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>
                                    <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>{fd.team}</span>
                                  </td>
                                  <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontWeight: '600', color: 'white', fontSize: '0.75rem' }}>{fd.catches || 0}</td>
                                  <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontWeight: '600', color: 'white', fontSize: '0.75rem' }}>{fd.stumpings || 0}</td>
                                  <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontWeight: '600', color: 'white', fontSize: '0.75rem' }}>{fd.runOuts || 0}</td>
                                  <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontWeight: '800', color: 'var(--accent-green)', fontSize: '0.85rem' }}>{totalDismissals}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '0.75rem', borderRadius: '50%', marginBottom: '0.75rem', display: 'inline-flex' }}>
                          <UserCheck size={28} color="var(--accent-green)" />
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          Silver Glove Fielding Standings Ready
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: '1.4' }}>
                          No fielding telemetry logged yet in dataset.<br />Upload official match PDF scorecards to rank top fielders.
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 4: TOURNAMENT STATS & TELEMETRY
          ======================================================== */}
          {(activeTab === 'ALL' || activeTab === 'STATS') && (() => {
            const totalMatchesCount = tournament.completedMatches || 0;
            const totalInnings = tournament.totalInnings || 0;
            const totalRuns = tournament.totalRuns || 0;
            const totalWickets = tournament.totalWickets || 0;
            const totalBalls = tournament.totalBalls || 0;
            const totalExtras = tournament.totalExtras || 0;
            const totalFours = tournament.totalFours || 0;
            const totalSixes = tournament.totalSixes || 0;
            const totalFifties = tournament.totalFifties || 0; 
            const totalHundreds = tournament.totalCenturies || 0; 
            const fiftyPartnerships = tournament.fiftyPartnerships || 0; 
            const hundredPartnerships = tournament.hundredPartnerships || 0; 
            const totalMaidens = tournament.totalMaidens || 0;
            const totalDotBalls = tournament.totalDotBalls || 0;
            const totalCatches = tournament.totalCatches || 0;
            const totalStumpings = tournament.totalStumpings || 0;
            const bdryPct = tournament.bdryPct || "0.00";
            const bdryFreq = tournament.bdryFreq || "0.00";
            const dbFreq = tournament.dbFreq || "0.00";
            const dbPct = tournament.dbPct || "0.00";

            return (
              <div style={{ marginTop: '1rem' }}>
                {/* Section Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', padding: '0.35rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BarChart3 size={22} color="var(--accent-blue)" />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                      4. Tournament Overall Stats & Telemetry
                    </h2>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: '800', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    UNICRIC SIGNATURE TELEMETRY
                  </span>
                </div>

                {/* UniCric Signature Telemetry Cards Grid (All 19+ Signature Metric Cards) */}
                <div className="stats-grid mobile-col-1" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                  
                  {/* 1. Matches */}
                  <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                    <div className="stat-header">
                      <span>MATCHES INGESTED</span>
                      <div className="stat-icon"><Layers size={20} color="var(--accent-blue)" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalMatchesCount} Matches
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Official Tournament Matches Processed
                    </p>
                  </div>

                  {/* 2. Innings */}
                  <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                    <div className="stat-header">
                      <span>TOTAL TOURNAMENT INNINGS</span>
                      <div className="stat-icon"><Activity size={20} color="var(--accent-blue)" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalInnings} Innings
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Across All Ingested Match Scorecards
                    </p>
                  </div>

                  {/* 3. Runs */}
                  <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-green)' }}>
                    <div className="stat-header">
                      <span>TOTAL TOURNAMENT RUNS</span>
                      <div className="stat-icon"><TrendingUp size={20} color="var(--accent-green)" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalRuns} Runs
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Accumulated Championship Scoring
                    </p>
                  </div>

                  {/* 4. Wickets */}
                  <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-red)' }}>
                    <div className="stat-header">
                      <span>TOTAL WICKETS TAKEN</span>
                      <div className="stat-icon"><Target size={20} color="#dc2626" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalWickets} Wickets
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Championship Bowling Dismissals
                    </p>
                  </div>

                  {/* 5. Balls */}
                  <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="stat-header">
                      <span>TOTAL BALLS DELIVERED</span>
                      <div className="stat-icon"><Activity size={20} color="#3b82f6" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalBalls} Balls
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Official Tournament Overs & Deliveries
                    </p>
                  </div>

                  {/* 6. Extras */}
                  <div className="stat-card" style={{ borderLeft: '4px solid #a855f7' }}>
                    <div className="stat-header">
                      <span>EXTRAS CONCEDED</span>
                      <div className="stat-icon"><Zap size={20} color="#a855f7" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalExtras} Extras
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Wides, No Balls, Leg Byes & Byes Control
                    </p>
                  </div>

                  {/* 7. Fours */}
                  <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
                    <div className="stat-header">
                      <span>BOUNDARIES (FOURS SCORED)</span>
                      <div className="stat-icon"><Zap size={20} color="var(--accent-gold)" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalFours} Fours
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Ground Boundary Control
                    </p>
                  </div>

                  {/* 8. Sixes */}
                  <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
                    <div className="stat-header">
                      <span>MAXIMUMS (SIXES SCORED)</span>
                      <div className="stat-icon"><Flame size={20} color="var(--accent-gold)" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalSixes} Sixes
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Over-the-Fence Boundary Control
                    </p>
                  </div>

                  {/* 9. 50's */}
                  <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="stat-header">
                      <span>HALF CENTURIES (50'S)</span>
                      <div className="stat-icon"><Award size={20} color="#f59e0b" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalFifties} Fifties (50s)
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Individual Batting Milestones (50-99 Runs)
                    </p>
                  </div>

                  {/* 10. 100's */}
                  <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div className="stat-header">
                      <span>CENTURIES (100'S)</span>
                      <div className="stat-icon"><Award size={20} color="#f59e0b" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalHundreds} Hundreds (100s)
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Elite Individual Batting Centuries
                    </p>
                  </div>

                  {/* 11. 50+ Partnership */}
                  <div className="stat-card" style={{ borderLeft: '4px solid #dc2626' }}>
                    <div className="stat-header">
                      <span>50+ PARTNERSHIP STANDS</span>
                      <div className="stat-icon"><Flame size={20} color="#dc2626" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {fiftyPartnerships}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Key Half-Century Batting Stands
                    </p>
                  </div>

                  {/* 12. 100+ Partnership */}
                  <div className="stat-card" style={{ borderLeft: '4px solid #dc2626' }}>
                    <div className="stat-header">
                      <span>100+ PARTNERSHIP STANDS</span>
                      <div className="stat-icon"><Flame size={20} color="#dc2626" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {hundredPartnerships}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Century Batting Partnership Stands
                    </p>
                  </div>

                  {/* 13. Maidens */}
                  <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="stat-header">
                      <span>MAIDEN OVERS BOWLED</span>
                      <div className="stat-icon"><Target size={20} color="#3b82f6" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalMaidens} Maidens
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Zero-Run Bowling Economy Control
                    </p>
                  </div>

                  {/* 14. Dot balls */}
                  <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="stat-header">
                      <span>TOTAL DOT BALLS</span>
                      <div className="stat-icon"><Target size={20} color="#3b82f6" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalDotBalls} Dot Balls
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Pressure Deliveries Bowled
                    </p>
                  </div>

                  {/* 15. Catches */}
                  <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="stat-header">
                      <span>FIELDING CATCHES</span>
                      <div className="stat-icon"><UserCheck size={20} color="#10b981" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalCatches} Catches
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Outfield & Slip Catches Taken
                    </p>
                  </div>

                  {/* 16. Stumpings */}
                  <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="stat-header">
                      <span>WICKETKEEPING STUMPINGS</span>
                      <div className="stat-icon"><UserCheck size={20} color="#10b981" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {totalStumpings} Stumpings
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Wicketkeeper Standing Dismissals
                    </p>
                  </div>

                  {/* 17. BDRY% */}
                  <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
                    <div className="stat-header">
                      <span>BOUNDARY RUN PERCENTAGE (BDRY%)</span>
                      <div className="stat-icon"><Zap size={20} color="var(--accent-gold)" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {bdryPct}%
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Percentage of Total Runs Scored in Boundaries
                    </p>
                  </div>

                  {/* 18. BDRY Freq. */}
                  <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
                    <div className="stat-header">
                      <span>BOUNDARY FREQUENCY (BDRY FREQ.)</span>
                      <div className="stat-icon"><Zap size={20} color="var(--accent-gold)" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {bdryFreq} Balls/Bdry
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Average Balls Delivered Per Boundary Scored
                    </p>
                  </div>

                  {/* 19. DB Freq. */}
                  <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="stat-header">
                      <span>DOT BALL FREQUENCY (DB FREQ.)</span>
                      <div className="stat-icon"><Target size={20} color="#3b82f6" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {dbFreq} Balls/Dot
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Average Deliveries Per Dot Ball
                    </p>
                  </div>

                  {/* 20. DB% */}
                  <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="stat-header">
                      <span>DOT BALL PERCENTAGE (DB%)</span>
                      <div className="stat-icon"><Target size={20} color="#3b82f6" /></div>
                    </div>
                    <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                      {dbPct}%
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0, fontWeight: '600' }}>
                      Percentage of Total Deliveries Bowled as Dot Balls
                    </p>
                  </div>

                </div>

              </div>
            );
          })()}
        </>
      )}

      {/* ========================================================
          POP-UP MODAL OVERLAY: MATCH SCORECARD
      ======================================================== */}
      {selectedMatch && (() => {
        const scData = selectedMatch.scorecard || completedMatchScorecards[selectedMatch.id] || selectedMatch;
        
        const getInnInfo = (inn, fallbackTeam, fallbackScore) => {
          if (!inn) {
            return {
              team: fallbackTeam ? `${fallbackTeam.toUpperCase()} UNIVERSITY` : "UNIVERSITY TEAM",
              totalRuns: fallbackScore ? parseInt(fallbackScore) || 0 : 0,
              wickets: fallbackScore && fallbackScore.includes('/') ? parseInt(fallbackScore.split('/')[1]) || 0 : 0,
              overs: "0.0 OVERS",
              topBatters: [],
              topBowlers: []
            };
          }
          const rawTeam = inn.team || fallbackTeam || "UNIVERSITY";
          const team = rawTeam.toUpperCase().includes('UNIVERSITY') ? rawTeam.toUpperCase() : `${rawTeam.toUpperCase()} UNIVERSITY`;
          const totalRuns = inn.total_runs ?? inn.runs ?? (inn.score ? parseInt(inn.score) : 0);
          const wickets = inn.wickets ?? (inn.score && inn.score.includes('/') ? parseInt(inn.score.split('/')[1]) : 0);
          const overs = inn.overs ? `${inn.overs} OVERS` : "0.0 OVERS";

          const rawBatting = inn.batting || [];
          const topBatters = [...rawBatting]
            .filter(b => (b.runs ?? b.r ?? 0) > 0 || (b.balls ?? b.b ?? 0) > 0)
            .sort((a, b) => (b.runs ?? b.r ?? 0) - (a.runs ?? a.r ?? 0))
            .slice(0, 3);

          const rawBowling = inn.bowling || [];
          const topBowlers = [...rawBowling]
            .filter(bw => (bw.overs ?? bw.o ?? 0) > 0)
            .sort((a, b) => {
              const wDiff = (b.wickets ?? b.w ?? 0) - (a.wickets ?? a.w ?? 0);
              if (wDiff !== 0) return wDiff;
              return (a.eco ?? a.economy ?? 99) - (b.eco ?? b.economy ?? 99);
            })
            .slice(0, 3);

          return { team, totalRuns, wickets, overs, topBatters, topBowlers };
        };

        const inn1 = getInnInfo(scData?.team_a_innings || scData?.innings1, scData?.team_a || selectedMatch?.opponentName?.split(' vs ')[0]);
        const inn2 = getInnInfo(scData?.team_b_innings || scData?.innings2, scData?.team_b || selectedMatch?.opponentName?.split(' vs ')[1]);
        const matchResult = scData?.result || selectedMatch?.result || "MATCH COMPLETED";

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedMatch(null);
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.82)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
          >
            <div 
              className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative text-white"
              style={{
                background: 'linear-gradient(180deg, #0f172a 0%, #0b1329 100%)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 35px rgba(16, 185, 129, 0.2)'
              }}
            >
              {/* Modal Top Header Bar */}
              <div 
                className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur-md rounded-t-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-1">
                    <FileText size={15} /> MATCH SCOREBOARD • MATCH #{selectedMatch.id}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {selectedMatch.opponentName || `${scData?.team_a || 'TEAM A'} vs ${scData?.team_b || 'TEAM B'}`}
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1"><MapPin size={13} className="text-emerald-400" /> {selectedMatch.venue || scData?.ground}</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1"><Calendar size={13} className="text-emerald-400" /> {selectedMatch.dateLabel || scData?.date}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedMatch(null)}
                  className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 transition-all duration-150 cursor-pointer shadow-lg hover:scale-105"
                  aria-label="Close Scorecard"
                  title="Close Scorecard (Esc)"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-5" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 1ST INNINGS CARD */}
                <div style={{ background: '#0f172a', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #dc2626, #f59e0b)' }}></div>
                  
                  {/* Innings 1 Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingLeft: '1.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>1ST INNINGS</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'white', letterSpacing: '0.5px' }}>
                        {inn1.team}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#f59e0b', lineHeight: '1' }}>
                        {inn1.totalRuns}/{inn1.wickets}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', marginTop: '0.2rem' }}>
                        {inn1.overs}
                      </div>
                    </div>
                  </div>

                  {/* Innings 1 Batting & Bowling Breakdown */}
                  <div className="mobile-col-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
                    {/* Top Batters */}
                    <div style={{ background: '#0b1329', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', fontWeight: '800', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
                        <Flame size={15} /> TOP BATTERS
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {inn1.topBatters.length > 0 ? (
                          inn1.topBatters.map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.45rem 0.75rem', borderRadius: '6px' }}>
                              <span style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '0.85rem' }}>{p.name || p.batter || p.player}</span>
                              <div>
                                <strong style={{ color: 'white', fontSize: '0.95rem' }}>{p.runs ?? p.r ?? 0}</strong>{' '}
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>({p.balls ?? p.b ?? 0})</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>No batting figures logged</div>
                        )}
                      </div>
                    </div>

                    {/* Top Bowlers */}
                    <div style={{ background: '#0b1329', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: '800', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
                        <Target size={15} /> TOP BOWLERS
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {inn1.topBowlers.length > 0 ? (
                          inn1.topBowlers.map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.45rem 0.75rem', borderRadius: '6px' }}>
                              <span style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '0.85rem' }}>{p.name || p.bowler}</span>
                              <div>
                                <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>{p.wickets ?? p.w ?? 0}/{p.runs ?? p.runs_conceded ?? p.r ?? 0}</strong>{' '}
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '4px' }}>{p.overs ?? p.o ?? 0} ov</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>No bowling figures logged</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2ND INNINGS CARD */}
                <div style={{ background: '#0f172a', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #10b981, #3b82f6)' }}></div>
                  
                  {/* Innings 2 Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingLeft: '1.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>2ND INNINGS</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'white', letterSpacing: '0.5px' }}>
                        {inn2.team}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#10b981', lineHeight: '1' }}>
                        {inn2.totalRuns}/{inn2.wickets}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700', marginTop: '0.2rem' }}>
                        {inn2.overs}
                      </div>
                    </div>
                  </div>

                  {/* Innings 2 Batting & Bowling Breakdown */}
                  <div className="mobile-col-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
                    {/* Top Batters */}
                    <div style={{ background: '#0b1329', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: '800', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
                        <Flame size={15} /> TOP BATTERS
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {inn2.topBatters.length > 0 ? (
                          inn2.topBatters.map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.45rem 0.75rem', borderRadius: '6px' }}>
                              <span style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '0.85rem' }}>{p.name || p.batter || p.player}</span>
                              <div>
                                <strong style={{ color: 'white', fontSize: '0.95rem' }}>{p.runs ?? p.r ?? 0}</strong>{' '}
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>({p.balls ?? p.b ?? 0})</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>No batting figures logged</div>
                        )}
                      </div>
                    </div>

                    {/* Top Bowlers */}
                    <div style={{ background: '#0b1329', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#3b82f6', fontWeight: '800', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
                        <Target size={15} /> TOP BOWLERS
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {inn2.topBowlers.length > 0 ? (
                          inn2.topBowlers.map((p, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.45rem 0.75rem', borderRadius: '6px' }}>
                              <span style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '0.85rem' }}>{p.name || p.bowler}</span>
                              <div>
                                <strong style={{ color: '#10b981', fontSize: '0.95rem' }}>{p.wickets ?? p.w ?? 0}/{p.runs ?? p.runs_conceded ?? p.r ?? 0}</strong>{' '}
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '4px' }}>{p.overs ?? p.o ?? 0} ov</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>No bowling figures logged</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RESULT FOOTER */}
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(11, 19, 41, 0.8))', 
                  border: '1px solid rgba(16, 185, 129, 0.4)', 
                  borderRadius: '12px', 
                  padding: '1rem 1.5rem', 
                  textAlign: 'center', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.75rem', 
                  boxShadow: '0 5px 20px rgba(16, 185, 129, 0.15)' 
                }}>
                  <Trophy size={22} color="#f59e0b" style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.5))' }} />
                  <div style={{ fontSize: '1.15rem', fontWeight: '900', color: 'white', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {matchResult.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Modal Footer Bar */}
              <div style={{ padding: '1rem 1.5rem', background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-end', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                <button
                  onClick={() => setSelectedMatch(null)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#e2e8f0',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:!bg-slate-700 hover:!text-white"
                >
                  Close Scorecard
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
