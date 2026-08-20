import React, { useState, useEffect } from 'react';
import { Target, Star, Award, Zap, ChevronRight, Flame, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function UOMSpotlightSidebar({ starPerformer, topBatters, topBowlers }) {
  const [data, setData] = useState({
    starPerformer: starPerformer || null,
    topBatters: topBatters || [],
    topBowlers: topBowlers || []
  });

  useEffect(() => {
    if (starPerformer || (topBatters && topBatters.length > 0) || (topBowlers && topBowlers.length > 0)) {
      setData({
        starPerformer: starPerformer || null,
        topBatters: topBatters || [],
        topBowlers: topBowlers || []
      });
      return;
    }

    const fetchSpotlight = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dashboard`);
        if (res.ok) {
          const resData = await res.json();
          setData({
            starPerformer: resData.starPerformer || null,
            topBatters: resData.topBatters || [],
            topBowlers: resData.topBowlers || []
          });
        }
      } catch (err) {
        console.error("Error fetching spotlight data:", err);
      }
    };

    fetchSpotlight();
  }, [starPerformer, topBatters, topBowlers]);

  const activeStar = data.starPerformer;
  const activeBatters = data.topBatters || [];
  const activeBowlers = data.topBowlers || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
        <Flame size={22} color="#dc2626" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: 'white' }}>UOM Team Spotlight</h3>
      </div>

      {/* 1. Star Performer Highlight */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
      }}>
        <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.05 }}>
          <Star size={70} color="var(--accent-gold)" />
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Award size={16} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-gold)', letterSpacing: '0.05em' }}>STAR PERFORMER</span>
          </div>
          {activeStar ? (
            <>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>
                {activeStar.name}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                Played a crucial knock of <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.15rem 0.35rem', borderRadius: '4px', color: 'white', fontWeight: '700' }}>{activeStar.runs} runs</span> off {activeStar.balls} balls{activeStar.fours ? `, smashing ${activeStar.fours} boundaries` : ''} (SR: {activeStar.sr}).
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '0.25rem 0.65rem', borderRadius: '6px', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: '800'
              }}>
                <Zap size={14} /> Impact Player
              </div>
            </>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No individual telemetry recorded yet. Ingest match scorecards to highlight top performers.
            </p>
          )}
        </div>
      </div>

      {/* 2. Top Batsmen List */}
      <div className="content-card" style={{ marginBottom: 0, padding: '1.25rem', borderTop: '3px solid var(--accent-gold)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white', letterSpacing: '0.05em', margin: 0 }}>TOP BATSMEN</h4>
          <span style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>UOM ONLY</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activeBatters.length > 0 ? (
            activeBatters.map((bat, idx) => (
              <div 
                key={bat.name || idx} 
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '0.75rem 0',
                  borderBottom: idx !== activeBatters.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', fontWeight: '900', 
                    color: idx === 0 ? 'var(--accent-gold)' : idx === 1 ? 'white' : idx === 2 ? '#f97316' : 'var(--text-muted)',
                    textShadow: idx === 0 ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none'
                  }}>
                    #{idx + 1}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: '700' }}>{bat.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--accent-gold)' }}>{bat.runs}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800' }}>RUNS</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No batting telemetry logged yet.
            </div>
          )}
        </div>
      </div>

      {/* 3. Top Bowlers List */}
      <div className="content-card" style={{ marginBottom: 0, padding: '1.25rem', borderTop: '3px solid var(--accent-blue)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white', letterSpacing: '0.05em', margin: 0 }}>TOP BOWLERS</h4>
          <span style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800' }}>UOM ONLY</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activeBowlers.length > 0 ? (
            activeBowlers.map((bowl, idx) => (
              <div 
                key={bowl.name || idx} 
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '0.75rem 0',
                  borderBottom: idx !== activeBowlers.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', fontWeight: '900', 
                    color: idx === 0 ? 'var(--accent-blue)' : idx === 1 ? 'white' : idx === 2 ? '#f97316' : 'var(--text-muted)',
                    textShadow: idx === 0 ? '0 0 10px rgba(59, 130, 246, 0.4)' : 'none'
                  }}>
                    #{idx + 1}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: '700' }}>{bowl.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--accent-blue)' }}>{bowl.wkts ?? bowl.wickets ?? 0}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800' }}>WKTS</span>
                  </div>
                  <div style={{ width: '1px', height: '12px', background: 'var(--border-color)' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white' }}>{bowl.runs ?? bowl.runs_conceded ?? 0}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '800' }}>RUNS</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No bowling telemetry logged yet.
            </div>
          )}
        </div>
        <Link 
          to="/teams-players" 
          style={{
            width: '100%', marginTop: '0.75rem', padding: '0.65rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: '8px',
            color: 'var(--accent-blue)', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer',
            textDecoration: 'none', transition: 'all 0.2s ease'
          }}
        >
          View Full Squad <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
