import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

// PUBLIC_INTERFACE
export default function Videos() {
  /** Manage uploaded videos and their processing status. */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const inputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await api.videos.list();
      setItems(data);
    } catch (e) {
      setErr(e.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const created = await api.videos.upload(file);
      setItems(prev => [created, ...prev]);
    } catch (e) {
      setErr(e.message || 'Upload failed');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Videos</h2>
      {err && <div className="pill error" style={{ marginBottom: 12 }}>{err}</div>}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <input ref={inputRef} type="file" accept="video/*" onChange={onUpload} />
        <button className="btn ghost" onClick={load}>Refresh</button>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Animal</th>
              <th>Uploaded</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="muted">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="muted">No videos available.</td></tr>
            ) : (
              items.map(v => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td>{v.animal}</td>
                  <td>{new Date(v.uploadedAt).toLocaleString()}</td>
                  <td>
                    <span className={`pill ${v.status === 'Processed' ? 'success' : v.status === 'Processing' ? 'warn' : ''}`}>{v.status}</span>
                  </td>
                  <td>{v.duration}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
