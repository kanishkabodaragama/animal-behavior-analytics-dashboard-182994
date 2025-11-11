import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'https://sbh3fg3j-5050.asse.devtunnels.ms/api';

export default function Dashboard() {
  /** Displays summary KPIs and latest activity entries. */
  const [summary, setSummary] = useState(null);
  const [latest, setLatest] = useState([]);
  const [err, setErr] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isRefreshHovered, setIsRefreshHovered] = useState(false);

  // Fetch dashboard counts
  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard`);
      if (!res.ok) throw new Error('Failed to load summary');
      const data = await res.json();
      setSummary({
        totalVideos: data.total_videos,
        processed: data.processed,
        pending: data.pending,
        behaviorsDetected: data.behaviors_detected,
      });
    } catch (error) {
      console.error(error);
      setErr(error.message || 'Failed to load summary');
    }
  };

  // Fetch latest videos (jobs)
  const fetchLatest = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs`);
      if (!res.ok) throw new Error('Failed to load recent videos');
      const data = await res.json();

      const mapped = data.slice(0, 10).map((v) => ({
        id: v.id,
        animal: 'Giant Ant Eater', // static for now
        behavior: v.video_name || 'Unknown Behavior',
        time: v.created_at,
        status:
          v.processing_status?.toLowerCase() === 'completed'
            ? 'Processed'
            : v.processing_status?.toLowerCase() === 'processing'
            ? 'Processing'
            : 'Pending',
      }));

      setLatest(mapped);
    } catch (error) {
      console.error(error);
      setErr(error.message || 'Failed to load latest videos');
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchLatest();
  }, []);

  const handleRefresh = () => {
    fetchSummary();
    fetchLatest();
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#F9FAFB',
      padding: '32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    maxWidthContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
    },
    headerSection: {
      marginBottom: '32px',
      paddingBottom: '20px',
      borderBottom: '3px solid #008C8C',
    },
    header: {
      margin: 0,
      fontSize: '32px',
      fontWeight: '700',
      color: '#1F2937',
      letterSpacing: '-0.5px',
    },
    subheader: {
      margin: '8px 0 0 0',
      color: '#6B7280',
      fontSize: '15px',
      fontWeight: '500',
    },
    errorBanner: {
      backgroundColor: '#FEE2E2',
      border: '2px solid #FCA5A5',
      color: '#991B1B',
      padding: '16px 20px',
      borderRadius: '10px',
      marginBottom: '24px',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '24px',
      marginBottom: '32px',
    },
    kpiCard: {
      background: '#FFFFFF',
      border: '2px solid #E5E7EB',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.3s ease',
      cursor: 'default',
    },
    kpiCardHover: {
      boxShadow: '0 8px 20px rgba(0, 140, 140, 0.15)',
      transform: 'translateY(-4px)',
    },
    kpiHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
    },
    kpiLabel: {
      color: '#6B7280',
      fontSize: '13px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    kpiIconWrapper: {
      width: '44px',
      height: '44px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '22px',
      transition: 'transform 0.3s ease',
    },
    kpiValue: {
      fontSize: '42px',
      fontWeight: '700',
      lineHeight: '1',
      background: 'linear-gradient(135deg, #008C8C 0%, #00B3B3 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    activityCard: {
      background: '#FFFFFF',
      border: '2px solid #E5E7EB',
      borderRadius: '12px',
      padding: '28px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
    },
    activityHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '20px',
      borderBottom: '2px solid #008C8C',
    },
    activityTitle: {
      margin: 0,
      fontSize: '22px',
      fontWeight: '700',
      color: '#1F2937',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    refreshButton: {
      background: '#008C8C',
      color: '#FFFFFF',
      border: 'none',
      padding: '11px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0, 140, 140, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    refreshButtonHover: {
      background: '#007070',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0, 140, 140, 0.3)',
    },
    tableWrapper: {
      overflowX: 'auto',
      borderRadius: '8px',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    thead: {
      background: '#F9FAFB',
    },
    th: {
      textAlign: 'left',
      padding: '16px 20px',
      color: '#1F2937',
      fontSize: '13px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '2px solid #008C8C',
    },
    tr: {
      background: '#FFFFFF',
      transition: 'background 0.15s ease',
    },
    trHover: {
      background: '#F9FAFB',
    },
    td: {
      padding: '16px 20px',
      fontSize: '14px',
    },
    tdAnimal: {
      color: '#1F2937',
      fontWeight: '600',
    },
    tdBehavior: {
      color: '#4B5563',
      fontWeight: '500',
    },
    tdTime: {
      color: '#6B7280',
      fontSize: '13px',
    },
    statusBadge: {
      display: 'inline-block',
      padding: '6px 14px',
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    emptyState: {
      padding: '60px 40px',
      textAlign: 'center',
      color: '#9CA3AF',
      fontSize: '14px',
      fontStyle: 'italic',
    },
  };

  const kpiCards = [
    {
      label: 'Total Videos',
      value: summary?.totalVideos,
      icon: '📹',
      color: '#008C8C',
      bgColor: '#E6F7F7',
    },
    {
      label: 'Processed',
      value: summary?.processed,
      icon: '✓',
      color: '#00B3B3',
      bgColor: '#E0F9F9',
    },
    {
      label: 'Pending',
      value: summary?.pending,
      icon: '⏳',
      color: '#6CCCCC',
      bgColor: '#F0FCFC',
    },
    {
      label: 'Behaviors Detected',
      value: summary?.behaviorsDetected,
      icon: '🎯',
      color: '#A3E635',
      bgColor: '#F4FCE3',
    },
  ];

  const getStatusStyle = (status) => {
    const baseStyle = { ...styles.statusBadge };
    if (status === 'Processed') {
      return {
        ...baseStyle,
        background: '#D1FAE5',
        color: '#008C8C',
      };
    }
    if (status === 'Processing') {
      return {
        ...baseStyle,
        background: '#FEF3C7',
        color: '#D97706',
      };
    }
    return {
      ...baseStyle,
      background: '#E5E7EB',
      color: '#6B7280',
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidthContainer}>
        {/* Header */}
        <div style={styles.headerSection}>
          <h1 style={styles.header}>Dashboard</h1>
          <p style={styles.subheader}>
            Wildlife behavior detection system overview
          </p>
        </div>

        {err && (
          <div style={styles.errorBanner}>
            <span>⚠️</span>
            <span>{err}</span>
          </div>
        )}

        {/* KPI Cards */}
        <div style={styles.kpiGrid}>
          {kpiCards.map((card, idx) => (
            <div
              key={idx}
              style={{
                ...styles.kpiCard,
                ...(hoveredCard === idx ? styles.kpiCardHover : {}),
                borderColor: hoveredCard === idx ? card.color : '#E5E7EB',
              }}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={styles.kpiHeader}>
                <div style={styles.kpiLabel}>{card.label}</div>
                <div
                  style={{
                    ...styles.kpiIconWrapper,
                    background: card.bgColor,
                    transform: hoveredCard === idx ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                  }}
                >
                  {card.icon}
                </div>
              </div>
              <div
                style={{
                  ...styles.kpiValue,
                  background:
                    idx === 3
                      ? 'linear-gradient(135deg, #A3E635 0%, #84CC16 100%)'
                      : 'linear-gradient(135deg, #008C8C 0%, #00B3B3 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {card.value ?? '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Latest Activity Table */}
        <div style={styles.activityCard}>
          <div style={styles.activityHeader}>
            <h2 style={styles.activityTitle}>
              <span>Latest Activity</span>
            </h2>
            <button
              onClick={handleRefresh}
              style={{
                ...styles.refreshButton,
                ...(isRefreshHovered ? styles.refreshButtonHover : {}),
              }}
              onMouseEnter={() => setIsRefreshHovered(true)}
              onMouseLeave={() => setIsRefreshHovered(false)}
            >
              <span>↻</span>
              <span>Refresh</span>
            </button>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.thead}>
                <tr>
                  {['Animal', 'Source', 'Time', 'Status'].map((header) => (
                    <th key={header} style={styles.th}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {latest.length > 0 ? (
                  latest.map((row, idx) => (
                    <tr
                      key={row.id}
                      style={{
                        ...styles.tr,
                        ...(hoveredRow === idx ? styles.trHover : {}),
                      }}
                      onMouseEnter={() => setHoveredRow(idx)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td
                        style={{
                          ...styles.td,
                          ...styles.tdAnimal,
                          borderBottom:
                            idx === latest.length - 1 ? 'none' : '1px solid #F3F4F6',
                        }}
                      >
                        {row.animal}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          ...styles.tdBehavior,
                          borderBottom:
                            idx === latest.length - 1 ? 'none' : '1px solid #F3F4F6',
                        }}
                      >
                        {row.behavior}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          ...styles.tdTime,
                          borderBottom:
                            idx === latest.length - 1 ? 'none' : '1px solid #F3F4F6',
                        }}
                      >
                        {new Date(row.time).toLocaleString()}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          borderBottom:
                            idx === latest.length - 1 ? 'none' : '1px solid #F3F4F6',
                        }}
                      >
                        <span style={getStatusStyle(row.status)}>{row.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={styles.emptyState}>
                      {summary ? 'No recent videos found' : 'Loading...'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}