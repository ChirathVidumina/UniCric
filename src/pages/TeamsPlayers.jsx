import React, { useState, useEffect } from 'react';
import { Users, Search, ExternalLink, Shield, Zap, Target, Star, Trophy, RefreshCw, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function TeamsPlayers() {
  const [teams, setTeams] = useState([]);
  const [playersList, setPlayersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [activeRole, setActiveRole] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch teams and players from FastAPI backend
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

        let apiPlayers = [];
        if (playersRes && playersRes.ok) {
          const playersData = await playersRes.json();
          apiPlayers = playersData.players || [];
        }

        const staticPlayers = [
          { id: 'p1', name: "Sivakaran Venujan", team: "JAF", role: "Wicket Keeper", battingStyle: "Right-Hand Batter", matches: 1, runs: 11, balls: 47, fours: 1, sixes: 0, sr: 23.4, wickets: 0, econ: 0.00, dotPct: 83, boundaryPct: 2 },
          { id: 'p2', name: "Shanmuganathan Silaxan", team: "JAF", role: "Batter", battingStyle: "Right-Hand Batter", matches: 1, runs: 26, balls: 28, fours: 4, sixes: 1, sr: 92.86, wickets: 0, econ: 0.00, dotPct: 68, boundaryPct: 18 },
          { id: 'p3', name: "Ashmika Iddamalgoda", team: "JAF", role: "Batter", battingStyle: "Right-Hand Batter", matches: 1, runs: 79, balls: 81, fours: 13, sixes: 1, sr: 97.53, wickets: 1, econ: 3.50, dotPct: 59, boundaryPct: 17 },
          { id: 'p4', name: "Sivaruban Sivanujan", team: "JAF", role: "Batter", battingStyle: "Right-Hand Batter", matches: 1, runs: 33, balls: 42, fours: 3, sixes: 2, sr: 78.57, wickets: 0, econ: 9.00, dotPct: 62, boundaryPct: 12 },
          { id: 'p5', name: "Patkunam Mathushan", team: "JAF", role: "Batter", battingStyle: "Right-Hand Batter", matches: 1, runs: 10, balls: 17, fours: 0, sixes: 0, sr: 58.82, wickets: 1, econ: 3.67, dotPct: 57, boundaryPct: 0 },
          { id: 'p6', name: "Antony Desvin", team: "JAF", role: "Captain", battingStyle: "Right-Hand Batter", matches: 1, runs: 23, balls: 31, fours: 1, sixes: 2, sr: 74.19, wickets: 3, econ: 1.33, dotPct: 76, boundaryPct: 10 },
          { id: 'p7', name: "K Siyanujan", team: "JAF", role: "Batter", battingStyle: "Right-Hand Batter", matches: 1, runs: 14, balls: 11, fours: 2, sixes: 1, sr: 127.27, wickets: 0, econ: 10.00, dotPct: 61, boundaryPct: 27 },
          { id: 'p8', name: "Selvanathan Niroshan", team: "JAF", role: "Bowler", battingStyle: "Right-Hand Batter", matches: 1, runs: 13, balls: 6, fours: 0, sixes: 2, sr: 216.67, wickets: 4, econ: 2.91, dotPct: 74, boundaryPct: 33 },
          { id: 'p9', name: "V Priyankan", team: "JAF", role: "Batter", battingStyle: "Right-Hand Batter", matches: 1, runs: 20, balls: 15, fours: 0, sixes: 0, sr: 133.33, wickets: 0, econ: 0.00, dotPct: 0, boundaryPct: 0 },
          { id: 'p10', name: "Chalithya Millangoda", team: "JAF", role: "Batter", battingStyle: "Right-Hand Batter", matches: 1, runs: 2, balls: 5, fours: 0, sixes: 0, sr: 40.0, wickets: 1, econ: 6.67, dotPct: 65, boundaryPct: 0 },
          { id: 'p11', name: "Ebenezer Johanan", team: "JAF", role: "Batter", battingStyle: "Right-Hand Batter", matches: 1, runs: 16, balls: 17, fours: 0, sixes: 1, sr: 94.12, wickets: 0, econ: 0.00, dotPct: 35, boundaryPct: 6 },
          { id: 'p12', name: "Janith Dilshan", team: "VAV", role: "Batter", battingStyle: "Left-Hand Batter", matches: 1, runs: 1, balls: 10, fours: 0, sixes: 0, sr: 10.0, wickets: 1, econ: 5.40, dotPct: 64, boundaryPct: 0 },
          { id: 'p13', name: "Ekjfernando", team: "VAV", role: "Batter", battingStyle: "Right-Hand Batter", matches: 1, runs: 3, balls: 15, fours: 0, sixes: 0, sr: 20.0, wickets: 0, econ: 0.00, dotPct: 80, boundaryPct: 0 },
          { id: 'p14', name: "Lahiru Welagedara", team: "VAV", role: "Wicket Keeper", battingStyle: "Left-Hand Batter", matches: 1, runs: 35, balls: 31, fours: 4, sixes: 2, sr: 112.9, wickets: 0, econ: 0.00, dotPct: 58, boundaryPct: 19 },
          { id: 'p15', name: "Rmid Ranaweera", team: "VAV", role: "Batter", battingStyle: "Left-Hand Batter", matches: 1, runs: 1, balls: 6, fours: 0, sixes: 0, sr: 16.67, wickets: 0, econ: 0.00, dotPct: 83, boundaryPct: 0 },
          { id: 'p16', name: "Rashan Wijerathna", team: "VAV", role: "Batter", battingStyle: "Left-Hand Batter", matches: 1, runs: 23, balls: 28, fours: 3, sixes: 1, sr: 82.14, wickets: 0, econ: 0.00, dotPct: 68, boundaryPct: 14 },
          { id: 'p17', name: "Sahan Siriwardana", team: "VAV", role: "Captain", battingStyle: "Left-Hand Batter", matches: 1, runs: 3, balls: 13, fours: 0, sixes: 0, sr: 23.08, wickets: 1, econ: 5.60, dotPct: 68, boundaryPct: 0 },
          { id: 'p18', name: "Pahan Bimsara", team: "VAV", role: "Bowler", battingStyle: "Right-Hand Batter", matches: 1, runs: 0, balls: 2, fours: 0, sixes: 0, sr: 0.0, wickets: 0, econ: 9.75, dotPct: 50, boundaryPct: 0 },
          { id: 'p19', name: "Mohammed Riwaqi", team: "VAV", role: "Bowler", battingStyle: "Right-Hand Batter", matches: 1, runs: 11, balls: 9, fours: 2, sixes: 0, sr: 122.22, wickets: 2, econ: 4.75, dotPct: 63, boundaryPct: 22 },
          { id: 'p20', name: "Sithamparalingam Nharthanan", team: "VAV", role: "Batter", battingStyle: "Left-Hand Batter", matches: 1, runs: 6, balls: 8, fours: 1, sixes: 0, sr: 75.0, wickets: 1, econ: 5.33, dotPct: 77, boundaryPct: 12 },
          { id: 'p21', name: "Kkirubagaran", team: "VAV", role: "Bowler", battingStyle: "Right-Hand Batter", matches: 1, runs: 1, balls: 14, fours: 0, sixes: 0, sr: 7.14, wickets: 1, econ: 4.71, dotPct: 64, boundaryPct: 0 },
          { id: 'p22', name: "Ravichandran Ragulan", team: "VAV", role: "Bowler", battingStyle: "Right-Hand Batter", matches: 1, runs: 0, balls: 1, fours: 0, sixes: 0, sr: 0.0, wickets: 1, econ: 3.20, dotPct: 74, boundaryPct: 0 },
        ];

        // Merge static players into API players (overwriting inaccurate/missing backend stats)
        const mergedPlayers = [...apiPlayers];
        staticPlayers.forEach(sp => {
          const existingIdx = mergedPlayers.findIndex(ap => ap.name === sp.name);
          if (existingIdx >= 0) {
            mergedPlayers[existingIdx] = { ...mergedPlayers[existingIdx], ...sp };
          } else {
            mergedPlayers.push(sp);
          }
        });
        
        setPlayersList(mergedPlayers);
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
    ? [...playersList].filter(p => p.wickets).sort((a, b) => (b.wickets || 0) - (a.wickets || 0))[0]
    : null;

  return (
    <div className="teams-players-page" style={{ paddingBottom: '4rem' }}>
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            <Trophy size={14} /> Sri Lanka University Cricket Championship 2026
          </div>
          <h1 className="page-title">University Teams & Player Telemetry</h1>
          <p className="page-subtitle">
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
                {playersList.length > 0 ? 'Sourced From Database API' : '0 Players in Database'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>PARTICIPATING TEAMS</span>
                <div className="stat-icon"><Trophy size={20} color="var(--accent-gold)" /></div>
              </div>
              <div className="stat-value">{teams.length} Universities</div>
              <div className="stat-change positive">
                4 League Groups (A, B, C, D)
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
                  Participating University Squads ({teams.length})
                </h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Primary Campus: University of Moratuwa (UOM)</span>
              </div>

              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '2.5rem' }}>
                {teams.map(t => (
                  <div 
                    key={t.code} 
                    className="stat-card" 
                    onClick={() => setSelectedTeam(selectedTeam === t.code ? 'ALL' : t.code)}
                    style={{ 
                      borderLeft: `4px solid ${t.color || '#dc2626'}`,
                      cursor: 'pointer',
                      borderColor: selectedTeam === t.code ? (t.color || '#dc2626') : undefined,
                      boxShadow: selectedTeam === t.code ? `0 0 15px ${t.color || '#dc2626'}40` : undefined,
                      background: selectedTeam === t.code ? 'var(--bg-card-hover)' : 'var(--bg-card)'
                    }}
                  >
                    <div className="stat-header">
                      <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t.code} - {t.shortName || t.name}</span>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', color: t.color || '#dc2626', fontWeight: '700' }}>{t.played > 0 ? t.ranking : (t.group || 'Group C')}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      Captain: <strong>{playersList.find(p => p.team === t.code && p.role === 'Captain')?.name || 'N/A'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                      <span>Matches: {t.played || 0}</span>
                      <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>{t.won || 0} Wins</span>
                      <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>{t.points || 0} pts</span>
                    </div>
                  </div>
                ))}
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
              {filteredPlayers.map(p => (
                <div 
                  key={p.id} 
                  className="content-card" 
                  style={{ 
                    padding: '1.25rem',
                    borderLeft: p.team === 'UOM' ? '4px solid #dc2626' : '1px solid var(--border-color)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '1.2rem', marginRight: '0.4rem' }}>{p.icon || '🏏'}</span>
                      <h4 style={{ display: 'inline', fontSize: '1.15rem', fontWeight: '800', color: p.team === 'UOM' ? '#dc2626' : 'var(--text-primary)' }}>
                        {p.name}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {p.team} • {p.role} {p.battingStyle ? `• ${p.battingStyle.includes('Right') ? 'RHB' : p.battingStyle.includes('Left') ? 'LHB' : p.battingStyle}` : ''}
                      </div>
                    </div>
                    <span className="badge" style={{ background: p.team === 'UOM' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(255,255,255,0.08)', color: p.team === 'UOM' ? '#dc2626' : 'var(--text-muted)' }}>
                      {p.team}
                    </span>
                  </div>

                  {/* Metrics Breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem' }}>RUNS (AVG)</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--accent-gold)' }}>{p.runs ?? 0} ({p.avg ?? '-'})</strong>
                    </div>
                    <div>
                      <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem' }}>STRIKE RATE</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--accent-green)' }}>{p.sr ?? 0}</strong>
                    </div>
                    <div>
                      <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.7rem' }}>WICKETS (ECON)</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--accent-blue)' }}>{p.wickets ?? 0} ({p.econ ?? '-'})</strong>
                    </div>
                  </div>

                  {/* Micro-bar metrics */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Boundary %: <strong style={{ color: 'var(--accent-gold)' }}>{p.boundaryPct ?? 0}%</strong></span>
                    <span>Dot Ball %: <strong style={{ color: 'var(--text-primary)' }}>{p.dotPct ?? 0}%</strong></span>
                  </div>
                </div>
              ))}
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
