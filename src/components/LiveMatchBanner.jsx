import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, Zap, Shield, Flame, Radio } from 'lucide-react';

export const LiveMatchBanner = () => {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(30);

  const fetchLiveTelemetry = async () => {
    try {
      setLoading(true);
      // Ping Python Flask Proxy Backend (Port 5000)
      const res = await fetch('http://localhost:5000/api/live-match');
      if (res.ok) {
        const data = await res.json();
        setMatchData(data);
      } else {
        setFallbackData();
      }
    } catch (err) {
      // Fallback if backend server is launching
      setFallbackData();
    } finally {
      setLoading(false);
      setCountdown(30);
    }
  };

  const setFallbackData = () => {
    setMatchData(null);
  };

  // Setup 30-Second Polling & Countdown Timer
  useEffect(() => {
    fetchLiveTelemetry();

    // Fetch telemetry every 30 seconds
    const pollInterval = setInterval(() => {
      fetchLiveTelemetry();
    }, 30000);

    // 1-second countdown tick
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  if (!matchData) return null;

  const { scorecard, current_batsmen, current_bowler, recent_deliveries, match_info } = matchData;

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #180808 0%, #132036 50%, #0b1329 100%)',
        border: '1.5px solid #dc2626',
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 25px rgba(220, 38, 38, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Live Pulsing Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', color: '#ef4444' }}>
            <span className="pulse-dot" style={{ backgroundColor: '#ef4444', boxShadow: '0 0 8px #ef4444' }}></span>
            <span>LIVE MATCH TELEMETRY TRACKER</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--cric-text-sub)', fontWeight: '600' }}>
            {match_info.match_title} • {match_info.venue}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--cric-text-sub)' }}>
          <span>Auto-refreshing in <strong>{countdown}s</strong></span>
          <button 
            onClick={fetchLiveTelemetry} 
            disabled={loading}
            style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '700' }}
          >
            <RefreshCw size={13} className={loading ? 'spin-icon' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Live Telemetry Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
        
        {/* Score & Target Box */}
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--cric-text-sub)', fontWeight: '700', textTransform: 'uppercase' }}>
            {scorecard.batting_team}
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ffffff', fontFamily: 'Outfit, sans-serif', lineHeight: '1.1', margin: '0.15rem 0' }}>
            {scorecard.runs}/{scorecard.wickets} <span style={{ fontSize: '1.25rem', color: 'var(--cric-text-sub)', fontWeight: '600' }}>({scorecard.overs} ov)</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--cric-green)', fontWeight: '700' }}>
            Target: {scorecard.target_score} • Need <strong>{scorecard.required_runs} Runs</strong> in <strong>{scorecard.balls_remaining} Balls</strong> (CRR: {scorecard.run_rate})
          </div>
        </div>

        {/* Current Striker & Non-Striker */}
        <div style={{ background: '#0f172a', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--cric-border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--cric-gold)', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>ON CREASE (BATTER)</span>
            <span>SR</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.25rem' }}>
            <span>🏏 {current_batsmen.striker.name} *</span>
            <span style={{ color: 'var(--cric-gold)' }}>{current_batsmen.striker.runs} ({current_batsmen.striker.balls}b)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--cric-text-sub)' }}>
            <span>{current_batsmen.non_striker.name}</span>
            <span>{current_batsmen.non_striker.runs} ({current_batsmen.non_striker.balls}b)</span>
          </div>
        </div>

        {/* Current Bowler & Recent Deliveries */}
        <div style={{ background: '#0f172a', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--cric-border)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--cric-blue)', marginBottom: '0.35rem' }}>
            CURRENT BOWLER ({scorecard.bowling_team.split(' ')[0]})
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.4rem' }}>
            <span>🎯 {current_bowler.name}</span>
            <span style={{ color: 'var(--cric-blue)' }}>{current_bowler.wickets}/{current_bowler.runs_conceded} ({current_bowler.overs} ov)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--cric-text-sub)', fontWeight: '700' }}>THIS OVER:</span>
            {recent_deliveries.map((ball, idx) => (
              <span 
                key={idx}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: ball === 'W' ? '#dc2626' : ball === '6' || ball === '4' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.08)',
                  color: ball === 'W' ? '#ffffff' : ball === '6' || ball === '4' ? 'var(--cric-green)' : 'var(--cric-text-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justify: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '800'
                }}
              >
                {ball}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Visual Refresh Bar */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #dc2626, #10b981)',
          width: `${(countdown / 30) * 100}%`,
          transition: 'width 1s linear'
        }}
      />
    </div>
  );
};

export default LiveMatchBanner;
