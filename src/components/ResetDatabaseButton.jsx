import React, { useState } from 'react';
import { Trash2, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ResetDatabaseButton({ onResetSuccess }) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleHardReset = async () => {
    if (!window.confirm("⚠️ HARD RESET WARNING:\n\nAre you sure you want to completely wipe all teams, players, and match telemetry from the database?\n\nThis will reset the system to a 100% blank slate.")) {
      return;
    }

    setLoading(true);
    setStatusMsg('Executing 100% Database Wipe...');
    setIsError(false);

    try {
      const response = await fetch('http://localhost:5000/api/reset-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setStatusMsg(data.message || 'Database wiped successfully!');
        if (onResetSuccess) onResetSuccess(data);
      } else {
        throw new Error(data.message || 'Failed to wipe database');
      }
    } catch (err) {
      console.error("Database reset error:", err);
      setIsError(true);
      setStatusMsg(`Reset Error: ${err.message}. (Ensure backend FastAPI is running on port 5000)`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem', background: 'rgba(220, 38, 38, 0.08)', borderRadius: '12px', border: '1px solid rgba(220, 38, 38, 0.3)', margin: '1rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h4 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
            <Trash2 size={18} /> System Hard Reset (Blank Slate)
          </h4>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#9ca3af' }}>
            Wipes all current player profiles, match scores, and telemetry to prepare for clean sequential PDF uploads.
          </p>
        </div>

        <button
          onClick={handleHardReset}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.25rem',
            background: loading ? '#4b5563' : '#dc2626',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> Wiping Database...
            </>
          ) : (
            <>
              <Trash2 size={16} /> Execute 100% Hard Reset
            </>
          )}
        </button>
      </div>

      {statusMsg && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
          color: isError ? '#f87171' : '#4ade80',
          border: `1px solid ${isError ? '#ef4444' : '#22c55e'}`
        }}>
          {isError ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
          {statusMsg}
        </div>
      )}
    </div>
  );
}
