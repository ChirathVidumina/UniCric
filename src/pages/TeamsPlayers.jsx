import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Zap, Target, Trophy, RefreshCw, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function TeamsPlayers() {
  const [teams, setTeams] = useState([]);
  const [playersList, setPlayersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [activeRole, setActiveRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch teams and players dynamically from FastAPI backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [teamsRes, playersRes] = await Promise.all([
          fetch(`${API_URL}/api/teams`).catch(() => null),
          fetch(`${API_URL}/api/players`).catch(() => null)
        ]);

        if (teamsRes && teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTeams(teamsData.teams || []);
        } else {
          setTeams([]);
        }

        if (playersRes && playersRes.ok) {
          const playersData = await playersRes.json();
          setPlayersList(playersData.players || []);
        } else {
          setPlayersList([]);
        }
      } catch (err) {
        console.error("Error fetching teams/players from API:", err);
        setError("Failed to connect to FastAPI backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPlayers = playersList.filter(p => {
    const matchesTeam = selectedTeam === 'ALL' || p.team === selectedTeam;
    const matchesRole = activeRole === 'All' || (p.role && p.role.toLowerCase().includes(activeRole.toLowerCase()));
    const matchesSearch = (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
                          (p.team && p.team.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTeam && matchesRole && matchesSearch;
  });

  const orangeCapLeader = playersList && playersList.length > 0
    ? [...playersList].sort((a, b) => (b.runs || 0) - (a.runs || 0))[0]
    : null;

  const purpleCapLeader = playersList && playersList.length > 0
    ? [...playersList].filter(p => p.wickets > 0).sort((a, b) => (b.wickets || 0) - (a.wickets || 0))[0]
    : null;

  const getPlayerIcon = (role) => {
    if (!role) return '🏏';
    if (role.includes('All-Rounder')) return '⚔️';
    if (role.includes('Bowler')) return '⚾';
    if (role.includes('Wicket Keeper') || role.includes('WK')) return '🧤';
    return '🏏'; // Batter or Captain
  };

  return (
    <div className="teams-players-page" style={{ paddingBottom: '4rem' }}>
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            <Trophy size={14} /> Sri Lanka University Cricket Championship 2026
          </div>
          <h1 className="page-title">University Teams & Player Telemetry</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px' }}>
            Official Sri Lanka University Championship Telemetry Database • {playersList.length} Verified Player Profiles
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <RefreshCw className="animate-spin" size={28} color="#dc2626" />
          <span style={{ fontSize: '1rem', fontWeight: '700' }}>Loading university squads & player profiles...</span>
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '10px', color: '#ef4444', marginBottom: '2rem' }}>
          <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} /><br />
          <strong>Database Connection Warning:</strong> {error}<br />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ensure the FastAPI backend is running at {API_URL}</span>
        </div>
      ) : (
        <>
          {/* Primary KPI Grid */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-header">
                <span>VERIFIED PLAYERS</span>
                <div className="stat-icon"><Users size={20} color="#dc2626" /></div>
              </div>
              <div className="stat-value" style={{ color: '#dc2626' }}>{playersList.length} Players</div>
              <div className="stat-change positive">
                {playersList.length > 0 ? 'Sourced Dynamically From Database API' : '0 Players in Database'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>PARTICIPATING TEAMS</span>
                <div className="stat-icon"><Trophy size={20} color="var(--accent-gold)" /></div>
              </div>
              <div className="stat-value">{teams.length} Universities</div>
              <div className="stat-change positive">
                Active League Groups
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>ORANGE CAP LEADER</span>
                <div className="stat-icon"><Zap size={20} color="var(--accent-gold)" /></div>
              </div>
              <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--accent-gold)' }}>
                {orangeCapLeader ? orangeCapLeader.name : 'N/A'}
              </div>
              <div className="stat-change positive">
                {orangeCapLeader ? `${orangeCapLeader.runs} Runs (SR ${orangeCapLeader.sr || 0} • ${orangeCapLeader.team})` : 'No Batting Telemetry Logged'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>PURPLE CAP LEADER</span>
                <div className="stat-icon"><Target size={20} color="var(--accent-green)" /></div>
              </div>
              <div className="stat-value" style={{ fontSize: '1.25rem', color: 'var(--accent-green)' }}>
                {purpleCapLeader ? purpleCapLeader.name : 'N/A'}
              </div>
              <div className="stat-change positive">
                {purpleCapLeader ? `${purpleCapLeader.wickets} Wickets (Econ ${purpleCapLeader.econ || 0} • ${purpleCapLeader.team})` : 'No Bowling Telemetry Logged'}
              </div>
            </div>
          </div>

          {/* Featured National/University Teams Row */}
          {teams.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  🛡️ Participating University Squads ({teams.length})
                </h2>
                <select 
                  value={selectedTeam} 
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  style={{
                    padding: '0.4rem 1rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="ALL">All Squads</option>
                  {teams.map(t => (
                    <option key={t.code} value={t.code}>{t.name} ({t.shortName || t.code})</option>
                  ))}
                </select>
              </div>

              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2.5rem' }}>
                {teams.map(t => {
                  const isUOM = t.code === 'UOM' || t.code === 'MOR';
                  const teamPlayers = playersList.filter(p => p.team === t.code);
                  const captain = teamPlayers.find(p => p.role?.toLowerCase().includes('captain')) || teamPlayers[0];

                  return (
                    <div 
                      key={t.code} 
                      className="stat-card" 
                      onClick={() => setSelectedTeam(selectedTeam === t.code ? 'ALL' : t.code)}
                      style={{ 
                        borderLeft: isUOM ? '4px solid #dc2626' : '4px solid var(--accent-blue)',
                        cursor: 'pointer',
                        borderColor: selectedTeam === t.code ? '#dc2626' : undefined,
                        boxShadow: selectedTeam === t.code ? '0 0 15px rgba(220, 38, 38, 0.4)' : undefined,
                        background: selectedTeam === t.code ? 'var(--bg-card-hover)' : 'var(--bg-card)'
                      }}
                    >
                      <div className="stat-header">
                        <span style={{ fontWeight: '800', fontSize: '1.1rem', color: isUOM ? '#dc2626' : 'var(--text-primary)' }}>
                          {t.code} - {t.shortName || t.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', color: isUOM ? '#dc2626' : 'var(--text-muted)', fontWeight: '700' }}>
                          {t.group || 'League'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        Squad Size: <strong>{teamPlayers.length} Players</strong>
                      </div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                        Matches: {t.played || 0} | <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>{t.won || 0} Wins</span> | <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>{t.points || 0} pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Filter and Search Bar */}
          <div className="content-card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              
              {/* Role Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['All', 'Batter', 'Bowler', 'All-Rounder'].map(role => (
                  <button
                    key={role}
                    onClick={() => setActiveRole(role)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: activeRole === role ? '1px solid #dc2626' : '1px solid var(--border-color)',
                      background: activeRole === role ? 'rgba(220, 38, 38, 0.2)' : 'transparent',
                      color: activeRole === role ? 'white' : 'var(--text-secondary)',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text"
                  placeholder="Search player or team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem 0.55rem 2.4rem',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Player Telemetry Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Player Telemetry Profiles ({filteredPlayers.length})
            </h3>
          </div>

          {filteredPlayers.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {filteredPlayers.map(p => {
                const isUOM = p.team === 'UOM' || p.team === 'MOR';
                return (
                  <div 
                    key={p.id || p.name} 
                    className="content-card" 
                    style={{ 
                      padding: '1.25rem',
                      borderLeft: isUOM ? '4px solid #dc2626' : '1px solid var(--border-color)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '1.2rem', marginRight: '0.4rem' }}>{p.icon || getPlayerIcon(p.role)}</span>
                        <h4 style={{ display: 'inline', fontSize: '1.15rem', fontWeight: '800', color: isUOM ? '#dc2626' : 'var(--text-primary)' }}>
                          {p.name}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {p.team} • {p.role} {p.battingStyle ? `• ${p.battingStyle.includes('Right') ? 'RHB' : p.battingStyle.includes('Left') ? 'LHB' : p.battingStyle}` : ''}
                        </div>
                      </div>
                      <span className="badge" style={{ background: isUOM ? 'rgba(220, 38, 38, 0.15)' : 'rgba(255,255,255,0.08)', color: isUOM ? '#dc2626' : 'var(--text-muted)' }}>
                        {p.team}
                      </span>
                    </div>

                    {/* Metrics Breakdown (Batting | Bowling) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '0.75rem', background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                      
                      {/* Batting Column */}
                      <div>
                        <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.15rem' }}>RUNS</span>
                        <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--accent-gold)' }}>{p.runs ?? 0}</strong>
                        
                        <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.5rem', marginBottom: '0.15rem' }}>STRIKE RATE</span>
                        <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--accent-green)' }}>{p.sr ?? 0}</strong>

                        <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.5rem', marginBottom: '0.15rem' }}>BOUNDARY %</span>
                        <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--accent-gold)' }}>
                          {p.boundaryPct !== undefined ? p.boundaryPct : (p.runs > 0 ? Math.round((((p.fours || 0) * 4 + (p.sixes || 0) * 6) / p.runs) * 100) : 0)}%
                        </strong>
                      </div>

                      {/* Divider */}
                      <div style={{ background: 'var(--border-color)', width: '1px', height: '100%' }}></div>

                      {/* Bowling Column */}
                      <div>
                        <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.15rem' }}>WICKETS</span>
                        <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--accent-blue)' }}>{p.wickets ?? 0}</strong>
                        
                        <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.5rem', marginBottom: '0.15rem' }}>ECON</span>
                        <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--accent-blue)' }}>{p.econ !== undefined && p.econ !== null ? p.econ : '-'}</strong>
                        
                        <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '0.5rem', marginBottom: '0.15rem' }}>DOT BALLS%</span>
                        <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                          {p.bowlDotPct !== undefined ? p.bowlDotPct : (p.econ !== undefined && p.econ !== null && p.econ > 0 ? Math.max(0, Math.round(100 - (p.econ * 7.5))) : 0)}%
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No player profiles match your search criteria or team filter.
            </div>
          )}
        </>
      )}
    </div>
  );
}
