import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

export default function Videos() {
  /** Manage uploaded videos and their processing status. */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const inputRef = useRef(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [hoveredButton, setHoveredButton] = useState('');
  const [hoveredAction, setHoveredAction] = useState({ row: null, action: null });

  // per-row action loading states
  const [actionLoading, setActionLoading] = useState({});

  // polling interval id ref
  const pollRef = useRef(null);

  // --- load uses the new /videos enriched endpoint ---
  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await api.videos.list(); // expects /videos
      // Map server response into UI-friendly shape
      const mapped = (Array.isArray(data) ? data : []).map((r) => ({
        id: r.id,
        name: r.name || r.video_name || 'Untitled',
        uploadedAt: r.uploadedAt || r.createdAt || null,
        uploadProgress: Number(r.uploadProgress ?? 0),
        processingStatus: r.processingStatus || 'pending',
        detectionCount: Number(r.detectionCount ?? 0),
        behaviours: Array.isArray(r.behaviours) ? r.behaviours : [],
        videoStartDtm: r.videoStartDtm,
        videoEndDtm: r.videoEndDtm,
        videoS3Path: r.videoS3Path,
        uploadedBy: r.uploadedBy
      }));
      setItems(mapped);
    } catch (e) {
      console.error(e);
      setErr(e?.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start/stop polling depending on whether there are items that need status updates
  useEffect(() => {
    const needsPolling = items.some((v) => {
      const status = (v.processingStatus || '').toLowerCase();
      return status === 'processing' || status === 'pending' || (v.uploadProgress && v.uploadProgress < 100);
    });

    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (needsPolling) {
      pollRef.current = setInterval(async () => {
        try {
          const fresh = await api.videos.list();
          const mapped = (Array.isArray(fresh) ? fresh : []).map((r) => ({
            id: r.id,
            name: r.name || r.video_name || 'Untitled',
            uploadedAt: r.uploadedAt || r.createdAt || null,
            uploadProgress: Number(r.uploadProgress ?? 0),
            processingStatus: r.processingStatus || 'pending',
            detectionCount: Number(r.detectionCount ?? 0),
            behaviours: Array.isArray(r.behaviours) ? r.behaviours : [],
            videoStartDtm: r.videoStartDtm,
            videoEndDtm: r.videoEndDtm,
            videoS3Path: r.videoS3Path,
            uploadedBy: r.uploadedBy
          }));
          setItems(mapped);
        } catch (e) {
          console.warn('Polling videos failed', e);
        }
      }, 7000);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [items]);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const created = await api.videos.upload(file);
      // If backend returns created record in the new shape, keep it; else reload
      if (created && created.id) {
        // Best to re-load to get detection counts from server, but optimistically prepend minimal record
        setItems((prev) => [{ id: created.id, name: created.name || file.name, uploadedAt: created.uploadedAt || new Date().toISOString(), uploadProgress: 0, processingStatus: created.processingStatus || 'pending', detectionCount: 0, behaviours: [] }, ...prev]);
        // Trigger a reload shortly to populate counts once processed
        setTimeout(load, 1200);
      } else {
        await load();
      }
      setErr('');
    } catch (e) {
      console.error(e);
      setErr(e?.message || 'Upload failed');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  // helper to set action loading for a particular id
  const setRowActionLoading = (id, action, value) => {
    setActionLoading((prev) => {
      const copy = { ...prev };
      copy[id] = { ...(copy[id] || {}), [action]: value };
      return copy;
    });
  };

  // VIEW: open generated sheet in new tab/window
  const handleView = async (videoId) => {
    setErr('');
    setRowActionLoading(videoId, 'view', true);
    try {
      let res;
      if (typeof api.videos.getSheet === 'function') {
        res = await api.videos.getSheet(videoId);
      } else if (typeof api.videos.get === 'function') {
        res = await api.videos.get(videoId);
      } else {
        throw new Error('No API method available to view sheet.');
      }

      if (res && typeof res === 'object' && res.url) {
        window.open(res.url, '_blank', 'noopener');
      } else if (res instanceof Blob) {
        const url = URL.createObjectURL(res);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else if (typeof res === 'string') {
        window.open(res, '_blank', 'noopener');
      } else if (res && typeof res.sheetUrl === 'string') {
        window.open(res.sheetUrl, '_blank', 'noopener');
      } else {
        throw new Error('Unexpected response when trying to view sheet.');
      }
    } catch (e) {
      console.error('View error', e);
      setErr(e?.message || 'Failed to open generated sheet');
    } finally {
      setRowActionLoading(videoId, 'view', false);
    }
  };

  // DOWNLOAD
  const handleDownload = async (videoId) => {
    setErr('');
    setRowActionLoading(videoId, 'download', true);
    try {
      let res;
      if (typeof api.videos.download === 'function') {
        res = await api.videos.download(videoId);
      } else if (typeof api.videos.getSheet === 'function') {
        res = await api.videos.getSheet(videoId);
      } else {
        throw new Error('No API method available to download sheet.');
      }

      if (res instanceof Blob) {
        const url = URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video_${videoId}_sheet`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        return;
      }

      if (res && typeof res === 'object' && res.url) {
        const a = document.createElement('a');
        a.href = res.url;
        a.download = res.filename || `video_${videoId}_sheet`;
        try {
          document.body.appendChild(a);
          a.click();
          a.remove();
        } catch {
          window.open(res.url, '_blank', 'noopener');
        }
        return;
      }

      if (typeof res === 'string') {
        const a = document.createElement('a');
        a.href = res;
        a.download = `video_${videoId}_sheet`;
        try {
          document.body.appendChild(a);
          a.click();
          a.remove();
        } catch {
          window.open(res, '_blank', 'noopener');
        }
        return;
      }

      throw new Error('Unexpected response when attempting download.');
    } catch (e) {
      console.error('Download error', e);
      setErr(e?.message || 'Download failed');
    } finally {
      setRowActionLoading(videoId, 'download', false);
    }
  };

  // DELETE
  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;
    setErr('');
    setRowActionLoading(videoId, 'delete', true);

    const previous = items;
    setItems((prev) => prev.filter((i) => i.id !== videoId));

    try {
      if (typeof api.videos.delete === 'function') {
        await api.videos.delete(videoId);
      } else if (typeof api.videos.remove === 'function') {
        await api.videos.remove(videoId);
      } else {
        throw new Error('No API method available to delete video.');
      }
    } catch (e) {
      console.error('Delete error', e);
      setItems(previous);
      setErr(e?.message || 'Failed to delete video');
    } finally {
      setRowActionLoading(videoId, 'delete', false);
    }
  };

  // --- styles (unchanged) ---
  const styles = {
    container: { minHeight: '100vh', background: '#F9FAFB', padding: '32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    maxWidthContainer: { maxWidth: '1600px', margin: '0 auto' },
    headerSection: { marginBottom: '32px', paddingBottom: '20px', borderBottom: '3px solid #008C8C', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    headerContent: { flex: 1 },
    header: { margin: 0, fontSize: '32px', fontWeight: '700', color: '#1F2937', letterSpacing: '-0.5px' },
    subheader: { margin: '8px 0 0 0', color: '#6B7280', fontSize: '15px', fontWeight: '500' },
    uploadButton: { background: '#A3E635', color: '#1F2937', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(163, 230, 53, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' },
    uploadButtonHover: { background: '#84CC16', transform: 'translateY(-2px)', boxShadow: '0 4px 8px rgba(163, 230, 53, 0.4)' },
    errorBanner: { backgroundColor: '#FEE2E2', border: '2px solid #FCA5A5', color: '#991B1B', padding: '16px 20px', borderRadius: '10px', marginBottom: '24px', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px' },
    actionBar: { background: '#FFFFFF', border: '2px solid #E5E7EB', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' },
    refreshButton: { background: '#008C8C', color: '#FFFFFF', border: 'none', padding: '11px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0, 140, 140, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' },
    refreshButtonHover: { background: '#007070', transform: 'translateY(-1px)', boxShadow: '0 4px 8px rgba(0, 140, 140, 0.3)' },
    videoCard: { background: '#FFFFFF', border: '2px solid #E5E7EB', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)' },
    videoHeader: { marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px solid #008C8C', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    videoTitle: { margin: 0, fontSize: '22px', fontWeight: '700', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '10px' },
    videoBadge: { padding: '8px 16px', background: '#E6F7F7', borderRadius: '20px', fontSize: '13px', fontWeight: '700', color: '#008C8C' },
    tableWrapper: { overflowX: 'auto', borderRadius: '8px' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0 },
    thead: { background: '#F9FAFB' },
    th: { textAlign: 'left', padding: '16px 20px', color: '#1F2937', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #008C8C' },
    tr: { background: '#FFFFFF', transition: 'background 0.15s ease' },
    trHover: { background: '#F9FAFB' },
    td: { padding: '16px 20px', fontSize: '14px', color: '#1F2937' },
    videoNameCell: { display: 'flex', alignItems: 'center', gap: '12px' },
    videoIcon: { width: '44px', height: '44px', background: 'linear-gradient(135deg, #008C8C 0%, #00B3B3 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
    videoName: { fontWeight: '600', color: '#1F2937' },
    progressWrapper: { display: 'flex', flexDirection: 'column', gap: '6px' },
    progressBar: { width: '120px', height: '8px', background: '#E5E7EB', borderRadius: '10px', overflow: 'hidden' },
    progressFill: { height: '100%', background: 'linear-gradient(90deg, #008C8C 0%, #00B3B3 100%)', borderRadius: '10px', transition: 'width 0.3s ease' },
    progressText: { fontSize: '12px', fontWeight: '600', color: '#6B7280' },
    statusBadge: { display: 'inline-block', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
    actionsWrapper: { display: 'flex', alignItems: 'center', gap: '8px' },
    actionButton: { width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #E5E7EB', borderRadius: '8px', background: '#FFFFFF', cursor: 'pointer', transition: 'all 0.2s ease', fontSize: '16px', position: 'relative' },
    actionButtonView: { borderColor: '#008C8C', color: '#008C8C' },
    actionButtonViewHover: { background: '#008C8C', color: '#FFFFFF', transform: 'translateY(-2px)', boxShadow: '0 4px 8px rgba(0, 140, 140, 0.2)' },
    actionButtonDownload: { borderColor: '#A3E635', color: '#84CC16' },
    actionButtonDownloadHover: { background: '#A3E635', color: '#1F2937', transform: 'translateY(-2px)', boxShadow: '0 4px 8px rgba(163, 230, 53, 0.2)' },
    actionButtonDelete: { borderColor: '#EF4444', color: '#EF4444' },
    actionButtonDeleteHover: { background: '#EF4444', color: '#FFFFFF', transform: 'translateY(-2px)', boxShadow: '0 4px 8px rgba(239, 68, 68, 0.2)' },
    loadingWrapper: { padding: '60px', textAlign: 'center', color: '#6B7280', fontSize: '14px' },
    loadingSpinner: { width: '24px', height: '24px', border: '3px solid #008C8C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' },
    emptyState: { padding: '80px 40px', textAlign: 'center' },
    emptyIcon: { fontSize: '64px', marginBottom: '16px' },
    emptyTitle: { color: '#1F2937', fontSize: '18px', fontWeight: '600', marginBottom: '8px' },
    emptySubtitle: { color: '#6B7280', fontSize: '14px' },
  };

  const getUploadStatus = (video) => {
    const uploadProgress = video.uploadProgress ?? 100;
    if (uploadProgress === 100) return { label: 'Uploaded', color: '#008C8C' };
    if (video.uploadFailed) return { label: 'Failed', color: '#EF4444' };
    return { label: `${uploadProgress}%`, color: '#F59E0B' };
  };

  const getDetectionStatus = (video) => {
    const status = (video.processingStatus || '').toLowerCase();
    if (status === 'completed' || status === 'complete') {
      return { label: 'Completed', background: '#D1FAE5', color: '#008C8C' };
    }
    if (status === 'processing') return { label: 'Processing', background: '#FEF3C7', color: '#D97706' };
    return { label: 'Pending', background: '#E5E7EB', color: '#6B7280' };
  };

  const getActionButtonStyle = (rowIndex, action) => {
    const isHovered = hoveredAction.row === rowIndex && hoveredAction.action === action;
    const id = items?.[rowIndex]?.id;
    const loadingForRow = id && actionLoading[id] && actionLoading[id][action];

    let base = { ...styles.actionButton };
    if (action === 'view') base = { ...base, ...styles.actionButtonView };
    if (action === 'download') base = { ...base, ...styles.actionButtonDownload };
    if (action === 'delete') base = { ...base, ...styles.actionButtonDelete };

    if (isHovered) {
      if (action === 'view') base = { ...base, ...styles.actionButtonViewHover };
      if (action === 'download') base = { ...base, ...styles.actionButtonDownloadHover };
      if (action === 'delete') base = { ...base, ...styles.actionButtonDeleteHover };
    }

    if (loadingForRow) base = { ...base, opacity: 0.7, cursor: 'progress' };

    return base;
  };

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={styles.maxWidthContainer}>
        {/* Header */}
        <div style={styles.headerSection}>
          <div style={styles.headerContent}>
            <h1 style={styles.header}>Video Analytics</h1>
            <p style={styles.subheader}>Manage animal footage for AI-powered behavioral analysis</p>
          </div>
          {/* <button
            style={{ ...styles.uploadButton, ...(hoveredButton === 'upload' ? styles.uploadButtonHover : {}) }}
            onClick={() => inputRef.current?.click()}
            onMouseEnter={() => setHoveredButton('upload')}
            onMouseLeave={() => setHoveredButton('')}
          >
            <span>⬆</span>
            <span>Upload Video</span>
          </button> */}
          <input ref={inputRef} type="file" accept="video/*" onChange={onUpload} style={{ display: 'none' }} />
        </div>

        {err && (
          <div style={styles.errorBanner}>
            <span>⚠️</span>
            <span>{err}</span>
          </div>
        )}

        {/* Action Bar */}
        <div style={styles.actionBar}>
          <div style={{ color: '#6B7280', fontSize: '14px', fontWeight: '500' }}>Video processing queue and status tracking</div>
          <button
            onClick={load}
            style={{ ...styles.refreshButton, ...(hoveredButton === 'refresh' ? styles.refreshButtonHover : {}) }}
            onMouseEnter={() => setHoveredButton('refresh')}
            onMouseLeave={() => setHoveredButton('')}
          >
            <span>↻</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Videos Table */}
        <div style={styles.videoCard}>
          <div style={styles.videoHeader}>
            <h2 style={styles.videoTitle}>
              <span>Video Library</span>
            </h2>
            <div style={styles.videoBadge}>
              {items.length} {items.length === 1 ? 'video' : 'videos'}
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  {['Video Name', 'Date & Time', 'Upload Progress', 'Detecting Behaviors', 'Actions'].map((header) => (
                    <th key={header} style={styles.th}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={styles.loadingWrapper}>
                      <div style={styles.loadingSpinner} />
                      <div>Loading videos...</div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={styles.emptyState}>
                      <div style={styles.emptyIcon}>📹</div>
                      <div style={styles.emptyTitle}>No videos uploaded yet</div>
                      <div style={styles.emptySubtitle}>Upload your first video to get started with behavioral analysis</div>
                    </td>
                  </tr>
                ) : (
                  items.map((v, idx) => {
                    const uploadStatus = getUploadStatus(v);
                    const detectionStatus = getDetectionStatus(v);
                    const rowActionLoading = actionLoading[v.id] || {};

                    return (
                      <tr
                        key={v.id}
                        style={{ ...styles.tr, ...(hoveredRow === idx ? styles.trHover : {}) }}
                        onMouseEnter={() => setHoveredRow(idx)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td style={{ ...styles.td, borderBottom: idx === items.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                          <div style={styles.videoNameCell}>
                            <div style={styles.videoIcon}>🎬</div>
                            <span style={styles.videoName}>{v.name}</span>
                          </div>
                        </td>

                        <td style={{ ...styles.td, color: '#6B7280', fontSize: '13px', borderBottom: idx === items.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                          {v.videoStartDtm ? new Date(v.videoStartDtm).toLocaleString() : v.uploadedAt ? new Date(v.uploadedAt).toLocaleString() : '—'}
                        </td>

                        <td style={{ ...styles.td, borderBottom: idx === items.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                          <div style={styles.progressWrapper}>
                            <div style={styles.progressBar}>
                              <div style={{ ...styles.progressFill, width: `${v.uploadProgress ?? 100}%` }} />
                            </div>
                            <span style={{ ...styles.progressText, color: uploadStatus.color }}>{uploadStatus.label}</span>
                          </div>
                        </td>

                        <td style={{ ...styles.td, borderBottom: idx === items.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                          <div>
                            <span style={{ ...styles.statusBadge, background: detectionStatus.background, color: detectionStatus.color }}>{detectionStatus.label}</span>
                            <div style={{ marginTop: 8, color: '#6B7280', fontSize: 13 }}>
                              {/* <strong>{v.detectionCount ?? 0}</strong> detections */}
                              {v.behaviours && v.behaviours.length > 0 && (
                                <div style={{ marginTop: 6 }}>
                                  {v.behaviours.slice(0, 3).map((b, i) => (
                                    <span key={i} style={{ marginRight: 8, fontSize: 12, color: '#374151' }}>
                                      {b.behaviour}: {b.count}
                                    </span>
                                  ))}
                                  {v.behaviours.length > 3 && <span style={{ color: '#6B7280', fontSize: 12 }}>+{v.behaviours.length - 3} more</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td style={{ ...styles.td, borderBottom: idx === items.length - 1 ? 'none' : '1px solid #F3F4F6' }}>
                          <div style={styles.actionsWrapper}>
                            <button
                              style={getActionButtonStyle(idx, 'view')}
                              onClick={() => handleView(v.id)}
                              onMouseEnter={() => setHoveredAction({ row: idx, action: 'view' })}
                              onMouseLeave={() => setHoveredAction({ row: null, action: null })}
                              title="View generated sheet"
                              disabled={rowActionLoading.view}
                            >
                              {rowActionLoading.view ? '…' : '👁'}
                            </button>

                            <button
                              style={getActionButtonStyle(idx, 'download')}
                              onClick={() => handleDownload(v.id)}
                              onMouseEnter={() => setHoveredAction({ row: idx, action: 'download' })}
                              onMouseLeave={() => setHoveredAction({ row: null, action: null })}
                              title="Download generated sheet"
                              disabled={rowActionLoading.download}
                            >
                              {rowActionLoading.download ? '…' : '⬇'}
                            </button>

                            <button
                              style={getActionButtonStyle(idx, 'delete')}
                              onClick={() => handleDelete(v.id)}
                              onMouseEnter={() => setHoveredAction({ row: idx, action: 'delete' })}
                              onMouseLeave={() => setHoveredAction({ row: null, action: null })}
                              title="Delete record"
                              disabled={rowActionLoading.delete}
                            >
                              {rowActionLoading.delete ? '…' : '🗑'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
