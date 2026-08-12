import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/cricviz.css';
import { 
  Target, 
  ShieldAlert, 
  Trophy, 
  Compass, 
  Flame, 
  Filter, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  RefreshCw, 
  Activity, 
  ArrowRight, 
  UserCheck, 
  ExternalLink, 
  Award, 
  FileText, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function UOMOppositionScout() {
  const navigate = useNavigate();

  // Dynamic state management
  const [scheduleTimeline, setScheduleTimeline] = useState([]);
  const [opponents, setOpponents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [venueData, setVenueData] = useState(null);
  const [opponentPlayers, setOpponentPlayers] = useState([]);
  const [playerWindowStats, setPlayerWindowStats] = useState(null);
  const [completedScorecard, setCompletedScorecard] = useState(null);

  // Selection states
  const [selectedOpponentId, setSelectedOpponentId] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [lastNMatches, setLastNMatches] = useState(3);
  const [selectedCompletedMatchId, setSelectedCompletedMatchId] = useState(null);
  const [showFullScorecardView, setShowFullScorecardView] = useState(false);

  // Loading states
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loadingOpponents, setLoadingOpponents] = useState(true);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingVenueData, setLoadingVenueData] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loadingPlayerForm, setLoadingPlayerForm] = useState(false);
  const [loadingScorecard, setLoadingScorecard] = useState(false);

  // Error states
  const [errorSchedule, setErrorSchedule] = useState(null);
  const [errorVenue, setErrorVenue] = useState(null);
  const [errorPlayers, setErrorPlayers] = useState(null);

  // 1. Fetch Opponents & Schedule on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingOpponents(true);
      setLoadingSchedule(true);

      try {
        const [oppRes, schedRes] = await Promise.all([
          fetch(`${API_URL}/api/opponents`).catch(() => null),
          fetch(`${API_URL}/api/schedule`).catch(() => null)
        ]);

        if (oppRes && oppRes.ok) {
          const oppData = await oppRes.json();
          const oppList = oppData.opponents || [];
          setOpponents(oppList);
          if (oppList.length > 0) {
            setSelectedOpponentId(oppList[0].id || oppList[0].code);
          }
        } else {
          setOpponents([]);
        }

        if (schedRes && schedRes.ok) {
          const schedData = await schedRes.json();
          setScheduleTimeline(schedData.schedule || []);
        } else {
          setScheduleTimeline([]);
        }
      } catch (err) {
        console.error("Error loading schedule or opponents:", err);
        setErrorSchedule("Failed to load schedule telemetry from server.");
      } finally {
        setLoadingOpponents(false);
        setLoadingSchedule(false);
      }
    };

    fetchInitialData();
  }, []);

  // 2. Fetch Venues List on mount
  useEffect(() => {
    const fetchVenues = async () => {
      setLoadingVenues(true);
      try {
        const res = await fetch(`${API_URL}/api/venues`);
        if (res.ok) {
          const data = await res.json();
          const venueList = data.venues || [];
          setVenues(venueList);
          if (venueList.length > 0) {
            setSelectedVenueId(venueList[0].id);
          }
        } else {
          setVenues([]);
        }
      } catch (err) {
        console.error("Error loading venues list:", err);
        setVenues([]);
      } finally {
        setLoadingVenues(false);
      }
    };

    fetchVenues();
  }, []);

  // 3. Fetch specific Venue Data when selectedVenueId changes
  useEffect(() => {
    if (!selectedVenueId) {
      setVenueData(null);
      return;
    }

    const fetchVenueDetails = async () => {
      setLoadingVenueData(true);
      setErrorVenue(null);
      try {
        const res = await fetch(`${API_URL}/api/venues/${selectedVenueId}`);
        if (res.ok) {
          const data = await res.json();
          setVenueData(data.venue || null);
        } else {
          // Try finding in existing venues list as fallback
          const localMatch = venues.find(v => v.id === selectedVenueId);
          setVenueData(localMatch || null);
        }
      } catch (err) {
        console.error(`Error loading venue data for ${selectedVenueId}:`, err);
        const localMatch = venues.find(v => v.id === selectedVenueId);
        setVenueData(localMatch || null);
      } finally {
        setLoadingVenueData(false);
      }
    };

    fetchVenueDetails();
  }, [selectedVenueId, venues]);

  // 4. Fetch Players when selectedOpponentId changes
  useEffect(() => {
    if (!selectedOpponentId) {
      setOpponentPlayers([]);
      setSelectedPlayerId('');
      return;
    }

    const fetchPlayers = async () => {
      setLoadingPlayers(true);
      setErrorPlayers(null);
      try {
        const res = await fetch(`${API_URL}/api/players?team=${selectedOpponentId}`);
        if (res.ok) {
          const data = await res.json();
          const plist = data.players || [];
          setOpponentPlayers(plist);
          if (plist.length > 0) {
            setSelectedPlayerId(plist[0].id);
          } else {
            setSelectedPlayerId('');
            setPlayerWindowStats(null);
          }
        } else {
          setOpponentPlayers([]);
          setSelectedPlayerId('');
          setPlayerWindowStats(null);
        }
      } catch (err) {
        console.error(`Error fetching players for ${selectedOpponentId}:`, err);
        setOpponentPlayers([]);
        setSelectedPlayerId('');
        setPlayerWindowStats(null);
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, [selectedOpponentId]);

  // 5. Fetch Player Form Stats when selectedPlayerId or lastNMatches changes
  useEffect(() => {
    if (!selectedPlayerId) {
      setPlayerWindowStats(null);
      return;
    }

    const fetchPlayerForm = async () => {
      setLoadingPlayerForm(true);
      try {
        const res = await fetch(`${API_URL}/api/players/${selectedPlayerId}/form?last_n=${lastNMatches}`);
        if (res.ok) {
          const data = await res.json();
          setPlayerWindowStats(data);
        } else {
          setPlayerWindowStats(null);
        }
      } catch (err) {
        console.error(`Error fetching form for player ${selectedPlayerId}:`, err);
        setPlayerWindowStats(null);
      } finally {
        setLoadingPlayerForm(false);
      }
    };

    fetchPlayerForm();
  }, [selectedPlayerId, lastNMatches]);

  // 6. Fetch Completed Match Scorecard when selectedCompletedMatchId changes
  useEffect(() => {
    if (!selectedCompletedMatchId) {
      setCompletedScorecard(null);
      return;
    }

    const fetchScorecard = async () => {
      setLoadingScorecard(true);
      try {
        const res = await fetch(`${API_URL}/api/scorecards/${selectedCompletedMatchId}`);
        if (res.ok) {
          const data = await res.json();
          setCompletedScorecard(data.scorecard || null);
        } else {
          setCompletedScorecard(null);
        }
      } catch (err) {
        console.error(`Error fetching scorecard ${selectedCompletedMatchId}:`, err);
        setCompletedScorecard(null);
      } finally {
        setLoadingScorecard(false);
      }
    };

    fetchScorecard();
  }, [selectedCompletedMatchId]);

  const selectedOpponentObj = opponents.find(o => (o.id || o.code) === selectedOpponentId) || {};
  const nextMatchItem = scheduleTimeline.find(item => item.status === 'NEXT_TARGET') || scheduleTimeline[0] || {};

  return (
    <div className="cricviz-scout-container" style={{ paddingBottom: '5rem' }}>
      {/* Header Banner */}
      <div className="scout-header-banner">
        <div className="scout-banner-inner">
          <div>
            <div className="uom-badge-title">
              <ShieldAlert size={15} /> UOM Opposition Scouting & Intelligence
            </div>
            <h1 className="scout-title-text">UOM Opposition Scout</h1>
            <p style={{ color: 'var(--cric-text-sub)', fontSize: '0.95rem' }}>
              Sri Lanka University Cricket Championship 2026 • Match Intelligence
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--cric-text-sub)', marginBottom: '0.25rem', fontWeight: '700' }}>
                SELECT TARGET OPPONENT:
              </label>
              {loadingOpponents ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--cric-text-sub)' }}>Loading opponents...</div>
              ) : (
                <select 
                  className="opponent-select-dropdown"
                  value={selectedOpponentId}
                  onChange={(e) => setSelectedOpponentId(e.target.value)}
                >
                  {opponents.length > 0 ? (
                    opponents.map(opp => (
                      <option key={opp.id || opp.code} value={opp.id || opp.code}>
                        {opp.name} ({opp.shortName || opp.code})
                      </option>
                    ))
                  ) : (
                    <option value="">No opponents available</option>
                  )}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Schedule Timeline */}
        <div className="cricviz-card" style={{ marginBottom: '2rem', borderLeft: '5px solid var(--cric-gold)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="var(--cric-gold)" /> UOM Championship Schedule & Timeline
            </h2>
            <span style={{ fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--cric-gold)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: '800' }}>
              {nextMatchItem.opponentName ? `NEXT MATCH: ${nextMatchItem.dateLabel ? nextMatchItem.dateLabel.toUpperCase() : ''} VS ${nextMatchItem.opponentName.toUpperCase()}` : 'SCHEDULE TIMELINE BLANK (0 MATCHES)'}
            </span>
          </div>

          {loadingSchedule ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--cric-text-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <RefreshCw className="animate-spin" size={18} /> Loading schedule timeline...
            </div>
          ) : scheduleTimeline.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {scheduleTimeline.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    background: item.status === 'NEXT_TARGET' ? 'rgba(220, 38, 38, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: item.status === 'NEXT_TARGET' ? '2px solid #dc2626' : '1px solid var(--cric-border)',
                    borderRadius: '10px',
                    padding: '1.2rem',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: item.status === 'COMPLETED' ? 'var(--cric-green)' : item.status === 'NEXT_TARGET' ? '#dc2626' : 'var(--cric-blue)' }}>
                        {item.status === 'COMPLETED' ? '✓ COMPLETED MATCH' : item.status === 'NEXT_TARGET' ? '🔥 NEXT TARGET MATCH' : '⏳ UPCOMING'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--cric-text-sub)', fontWeight: '700' }}>{item.dateLabel}</span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '0.35rem' }}>
                      {item.opponentName}
                    </h3>

                    <div style={{ fontSize: '0.85rem', color: 'var(--cric-text-sub)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} color={item.isHome ? 'var(--cric-green)' : '#dc2626'} />
                        <span>{item.venue} ({item.isHome ? 'Home' : 'Away'})</span>
                      </div>
                      <div style={{ fontWeight: '700', color: item.status === 'COMPLETED' ? 'var(--cric-green)' : 'var(--cric-text-main)' }}>
                        {item.scoreSummary || item.result}
                      </div>
                    </div>
                  </div>

                  {item.status === 'COMPLETED' ? (
                    <button 
                      onClick={() => {
                        setShowFullScorecardView(false);
                        setSelectedCompletedMatchId(item.id);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.6rem 1rem',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid var(--cric-green)',
                        borderRadius: '6px',
                        color: 'var(--cric-green)',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <FileText size={15} /> View Scorecard Summary
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--cric-text-sub)', textAlign: 'center', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '4px' }}>
                      Scouting Telemetry Ready
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--cric-border)', color: 'var(--cric-text-sub)', fontSize: '0.875rem' }}>
              No championship schedule or timeline matches logged in database.<br />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Connect to backend API to populate schedule timeline.</span>
            </div>
          )}
        </div>

        {/* Dynamic Venue Insights, Match Analytics & Toss Decisions */}
        <div className="cricviz-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={20} color="var(--cric-blue)" /> Venue Insights & Match Telemetry: {venueData ? venueData.name : 'Select Venue'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--cric-text-sub)' }}>
                {venueData ? venueData.pitchType || 'Pitch telemetry and toss decision engine' : 'Venue statistical analysis and pitch parameters'}
              </p>
            </div>

            {loadingVenues ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--cric-text-sub)' }}>Loading venue list...</div>
            ) : (
              <select
                value={selectedVenueId}
                onChange={(e) => setSelectedVenueId(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#0f172a',
                  border: '1px solid var(--cric-border)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.875rem'
                }}
              >
                {venues.length > 0 ? (
                  venues.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))
                ) : (
                  <option value="">No venues logged</option>
                )}
              </select>
            )}
          </div>

          {loadingVenueData ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--cric-text-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <RefreshCw className="animate-spin" size={18} /> Loading venue insights...
            </div>
          ) : venueData ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--cric-green)' }}>Batting 1st Win %: {venueData.battingFirstWinPct ?? 0}%</span>
                <span style={{ color: 'var(--cric-blue)' }}>Bowling 1st Win %: {venueData.bowlingFirstWinPct ?? 0}%</span>
              </div>

              <div className="pitch-bar-container">
                <div className="pitch-bar-bat" style={{ width: `${venueData.battingFirstWinPct ?? 50}%` }}>
                  BAT 1ST ({venueData.battingFirstWinPct ?? 0}%)
                </div>
                <div className="pitch-bar-bowl" style={{ width: `${venueData.bowlingFirstWinPct ?? 50}%` }}>
                  BOWL 1ST ({venueData.bowlingFirstWinPct ?? 0}%)
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.25rem', background: '#0f172a', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cric-text-sub)' }}>PAR 1ST INNINGS SCORE</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--cric-gold)' }}>
                    {venueData.avgFirstInningsScore ? `${venueData.avgFirstInningsScore} Runs` : 'N/A'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cric-text-sub)' }}>RECOMMENDED TOSS DECISION</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--cric-green)' }}>
                    {venueData.tossRecommendation || 'Pending Data'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cric-text-sub)' }}>PACE VS SPIN SUCCESS</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--cric-text-main)' }}>
                    Pace {venueData.paceWicketsPct ?? 0}% / Spin {venueData.spinWicketsPct ?? 0}%
                  </div>
                </div>
              </div>

              {venueData.keyInsight && (
                <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--cric-blue)', borderRadius: '4px', fontSize: '0.875rem' }}>
                  <strong>Venue Insight:</strong> {venueData.keyInsight}
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--cric-border)', color: 'var(--cric-text-sub)', fontSize: '0.875rem' }}>
              <AlertCircle size={20} color="#94a3b8" style={{ marginBottom: '0.5rem' }} /><br />
              No venue data available yet.<br />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Select a valid venue from the dropdown or verify database API connection.</span>
            </div>
          )}
        </div>

        {/* Deep Player Analysis Engine */}
        <div className="cricviz-card" style={{ marginBottom: '2rem', borderLeft: '5px solid #dc2626' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={20} color="#dc2626" /> Deep Player Form Engine ({selectedOpponentObj.name || selectedOpponentId || 'Target Squad'})
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--cric-text-sub)' }}>
                Filter opponent player form over their most recent official tournament match windows
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0f172a', padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1px solid var(--cric-border)' }}>
              <Filter size={15} color="var(--cric-gold)" />
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--cric-text-sub)' }}>TIMEFRAME:</span>
              {[1, 3, 5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => setLastNMatches(n)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    border: lastNMatches === n ? '1px solid #dc2626' : '1px solid transparent',
                    background: lastNMatches === n ? 'rgba(220, 38, 38, 0.25)' : 'transparent',
                    color: lastNMatches === n ? 'white' : 'var(--cric-text-sub)',
                    fontSize: '0.8rem',
                    fontWeight: '800',
                    cursor: 'pointer'
                  }}
                >
                  Last {n} {n === 1 ? 'Match' : 'Matches'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--cric-text-sub)', marginBottom: '0.5rem' }}>
              SELECT OPPONENT PLAYER TO ANALYZE:
            </label>
            {loadingPlayers ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--cric-text-sub)' }}>Loading squad roster...</div>
            ) : opponentPlayers.length > 0 ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {opponentPlayers.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '8px',
                      border: selectedPlayerId === p.id ? '2px solid #dc2626' : '1px solid var(--cric-border)',
                      background: selectedPlayerId === p.id ? 'rgba(220, 38, 38, 0.15)' : 'var(--cric-card-hover)',
                      color: selectedPlayerId === p.id ? 'white' : 'var(--cric-text-sub)',
                      fontWeight: '700',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <span>{p.icon || '🏏'}</span> {p.name} ({p.role ? p.role.split(' ')[0] : 'Player'})
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--cric-border)', color: 'var(--cric-text-sub)', fontSize: '0.85rem' }}>
                No player telemetry recorded for this squad yet in the database.
              </div>
            )}
          </div>

          {loadingPlayerForm ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--cric-text-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <RefreshCw className="animate-spin" size={18} /> Loading player form telemetry...
            </div>
          ) : playerWindowStats && playerWindowStats.player ? (
            <div>
              <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--cric-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{playerWindowStats.player.icon || '🏏'}</span> {playerWindowStats.player.name}
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--cric-text-sub)' }}>
                      {playerWindowStats.player.role} • {playerWindowStats.player.battingStyle || 'Right-Hand Batter'}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(220, 38, 38, 0.15)', border: '1px solid rgba(220, 38, 38, 0.3)', padding: '0.4rem 1rem', borderRadius: '20px', color: '#dc2626', fontSize: '0.8rem', fontWeight: '800' }}>
                    ANALYZING LAST {playerWindowStats.matchesInWindow || 0} MATCHES IN LOGS
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--cric-card-hover)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--cric-border)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--cric-text-sub)' }}>STRIKE RATE (LAST {playerWindowStats.matchesInWindow || 0} M)</span>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--cric-gold)', marginTop: '0.25rem' }}>{playerWindowStats.strikeRate ?? 0}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cric-text-sub)' }}>{playerWindowStats.totalRuns ?? 0} Runs ({playerWindowStats.totalBalls ?? 0} Balls)</span>
                </div>

                <div style={{ background: 'var(--cric-card-hover)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--cric-border)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--cric-text-sub)' }}>DOT BALL %</span>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--cric-green)', marginTop: '0.25rem' }}>{playerWindowStats.dotBallPct ?? 0}%</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cric-text-sub)' }}>Innings Control Index</span>
                </div>

                <div style={{ background: 'var(--cric-card-hover)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--cric-border)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--cric-text-sub)' }}>BOUNDARY RUN FREQUENCY</span>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--cric-blue)', marginTop: '0.25rem' }}>{playerWindowStats.boundaryPct ?? 0}%</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cric-text-sub)' }}>{playerWindowStats.totalFours ?? 0}4s / {playerWindowStats.totalSixes ?? 0}6s</span>
                </div>

                <div style={{ background: 'var(--cric-card-hover)', padding: '1.25rem', borderRadius: '8px', border: '1px solid #dc2626' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#dc2626' }}>PRIMARY WEAKNESS</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#dc2626', marginTop: '0.5rem' }}>{playerWindowStats.primaryWeakness || 'N/A'}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cric-text-sub)' }}>Target bowling tactic for UOM</span>
                </div>
              </div>

              {playerWindowStats.logsWindow && playerWindowStats.logsWindow.length > 0 ? (
                <>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--cric-text-sub)' }}>
                    Match Logs in Selected Window ({playerWindowStats.matchesInWindow} Recent Matches)
                  </h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="matchup-table">
                      <thead>
                        <tr>
                          <th>Match Date</th>
                          <th>Vs Opponent</th>
                          <th>Runs (Balls)</th>
                          <th>4s / 6s</th>
                          <th>Dot Balls</th>
                          <th>Dismissal Mode / Tactical Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playerWindowStats.logsWindow.map((log, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '700' }}>{log.matchDate}</td>
                            <td style={{ color: 'var(--cric-gold)', fontWeight: '700' }}>vs {log.vs}</td>
                            <td style={{ fontWeight: '800' }}>{log.runs} ({log.balls})</td>
                            <td>{log.fours || 0}4s / {log.sixes || 0}6s</td>
                            <td>{log.dots || 0} dots</td>
                            <td style={{ color: log.isOut ? '#dc2626' : 'var(--cric-green)', fontWeight: '700' }}>
                              {log.dismissalMode}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--cric-text-sub)', fontSize: '0.85rem' }}>
                  No match logs recorded for this window.
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--cric-border)', color: 'var(--cric-text-sub)', fontSize: '0.85rem' }}>
              Select a player to load their form telemetry and recent match logs.
            </div>
          )}
        </div>
      </div>

      {/* MATCH SCORECARD OVERLAY VIEW */}
      {selectedCompletedMatchId && (
        <div style={{ position: 'fixed', inset: 0, background: '#0b1329', zIndex: 99999, overflowY: 'auto', padding: '1.5rem 1rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <button 
              onClick={() => setSelectedCompletedMatchId(null)}
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
              <ArrowLeft size={18} /> Back to Opposition Scout
            </button>

            {loadingScorecard ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'white', fontSize: '1.1rem' }}>
                <RefreshCw className="animate-spin" size={24} style={{ marginBottom: '0.5rem' }} /><br />
                Loading match scorecard...
              </div>
            ) : completedScorecard ? (
              <div style={{ background: 'var(--cric-card-bg)', border: '1.5px solid var(--cric-green)', borderRadius: '14px', padding: '2rem 1.75rem', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--cric-border)', paddingBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--cric-green)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                      <CheckCircle2 size={14} /> COMPLETED MATCH SCORECARD
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{completedScorecard.title}</h2>
                    <span style={{ fontSize: '0.9rem', color: 'var(--cric-text-sub)' }}>{completedScorecard.date} • {completedScorecard.venue}</span>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedCompletedMatchId(null)} 
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--cric-border)', color: 'white', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem' }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                </div>

                {/* HIGHLIGHTED MATCH SUMMARY SECTION */}
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--cric-green)' }}>{completedScorecard.result}</div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--cric-text-sub)' }}>{completedScorecard.toss}</span>
                  </div>

                  {completedScorecard.playerOfMatch && (
                    <div style={{ background: '#0f172a', padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid var(--cric-gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={20} color="var(--cric-gold)" />
                      <div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--cric-text-sub)', display: 'block', fontWeight: '700' }}>PLAYER OF THE MATCH</span>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--cric-gold)' }}>{completedScorecard.playerOfMatch.name}</strong> ({completedScorecard.playerOfMatch.performance})
                      </div>
                    </div>
                  )}
                </div>

                {/* HIGHLIGHTED SCORECARD SUMMARY VIEW (DEFAULT) */}
                {!showFullScorecardView && completedScorecard.innings1 && completedScorecard.innings2 && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                      
                      {/* Best Batsmen */}
                      <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid var(--cric-border)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--cric-gold)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Flame size={16} /> BEST PERFORMANCES - BATSMEN
                        </div>
                        <table className="matchup-table" style={{ marginTop: 0, fontSize: '0.8rem' }}>
                          <thead>
                            <tr>
                              <th>Batter</th>
                              <th style={{ textAlign: 'right' }}>R</th>
                              <th style={{ textAlign: 'right' }}>B</th>
                              <th style={{ textAlign: 'right' }}>4s/6s</th>
                              <th style={{ textAlign: 'right' }}>SR</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(completedScorecard.innings1.batting || []).concat(completedScorecard.innings2.batting || [])
                              .filter(b => b.runs > 5)
                              .sort((a, b) => b.runs - a.runs)
                              .slice(0, 4)
                              .map((b, idx) => (
                                <tr key={idx}>
                                  <td style={{ fontWeight: '700' }}>{b.player}</td>
                                  <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--cric-gold)' }}>{b.runs}</td>
                                  <td style={{ textAlign: 'right' }}>{b.balls}</td>
                                  <td style={{ textAlign: 'right' }}>{b.fours}/{b.sixes}</td>
                                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{b.sr}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Best Bowlers */}
                      <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid var(--cric-border)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--cric-blue)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Target size={16} /> BEST PERFORMANCES - BOWLERS
                        </div>
                        <table className="matchup-table" style={{ marginTop: 0, fontSize: '0.8rem' }}>
                          <thead>
                            <tr>
                              <th>Bowler</th>
                              <th style={{ textAlign: 'right' }}>O</th>
                              <th style={{ textAlign: 'right' }}>M</th>
                              <th style={{ textAlign: 'right' }}>R</th>
                              <th style={{ textAlign: 'right' }}>W</th>
                              <th style={{ textAlign: 'right' }}>Eco</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(completedScorecard.innings1.bowling || []).concat(completedScorecard.innings2.bowling || [])
                              .filter(bw => bw.wickets > 0)
                              .sort((a, b) => b.wickets - a.wickets)
                              .slice(0, 4)
                              .map((bw, idx) => (
                                <tr key={idx}>
                                  <td style={{ fontWeight: '700' }}>{bw.bowler}</td>
                                  <td style={{ textAlign: 'right' }}>{bw.overs}</td>
                                  <td style={{ textAlign: 'right' }}>{bw.maidens}</td>
                                  <td style={{ textAlign: 'right' }}>{bw.runs}</td>
                                  <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--cric-green)' }}>{bw.wickets}</td>
                                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--cric-gold)' }}>{bw.econ}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Footer Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--cric-border)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
                  <button 
                    onClick={() => setSelectedCompletedMatchId(null)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #dc2626, #991b1b)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)' }}
                  >
                    <ArrowLeft size={18} /> Back to Opposition Scout
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--cric-text-sub)', background: 'var(--cric-card-bg)', borderRadius: '10px' }}>
                Scorecard details unavailable or not found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
