import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

// PUBLIC_INTERFACE
export default function Analytics() {
  /** Shows available analytics reports and mock export actions. */
  const [reports, setReports] = useState([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await api.analytics.list();
      setReports(data);
    } catch (e) {
      setErr(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const exportReport = (rep) => {
    // In mock mode, just simulate download
    const blob = new Blob([JSON.stringify(rep, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rep.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Analytics</h2>
      {err && <div className="pill error" style={{ marginBottom: 12 }}>{err}</div>}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Report</th>
              <th>Animal</th>
              <th>Behaviors</th>
              <th>Created</th>
              <th>Downloads</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="muted">Loading...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={6} className="muted">No analytics available.</td></tr>
            ) : (
              reports.map(rep => (
                <tr key={rep.id}>
                  <td>{rep.title}</td>
                  <td>{rep.animal}</td>
                  <td>{rep.behaviors.join(', ')}</td>
                  <td>{new Date(rep.createdAt).toLocaleString()}</td>
                  <td>{rep.downloads}</td>
                  <td>
                    <button className="btn" onClick={() => exportReport(rep)}>Export</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
