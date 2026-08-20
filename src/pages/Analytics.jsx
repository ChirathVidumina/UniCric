import React, { useState, useEffect } from 'react';
import { Activity, Flame, Target, TrendingUp, Zap, Shield, RefreshCw, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function Analytics() {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/analytics`);
        if (res.ok) {
          const data = await res.json();
          setKpiData(data.kpi || null);
        } else {
          setKpiData(null);
          setError("Failed to fetch analytics from API server.");
        }
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setKpiData(null);
        setError("Unable to connect to FastAPI backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const topScorer = kpiData?.top_scorer;
  const topBowler = kpiData?.top_bowler;
  const fours = kpiData?.total_boundaries?.fours || 0;
  const sixes = kpiData?.total_boundaries?.sixes || 0;
  const totalBoundaries = fours + sixes;
  const foursPct = totalBoundaries > 0 ? Math.round((fours / totalBoundaries) * 100) : 0;
  const sixesPct = totalBoundaries > 0 ? 100 - foursPct : 0;

  return (
    <div className="analytics-page" style={{ paddingBottom: '4rem' }}>
      
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(220, 38, 38, 0.15)', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            <Activity size={14} /> HIGH-PRECISION TOURNAMENT ANALYTICS ENGINE
          </div>
          <h1 className="page-title">University Championship Analytics & Performance Insights</h1>
          <p className="page-subtitle">
            Ball-by-ball run rates, boundary distribution, and bowling economy telemetry
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <RefreshCw className="animate-spin" size={28} color="var(--accent-gold)" />
          <span style={{ fontSize: '1rem', fontWeight: '700' }}>Loading tournament analytics engine...</span>
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '10px', color: '#ef4444', marginBottom: '2rem' }}>
          <AlertCircle size={24} style={{ marginBottom: '0.5rem' }} /><br />
          <strong>Analytics API Warning:</strong> {error}<br />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ensure the FastAPI backend is running at {API_URL}</span>
        </div>
      ) : (
        <>
          {/* KPI Stats Header */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-header">
                <span>TOURNAMENT LEADING RUN SCORER</span>
                <div className="stat-icon"><Flame size={20} color="var(--accent-gold)" /></div>
              </div>
              <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                {topScorer && topScorer.name ? topScorer.name : "N/A"}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {topScorer && topScorer.name ? (
                  <><strong style={{ color: 'var(--accent-gold)' }}>{topScorer.runs} Runs</strong> ({topScorer.team || 'N/A'}) @ SR {topScorer.sr || 0}</>
                ) : (
                  "No player data uploaded yet"
                )}
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>TOP WICKET TAKER</span>
                <div className="stat-icon"><Target size={20} color="var(--accent-blue)" /></div>
              </div>
              <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                {topBowler && topBowler.name ? topBowler.name : "N/A"}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {topBowler && topBowler.name ? (
                  <><strong style={{ color: 'var(--accent-blue)' }}>{topBowler.wickets} Wickets</strong> ({topBowler.team || 'N/A'}) @ Econ {topBowler.econ || 0}</>
                ) : (
                  "No bowler data uploaded yet"
                )}
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span>AVERAGE TOURNAMENT RUN RATE</span>
                <div className="stat-icon"><TrendingUp size={20} color="var(--accent-green)" /></div>
              </div>
              <div className="stat-value" style={{ fontSize: '1.75rem' }}>{kpiData?.avg_run_rate || "0.00"} RPO</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Across Ingested Telemetry Scorecards
              </p>
            </div>
          </div>

          {/* Advanced Telemetry Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            
            <div className="content-card">
              <div className="card-title">
                <Zap size={20} color="var(--accent-gold)" />
                <span>Boundary Distribution Breakdown</span>
              </div>
              <div style={{ padding: '1.5rem', background: '#0f172a', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL FOURS (4s)</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-gold)' }}>{fours} Fours</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL SIXES (6s)</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#dc2626' }}>{sixes} Sixes</div>
                  </div>
                </div>
                <div style={{ height: '10px', background: '#1e293b', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${foursPct}%`, background: 'var(--accent-gold)' }}></div>
                  <div style={{ width: `${sixesPct}%`, background: '#dc2626' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  <span>{foursPct}% Boundary Runs from Fours</span>
                  <span>{sixesPct}% from Sixes</span>
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-title">
                <Shield size={20} color="var(--accent-green)" />
                <span>Innings Economy & Control Index</span>
              </div>
              <div style={{ padding: '1.5rem', background: '#0f172a', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL RUNS LOGGED</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-green)' }}>{kpiData?.total_tournament_runs || 0} Runs</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RUN RATE</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#dc2626' }}>{kpiData?.avg_run_rate || "0.00"} RPO</div>
                  </div>
                </div>
                <div style={{ height: '10px', background: '#1e293b', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: (kpiData?.total_tournament_runs || 0) > 0 ? '50%' : '0%', background: 'var(--accent-green)' }}></div>
                  <div style={{ width: (kpiData?.total_tournament_runs || 0) > 0 ? '50%' : '0%', background: '#dc2626' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  <span>Strict Economy Control</span>
                  <span>Verified Scorecard Telemetry</span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
