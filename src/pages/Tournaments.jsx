import React, { useState, useEffect } from 'react';
import { 
  Trophy, Calendar, MapPin, Award, CheckCircle2, ChevronRight, 
  ExternalLink, Activity, Zap, Flame, Target, BarChart3, Layers, 
  TrendingUp, FileText, X, UserCheck, Check, ArrowLeft, RefreshCw, AlertCircle 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Tournaments() {
  const [tournamentData, setTournamentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('ALL'); // 'POINTS_TABLE', 'MATCHES', 'LEADERBOARD', 'STATS', 'ALL'
  const [selectedGroupCode, setSelectedGroupCode] = useState('GROUP_C'); // 'GROUP_C', 'GROUP_A', 'GROUP_B', 'GROUP_D', 'ALL_GROUPS'
  const [leaderboardCategory, setLeaderboardCategory] = useState('ALL'); // 'ALL', 'BAT', 'BOWL', 'FIELD'
  const [selectedCompletedMatchId, setSelectedCompletedMatchId] = useState(null);
  const [showFullScorecardView, setShowFullScorecardView] = useState(false);
  const [showMatchSummaryModal, setShowMatchSummaryModal] = useState(false);

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/tournaments`);
        if (res.ok) {
          const data = await res.json();
          setTournamentData(data);
        } else {
          setTournamentData(null);
          setError("Failed to load tournament telemetry from API.");
        }
      } catch (err) {
        console.error("Error fetching tournament telemetry:", err);
        setTournamentData(null);
        setError("Unable to connect to FastAPI backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  const tournament = tournamentData?.tournament || {};
  const players = tournamentData?.players || [];
  const completedMatchScorecards = tournamentData?.completedMatchScorecards || {};
  const teams = tournamentData?.teams || tournament.teams || [];
  const schedule = tournamentData?.schedule || tournament.schedule || [];
  const groups = tournamentData?.groups || tournament.groups || [];

  const topBatters = [...players].filter(p => p.runs !== undefined && p.runs > 0).sort((a, b) => (b.runs || 0) - (a.runs || 0)).slice(0, 10);
  const topBowlers = [...players].filter(p => p.wickets !== undefined && p.wickets > 0).sort((a, b) => b.wickets - a.wickets).slice(0, 10);
  
  // OVERRIDE WITH OFFICIAL PDF SCORECARD METRICS FOR SILVER CAP
  const topFielders = [
    { name: 'Sivakaran Venujan', team: 'JAF', catches: 2, stumpings: 0, runOuts: 0 },
    { name: 'Patkunam Mathushan', team: 'JAF', catches: 2, stumpings: 0, runOuts: 0 },
    { name: 'Sahan Siriwardana', team: 'VAV', catches: 2, stumpings: 0, runOuts: 0 },
    { name: 'Lahiru Welagedara', team: 'VAV', catches: 1, stumpings: 0, runOuts: 1 },
    { name: 'Pahan Bimsara', team: 'VAV', catches: 1, stumpings: 0, runOuts: 0 },
    { name: 'K Siyanujan', team: 'JAF', catches: 1, stumpings: 0, runOuts: 0 },
    { name: 'V Priyankan', team: 'JAF', catches: 1, stumpings: 0, runOuts: 0 },
    { name: 'Ravichandran Ragulan', team: 'VAV', catches: 1, stumpings: 0, runOuts: 0 },
    { name: 'Rashan Wijerathna', team: 'VAV', catches: 0, stumpings: 0, runOuts: 1 },
  ].sort((a, b) => ((b.catches + b.stumpings + b.runOuts) - (a.catches + a.stumpings + a.runOuts))).slice(0, 3);

  const activeScorecard = selectedCompletedMatchId ? completedMatchScorecards[selectedCompletedMatchId] : null;

  const groupC = groups.find(g => g.code === 'GROUP_C') || { teams: [] };
  const uomTeam = groupC.teams ? (groupC.teams.find(t => t.code === 'UOM') || { played: 0, won: 0, lost: 0, points: 0, nrr: '0.000' }) : { played: 0, won: 0, lost: 0, points: 0, nrr: '0.000' };

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
            Official 4-Group League Standings, Net Run Rates, Qualification Scenarios & Past Match Scoreboards
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
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span>PARTICIPATING UNIVERSITIES</span>
            <div className="stat-icon"><Trophy size={20} color="#dc2626" /></div>
          </div>
          <div className="stat-value">{teams.length || tournament.totalTeams || 16} Universities</div>
          <div className="stat-change positive">
            4 League Groups (Groups A, B, C, D)
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>OUR MORATUWA TEAM (GROUP C)</span>
            <div className="stat-icon"><Target size={20} color="#dc2626" /></div>
          </div>
          <div className="stat-value" style={{ color: '#dc2626' }}>
            {uomTeam.played > 0 ? `${uomTeam.points} Pts (${uomTeam.nrr} NRR)` : '0 Matches Played'}
          </div>
          <div className="stat-change positive">
            {uomTeam.won} Won, {uomTeam.lost} Lost • {uomTeam.points} Points (Group C)
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>CHAMPIONSHIP MATCHES INGESTED</span>
            <div className="stat-icon"><Activity size={20} color="var(--accent-green)" /></div>
          </div>
          <div className="stat-value">1 / 32 Matches</div>
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
          SECTION 1: CRICHEROES 4-GROUP LEAGUE STANDINGS
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
                Sri Lanka University Cricket Championship 2026 • Official CricHeroes Points Table & Net Run Rates
              </p>
            </div>

            {/* Group Tab Selector Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedGroupCode('GROUP_C')}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  border: selectedGroupCode === 'GROUP_C' ? '2px solid #dc2626' : '1px solid var(--border-color)',
                  background: selectedGroupCode === 'GROUP_C' ? 'rgba(220, 38, 38, 0.2)' : 'var(--bg-subtle)',
                  color: selectedGroupCode === 'GROUP_C' ? 'white' : 'var(--text-secondary)',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Target size={14} color="#dc2626" /> Group C (Moratuwa)
              </button>

              <button
                onClick={() => setSelectedGroupCode('GROUP_A')}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  border: selectedGroupCode === 'GROUP_A' ? '2px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  background: selectedGroupCode === 'GROUP_A' ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-subtle)',
                  color: selectedGroupCode === 'GROUP_A' ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Group A
              </button>

              <button
                onClick={() => setSelectedGroupCode('GROUP_B')}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  border: selectedGroupCode === 'GROUP_B' ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                  background: selectedGroupCode === 'GROUP_B' ? 'rgba(245, 158, 11, 0.2)' : 'var(--bg-subtle)',
                  color: selectedGroupCode === 'GROUP_B' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Group B
              </button>

              <button
                onClick={() => setSelectedGroupCode('GROUP_D')}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  border: selectedGroupCode === 'GROUP_D' ? '2px solid var(--accent-green)' : '1px solid var(--border-color)',
                  background: selectedGroupCode === 'GROUP_D' ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-subtle)',
                  color: selectedGroupCode === 'GROUP_D' ? 'var(--accent-green)' : 'var(--text-secondary)',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Group D
              </button>

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
                All 4 Groups Overview
              </button>
            </div>
          </div>

          {/* Group C Special Strategic Alert Widget */}
          {selectedGroupCode === 'GROUP_C' && (
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
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>4 Universities</span>
                </div>

                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '0.75rem 1rem', width: '40px' }}>#</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Team</th>
                        <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>M</th>
                        <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>W</th>
                        <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>L</th>
                        <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>D</th>
                        <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>T</th>
                        <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>NR</th>
                        <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>NRR</th>
                        <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>For</th>
                        <th style={{ padding: '0.75rem 0.75rem', textAlign: 'center' }}>Against</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Pt.</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Last 5</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grp.teams.map((tm, idx) => {
                        const isUOM = tm.code === 'UOM' || tm.isPrimary;
                        return (
                          <tr 
                            key={tm.code || tm.name} 
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
                            <td style={{ textAlign: 'center', fontWeight: '700' }}>{tm.played}</td>
                            <td style={{ textAlign: 'center', color: 'var(--accent-green)', fontWeight: '800' }}>{tm.won}</td>
                            <td style={{ textAlign: 'center', color: tm.lost > 0 ? '#ef4444' : 'var(--text-muted)' }}>{tm.lost}</td>
                            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{tm.draw || 0}</td>
                            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{tm.tie || 0}</td>
                            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{tm.nr || 0}</td>
                            <td style={{ textAlign: 'center', fontWeight: '800', color: tm.nrr.startsWith('+') ? 'var(--accent-green)' : tm.nrr === '0.000' || tm.nrr === '0' ? 'var(--text-muted)' : '#ef4444' }}>
                              <span style={{ background: tm.nrr.startsWith('+') ? 'rgba(16, 185, 129, 0.15)' : tm.nrr === '0.000' || tm.nrr === '0' ? 'transparent' : 'rgba(239, 68, 68, 0.15)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                                {tm.nrr}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{tm.for || '-'}</td>
                            <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{tm.against || '-'}</td>
                            <td style={{ textAlign: 'center', fontWeight: '900', fontSize: '1rem', color: isUOM ? '#dc2626' : 'var(--accent-gold)' }}>
                              {tm.points}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                {tm.last5 && tm.last5.length > 0 ? (
                                  tm.last5.map((res, i) => (
                                    <span key={i} style={{ width: '18px', height: '18px', borderRadius: '50%', background: res === 'W' ? '#10b981' : '#ef4444', color: 'white', fontSize: '0.65rem', fontWeight: '900', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>2. Championship Match Fixtures & Past Scoreboards</h2>
          </div>

          {schedule.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {schedule.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    background: item.status === 'NEXT_TARGET' ? 'rgba(220, 38, 38, 0.15)' : 'var(--bg-card)',
                    border: item.status === 'NEXT_TARGET' ? '2px solid #dc2626' : '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between'
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
                      onClick={() => {
                        setShowFullScorecardView(false);
                        setShowMatchSummaryModal(true);
                        setSelectedCompletedMatchId(item.id);
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
                        justify: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <FileText size={16} /> View Match Scoreboard
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

          <div style={{ display: 'grid', gridTemplateColumns: leaderboardCategory === 'ALL' ? 'repeat(auto-fit, minmax(340px, 1fr))' : '1fr', gap: '1.5rem' }}>
            
            {/* 1. Batting Leaderboard */}
            {(leaderboardCategory === 'ALL' || leaderboardCategory === 'BAT') && (
              <div className="content-card" style={{ borderTop: '4px solid var(--accent-gold)', borderRadius: '14px' }}>
                <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Flame size={20} color="var(--accent-gold)" />
                    <span style={{ fontSize: '1rem', fontWeight: '800' }}>Orange Cap - Leading Batsmen (Bat)</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>TOP RUNS</span>
                </div>

                {topBatters.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Batter</th>
                        <th style={{ textAlign: 'left' }}>Team</th>
                        <th style={{ textAlign: 'right' }}>Runs</th>
                        <th style={{ textAlign: 'right' }}>HS</th>
                        <th style={{ textAlign: 'right' }}>SR</th>
                        <th style={{ textAlign: 'right' }}>4s/6s</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topBatters.map((b, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.65rem 0', fontWeight: '700' }}>
                            <span style={{ marginRight: '0.4rem', color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#d97706' : 'var(--text-muted)', fontWeight: '800' }}>#{idx + 1}</span> {b.name}
                          </td>
                          <td><span className="badge">{b.team}</span></td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--accent-gold)', fontSize: '1rem' }}>{b.runs}</td>
                          <td style={{ textAlign: 'right', fontWeight: '700' }}>{b.hs || b.runs}</td>
                          <td style={{ textAlign: 'right', fontWeight: '700' }}>{b.sr || '0.0'}</td>
                          <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{b.fours || 0}/{b.sixes || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <div className="content-card" style={{ borderTop: '4px solid var(--accent-blue)', borderRadius: '14px' }}>
                <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target size={20} color="var(--accent-blue)" />
                    <span style={{ fontSize: '1rem', fontWeight: '800' }}>Purple Cap - Top Wicket Takers (Bowl)</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>MOST WICKETS</span>
                </div>

                {topBowlers.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Bowler</th>
                        <th style={{ textAlign: 'left' }}>Team</th>
                        <th style={{ textAlign: 'right' }}>Wkts</th>
                        <th style={{ textAlign: 'right' }}>Best</th>
                        <th style={{ textAlign: 'right' }}>Econ</th>
                        <th style={{ textAlign: 'right' }}>Overs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topBowlers.map((bw, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.65rem 0', fontWeight: '700' }}>
                            <span style={{ marginRight: '0.4rem', color: idx === 0 ? '#3b82f6' : 'var(--text-muted)', fontWeight: '800' }}>#{idx + 1}</span> {bw.name}
                          </td>
                          <td><span className="badge">{bw.team}</span></td>
                          <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--accent-green)', fontSize: '1rem' }}>{bw.wickets}</td>
                          <td style={{ textAlign: 'right', fontWeight: '700' }}>{bw.bb || `${bw.wickets}/0`}</td>
                          <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--accent-gold)' }}>{bw.econ || '0.00'}</td>
                          <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{bw.overs || '0.0'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              <div className="content-card" style={{ borderTop: '4px solid var(--accent-green)', borderRadius: '14px' }}>
                <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserCheck size={20} color="var(--accent-green)" />
                    <span style={{ fontSize: '1rem', fontWeight: '800' }}>Silver Glove - Top Fielders (Field)</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>DISMISSALS</span>
                </div>

                {topFielders.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Fielder</th>
                        <th style={{ textAlign: 'left' }}>Team</th>
                        <th style={{ textAlign: 'right' }}>Catches</th>
                        <th style={{ textAlign: 'right' }}>Stumpings</th>
                        <th style={{ textAlign: 'right' }}>Run Outs</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topFielders.map((fd, idx) => {
                        const totalDismissals = (fd.catches || 0) + (fd.stumpings || 0) + (fd.runOuts || 0);
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.65rem 0', fontWeight: '700' }}>
                              <span style={{ marginRight: '0.4rem', color: idx === 0 ? '#10b981' : 'var(--text-muted)', fontWeight: '800' }}>#{idx + 1}</span> {fd.name}
                            </td>
                            <td><span className="badge">{fd.team}</span></td>
                            <td style={{ textAlign: 'right', fontWeight: '700' }}>{fd.catches || 0}</td>
                            <td style={{ textAlign: 'right', fontWeight: '700' }}>{fd.stumpings || 0}</td>
                            <td style={{ textAlign: 'right', fontWeight: '700' }}>{fd.runOuts || 0}</td>
                            <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--accent-green)', fontSize: '1rem' }}>{totalDismissals}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
        // OVERRIDE WITH OFFICIAL PDF SCORECARD METRICS
        const totalMatchesCount = "1";
        const totalInnings = "2";
        const totalRuns = 362;
        const totalWickets = 20;
        const totalBalls = 435;
        const totalExtras = 31;
        const totalFours = 34;
        const totalSixes = 13;
        const totalFifties = 1;
        const totalHundreds = 0;
        const fiftyPartnerships = 1;
        const hundredPartnerships = 1;
        const totalMaidens = 7;
        const totalDotBalls = 291;
        const totalCatches = 12;
        const totalStumpings = 0;
        const bdryPct = "59.12";
        const bdryFreq = "9.26";
        const dbFreq = "1.49";
        const dbPct = "66.90";

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

            {/* UniCric Signature Telemetry Cards Grid (20 Individual Metric Cards) */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              
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
                  Across All Ingested PDF Scorecards
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

      {/* ========================================================
          FULL SCREEN INTERACTIVE MATCH SCOREBOARD VIEW
      ======================================================== */}
      {activeScorecard && showMatchSummaryModal && !showFullScorecardView && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11, 19, 41, 0.92)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: '750px', fontFamily: '"Arial", sans-serif', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }}>
            
            {/* Header */}
            <div style={{ background: '#d90479', color: 'white', padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900', letterSpacing: '1.5px' }}>MATCH SUMMARY</h2>
                <div style={{ fontSize: '0.85rem', fontStyle: 'italic', fontWeight: 'bold', letterSpacing: '0.5px' }}>UNIVERSITY OF JAFFNA, 2026</div>
              </div>
              <div style={{ background: '#eab308', padding: '0.4rem 1rem', color: 'black', fontWeight: '900', fontSize: '1.2rem', transform: 'skew(-10deg)', borderLeft: '4px solid #16a34a' }}>
                <div style={{ transform: 'skew(10deg)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Trophy size={20} /> UniCric
                </div>
              </div>
            </div>

            {/* Team 1 Banner */}
            <div style={{ display: 'flex', background: '#d90479', color: 'white', padding: '0', alignItems: 'stretch', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', textTransform: 'uppercase', padding: '0.4rem 1.5rem', display: 'flex', alignItems: 'center' }}>
                JAFFNA UNIVERSITY
              </div>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', padding: '0 1rem', display: 'flex', alignItems: 'center' }}>OVERS 50.0</div>
                <div style={{ background: '#032e6b', padding: '0.4rem 1.25rem', fontSize: '1.7rem', fontWeight: '900', color: 'white', borderLeft: '4px solid white', display: 'flex', alignItems: 'center' }}>
                  271-10
                </div>
              </div>
            </div>

            {/* Team 1 Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#e2e8f0', gap: '2px', padding: '0 2px 2px 2px' }}>
              {/* Batters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[ 
                  { name: 'ASHMIKA', runs: 79, balls: '81' },
                  { name: 'SIVARUBAN', runs: 33, balls: '42' },
                  { name: 'SHANMUGANATHAN', runs: 26, balls: '28' }
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.75rem', background: 'white', color: '#0f172a', fontWeight: '900' }}>
                    <span style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>{p.name}</span>
                    <div><span style={{ fontSize: '1.2rem' }}>{p.runs}</span> <span style={{ color: '#475569', fontSize: '0.85rem' }}>({p.balls})</span></div>
                  </div>
                ))}
              </div>
              {/* Bowlers (VAV) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[ 
                  { name: 'RIWAQI', fig: '2-38', ov: '8.0' },
                  { name: 'NHARTHANAN', fig: '1-32', ov: '6.0' },
                  { name: 'RAGULAN', fig: '1-16', ov: '5.0' }
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.75rem', background: 'white', color: '#0f172a', fontWeight: '900' }}>
                    <span style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>{p.name}</span>
                    <div><span style={{ fontSize: '1.2rem' }}>{p.fig}</span> <span style={{ color: '#475569', fontSize: '0.85rem', marginLeft: '2px' }}>{p.ov}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team 2 Banner */}
            <div style={{ display: 'flex', background: '#d90479', color: 'white', padding: '0', alignItems: 'stretch', justifyContent: 'space-between', marginTop: '0.5rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', textTransform: 'uppercase', padding: '0.4rem 1.5rem', display: 'flex', alignItems: 'center' }}>
                VAVUNIYA UNIVERSITY
              </div>
              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', padding: '0 1rem', display: 'flex', alignItems: 'center' }}>OVERS 22.3</div>
                <div style={{ background: '#032e6b', padding: '0.4rem 1.25rem', fontSize: '1.7rem', fontWeight: '900', color: 'white', borderLeft: '4px solid white', display: 'flex', alignItems: 'center' }}>
                  91-10
                </div>
              </div>
            </div>

            {/* Team 2 Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#e2e8f0', gap: '2px', padding: '0 2px 2px 2px' }}>
              {/* Batters */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[ 
                  { name: 'LAHIRU', runs: 35, balls: '31' },
                  { name: 'RASHAN', runs: 23, balls: '28' },
                  { name: 'RIWAQI', runs: 11, balls: '9' }
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.75rem', background: 'white', color: '#0f172a', fontWeight: '900' }}>
                    <span style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>{p.name}</span>
                    <div><span style={{ fontSize: '1.2rem' }}>{p.runs}</span> <span style={{ color: '#475569', fontSize: '0.85rem' }}>({p.balls})</span></div>
                  </div>
                ))}
              </div>
              {/* Bowlers (JAF) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {[ 
                  { name: 'NIROSHAN', fig: '4-16', ov: '5.3' },
                  { name: 'DESVIN', fig: '3-8', ov: '6.0' },
                  { name: 'MATHUSHAN', fig: '1-11', ov: '3.0' }
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.75rem', background: 'white', color: '#0f172a', fontWeight: '900' }}>
                    <span style={{ fontStyle: 'italic', fontSize: '1.1rem' }}>{p.name}</span>
                    <div><span style={{ fontSize: '1.2rem' }}>{p.fig}</span> <span style={{ color: '#475569', fontSize: '0.85rem', marginLeft: '2px' }}>{p.ov}</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Result Footer */}
            <div style={{ background: '#032e6b', padding: '0.75rem', textAlign: 'center', marginTop: '0.5rem', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
              <div style={{ fontSize: '1.1rem', fontStyle: 'italic', fontWeight: '900', color: 'white', letterSpacing: '1px', textTransform: 'uppercase' }}>
                JAFFNA UNIVERSITY WON BY 180 RUNS
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button 
                onClick={() => {
                  setShowMatchSummaryModal(false);
                  setShowFullScorecardView(true);
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
              >
                <FileText size={18} /> View Full Scoreboard
              </button>
              
              <button 
                onClick={() => {
                  setShowMatchSummaryModal(false);
                  setSelectedCompletedMatchId(null);
                }}
                style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <X size={18} /> Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeScorecard && showFullScorecardView && (
        <div style={{ position: 'fixed', inset: 0, background: '#0b1329', zIndex: 99999, overflowY: 'auto', padding: '1.5rem 1rem' }}>
          
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Top Back Action Button */}
            <button 
              onClick={() => {
                setShowFullScorecardView(false);
                setShowMatchSummaryModal(true);
              }}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                background: 'linear-gradient(135deg, #dc2626, #991b1b)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                padding: '0.65rem 1.35rem', 
                fontWeight: '800', 
                fontSize: '0.9rem', 
                cursor: 'pointer',
                marginBottom: '1.25rem',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)'
              }}
            >
              <ArrowLeft size={18} /> Back to Championship Matches
            </button>

            <div style={{ background: '#132036', border: '1.5px solid #10b981', borderRadius: '14px', padding: '2rem 1.75rem', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)', color: '#ffffff' }}>
              
              {/* Scoreboard Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                    <Award size={14} /> COMPLETED MATCH SCOREBOARD
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{activeScorecard.title}</h2>
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{activeScorecard.date} • {activeScorecard.venue}</span>
                </div>
                
                <button 
                  onClick={() => {
                    setShowFullScorecardView(false);
                    setShowMatchSummaryModal(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem' }}
                >
                  <ArrowLeft size={16} /> Back to Summary
                </button>
              </div>

              {/* Result & POTM Banner */}
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#10b981' }}>{activeScorecard.result}</div>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{activeScorecard.toss}</span>
                </div>
                {activeScorecard.playerOfMatch && (
                  <div style={{ background: '#0f172a', padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={20} color="#f59e0b" />
                    <div>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', display: 'block', fontWeight: '700' }}>PLAYER OF THE MATCH</span>
                      <strong style={{ fontSize: '0.85rem', color: '#f59e0b' }}>{activeScorecard.playerOfMatch.name}</strong> ({activeScorecard.playerOfMatch.performance})
                    </div>
                  </div>
                )}
              </div>

              {/* Inning Tables */}
              <div style={{ marginBottom: '1.5rem' }}>
                
                {/* 1ST INNINGS */}
                {activeScorecard?.innings1 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '0.65rem 1rem', borderRadius: '6px 6px 0 0', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontWeight: '800', color: '#dc2626' }}>1ST INNINGS BATTING: {activeScorecard.innings1.team}</span>
                    <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'white' }}>{activeScorecard.innings1.score} ({activeScorecard.innings1.overs})</span>
                  </div>
                  
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', background: '#0f172a' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                          <th style={{ padding: '0.6rem' }}>Batter</th>
                          <th>Dismissal</th>
                          <th style={{ textAlign: 'right' }}>Runs</th>
                          <th style={{ textAlign: 'right' }}>Balls</th>
                          <th style={{ textAlign: 'right' }}>4s / 6s</th>
                          <th style={{ textAlign: 'right', paddingRight: '0.6rem' }}>SR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeScorecard.innings1.batting?.map((c, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.5rem 0.6rem', fontWeight: '700' }}>{c.player}</td>
                            <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.dismissal}</td>
                            <td style={{ textAlign: 'right', fontWeight: '800', color: '#f59e0b' }}>{c.runs}</td>
                            <td style={{ textAlign: 'right' }}>{c.balls}</td>
                            <td style={{ textAlign: 'right' }}>{c.fours} / {c.sixes}</td>
                            <td style={{ textAlign: 'right', fontWeight: '700', paddingRight: '0.6rem' }}>{c.sr}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ background: '#0b1329', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: '800', color: '#3b82f6', borderLeft: '3px solid #3b82f6', marginTop: '0.5rem' }}>
                    1ST INNINGS BOWLING ANALYSIS
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', background: '#0f172a' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                          <th style={{ padding: '0.6rem' }}>Bowler</th>
                          <th style={{ textAlign: 'right' }}>Overs</th>
                          <th style={{ textAlign: 'right' }}>Maidens</th>
                          <th style={{ textAlign: 'right' }}>Runs</th>
                          <th style={{ textAlign: 'right' }}>Wickets</th>
                          <th style={{ textAlign: 'right', paddingRight: '0.6rem' }}>Economy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeScorecard.innings1.bowling?.map((c, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.5rem 0.6rem', fontWeight: '700' }}>{c.bowler}</td>
                            <td style={{ textAlign: 'right' }}>{c.overs}</td>
                            <td style={{ textAlign: 'right' }}>{c.maidens}</td>
                            <td style={{ textAlign: 'right' }}>{c.runs}</td>
                            <td style={{ textAlign: 'right', fontWeight: '800', color: '#10b981' }}>{c.wickets}</td>
                            <td style={{ textAlign: 'right', fontWeight: '700', color: '#f59e0b', paddingRight: '0.6rem' }}>{c.econ}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}

                {/* 2ND INNINGS */}
                {activeScorecard?.innings2 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '0.65rem 1rem', borderRadius: '6px 6px 0 0', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontWeight: '800', color: '#10b981' }}>2ND INNINGS BATTING: {activeScorecard.innings2.team}</span>
                    <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'white' }}>{activeScorecard.innings2.score} ({activeScorecard.innings2.overs})</span>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', background: '#0f172a' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                          <th style={{ padding: '0.6rem' }}>Batter</th>
                          <th>Dismissal</th>
                          <th style={{ textAlign: 'right' }}>Runs</th>
                          <th style={{ textAlign: 'right' }}>Balls</th>
                          <th style={{ textAlign: 'right' }}>4s / 6s</th>
                          <th style={{ textAlign: 'right', paddingRight: '0.6rem' }}>SR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeScorecard.innings2.batting?.map((c, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.5rem 0.6rem', fontWeight: '700' }}>{c.player}</td>
                            <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{c.dismissal}</td>
                            <td style={{ textAlign: 'right', fontWeight: '800', color: '#f59e0b' }}>{c.runs}</td>
                            <td style={{ textAlign: 'right' }}>{c.balls}</td>
                            <td style={{ textAlign: 'right' }}>{c.fours} / {c.sixes}</td>
                            <td style={{ textAlign: 'right', fontWeight: '700', paddingRight: '0.6rem' }}>{c.sr}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ background: '#0b1329', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: '800', color: '#3b82f6', borderLeft: '3px solid #3b82f6', marginTop: '0.5rem' }}>
                    2ND INNINGS BOWLING ANALYSIS
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem', background: '#0f172a' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                          <th style={{ padding: '0.6rem' }}>Bowler</th>
                          <th style={{ textAlign: 'right' }}>Overs</th>
                          <th style={{ textAlign: 'right' }}>Maidens</th>
                          <th style={{ textAlign: 'right' }}>Runs</th>
                          <th style={{ textAlign: 'right' }}>Wickets</th>
                          <th style={{ textAlign: 'right', paddingRight: '0.6rem' }}>Economy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeScorecard.innings2.bowling?.map((c, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '0.5rem 0.6rem', fontWeight: '700' }}>{c.bowler}</td>
                            <td style={{ textAlign: 'right' }}>{c.overs}</td>
                            <td style={{ textAlign: 'right' }}>{c.maidens}</td>
                            <td style={{ textAlign: 'right' }}>{c.runs}</td>
                            <td style={{ textAlign: 'right', fontWeight: '800', color: '#10b981' }}>{c.wickets}</td>
                            <td style={{ textAlign: 'right', fontWeight: '700', color: '#f59e0b', paddingRight: '0.6rem' }}>{c.econ}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}

              </div>

              {/* Bottom Back & Actions Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                <button 
                  onClick={() => {
                    setShowFullScorecardView(false);
                    setShowMatchSummaryModal(true);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #dc2626, #991b1b)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)' }}
                >
                  <ArrowLeft size={18} /> Back to Summary
                </button>
                
                <button 
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ padding: '0.75rem 1.25rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' }}
                >
                  Scroll to Top ↑
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

        </>
      )}

    </div>
  );
}
