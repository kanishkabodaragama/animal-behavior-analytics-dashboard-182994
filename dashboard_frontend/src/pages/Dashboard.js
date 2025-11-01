import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

// PUBLIC_INTERFACE
export default function Dashboard() {
  /** Displays summary KPIs and latest activity entries. */
  const [summary, setSummary] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    api.dashboard.summary()
      .then(data => { if (mounted) setSummary(data); })
      .catch(e => setErr(e.message || 'Failed to load'));
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      {err && <div className="pill error" style={{ marginBottom: 12 }}>{err}</div>}
      <div className="card-grid" style={{ marginBottom: 16 }}>
        <div className="card h-1">
          <div className="muted">Total Videos</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary?.totalVideos ?? '—'}</div>
        </div>
        <div className="card h-1">
          <div className="muted">Processed</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary?.processed ?? '—'}</div>
        </div>
        <div className="card h-1">
          <div className="muted">Pending</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{summary?.pending ?? '—'}</div>
        </div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Latest Activity</h3>
          <button className="btn ghost">Refresh</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Animal</th>
              <th>Behavior</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(summary?.latestActivity || []).map(row => (
              <tr key={row.id}>
                <td>{row.animal}</td>
                <td>{row.behavior}</td>
                <td>{new Date(row.time).toLocaleString()}</td>
                <td>
                  <span className={`pill ${row.status === 'Processed' ? 'success' : row.status === 'Processing' ? 'warn' : ''}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
            {!summary && (
              <tr>
                <td colSpan={4} className="muted">Loading...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
