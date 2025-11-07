import React, { useEffect, useMemo, useState } from 'react';
import Table from '../components/common/Table';

const COLUMNS = [
  { key: 'frameTime', label: 'Frame Time (s)', render: (r) => (r.frameTime ?? '—') },
  { key: 'timestamp', label: 'Timestamp', render: (r) => (r.timestamp ?? '—') },
  { key: 'animalId', label: 'Animal ID', render: (r) => (r.animalId ?? '—') },
  { key: 'label', label: 'Label', render: (r) => (r.label ?? '—') },
  { key: 'tile', label: 'Video Source', render: (r) => (r.tile ?? '—') },
  {
  key: 'confidence',
  label: 'Confidence (%)',
  render: (r) => {
    const v = r.confidence;
    return typeof v === 'number'
      ? `${(v * 100).toFixed(1)}%`
      : (v ?? '—');
  },
},

  // { key: 'pose', label: 'Pose', render: (r) => (r.pose ?? '—') }, // ❌ Pose column removed
  { key: 'behavior', label: 'Behavior', render: (r) => (r.behavior ?? '—') },
];

const API_BASE_URL = 'https://sbh3fg3j-5050.asse.devtunnels.ms/api';

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [dataset, setDataset] = useState([]);

  const [filters, setFilters] = useState({
    label: '',
    behavior: '',
    // pose: '', // ❌ Pose filter removed
    tile: '',
  });

  const [searchTerms, setSearchTerms] = useState({
    label: '',
    behavior: '',
    // pose: '', // ❌ Pose search removed
    tile: '',
  });

  const transformData = (apiData) =>
    apiData.map((item) => ({
      frameTime: item.frameTimeSeconds,
      timestamp: item.timestampFromCamera,
      animalId: item.id,
      label: item.label,
      tile: item.videoSource?.split('/').pop() || '—',
      confidence: item.confidence,
      // pose: item.pose, // ❌ Pose data ignored
      behavior: item.behaviour || item.behavior || '—',
    }));

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/animals`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setDataset(transformData(data));
    } catch (err) {
      console.error('❌ Failed to fetch analytics:', err);
      setDataset([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const uniqueValues = useMemo(() => {
    const getUnique = (key) =>
      Array.from(new Set(dataset.map((row) => row[key]).filter(Boolean))).sort();
    return {
      labels: getUnique('label'),
      behaviors: getUnique('behavior'),
      // poses: getUnique('pose'), // ❌ Pose unique list removed
      tiles: getUnique('tile'),
    };
  }, [dataset]);

  const filteredData = useMemo(() => {
    return dataset.filter((row) => {
      return (
        (!filters.label || row.label === filters.label) &&
        (!filters.behavior || row.behavior === filters.behavior) &&
        // (!filters.pose || row.pose === filters.pose) && // ❌ Pose filter removed
        (!filters.tile || row.tile === filters.tile)
      );
    });
  }, [dataset, filters]);

  const downloadCSV = () => {
    if (!filteredData.length) {
      alert('No data to download!');
      return;
    }

    const headers = COLUMNS.map((col) => col.label);
    const rows = filteredData.map((row) =>
      COLUMNS.map((col) => {
        const value = row[col.key];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value ?? '';
      }).join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const styles = {
    container: {
      backgroundColor: '#F9FAFB',
      minHeight: '100vh',
      padding: '32px',
    },
    headerSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      paddingBottom: '20px',
      borderBottom: '3px solid #008C8C',
    },
    header: {
      margin: 0,
      color: '#1F2937',
      fontSize: '32px',
      fontWeight: '700',
      letterSpacing: '-0.5px',
    },
    headerButtons: {
      display: 'flex',
      gap: '12px',
    },
    filtersCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      border: '1px solid #E5E7EB',
    },
    filtersHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px',
      color: '#1F2937',
      fontSize: '16px',
      fontWeight: '600',
    },
    filtersIcon: {
      fontSize: '20px',
    },
    filtersContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    filterLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#1F2937',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '4px',
    },
    input: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: '8px',
      border: '2px solid #E5E7EB',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.2s ease',
      backgroundColor: '#FFFFFF',
      color: '#1F2937',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: '8px',
      border: '2px solid #E5E7EB',
      fontSize: '14px',
      outline: 'none',
      cursor: 'pointer',
      backgroundColor: '#FFFFFF',
      color: '#1F2937',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
    },
    button: {
      backgroundColor: '#008C8C',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '8px',
      padding: '11px 24px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0, 140, 140, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    resultsInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      padding: '12px 16px',
      backgroundColor: '#F3F4F6',
      borderRadius: '8px',
      border: '1px solid #E5E7EB',
    },
    resultsText: {
      fontSize: '14px',
      color: '#6B7280',
      fontWeight: '500',
    },
    resultsCount: {
      fontSize: '14px',
      color: '#1F2937',
      fontWeight: '700',
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      border: '1px solid #E5E7EB',
    },
  };

  const [hoveredButton, setHoveredButton] = useState('');
  const [focusedInput, setFocusedInput] = useState('');

  const clearAllFilters = () => {
    setFilters({
      label: '',
      behavior: '',
      // pose: '', // ❌
      tile: '',
    });
    setSearchTerms({
      label: '',
      behavior: '',
      // pose: '', // ❌
      tile: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((f) => f !== '');

  const renderDropdown = (label, key, options) => {
    const search = searchTerms[key].toLowerCase();
    const filteredOptions = options.filter((opt) =>
      opt.toLowerCase().includes(search)
    );

    return (
      <div style={styles.filterGroup}>
        <label style={styles.filterLabel}>{label}</label>
        <input
          style={styles.input}
          placeholder={`Search ${label.toLowerCase()}...`}
          value={searchTerms[key]}
          onChange={(e) => setSearchTerms({ ...searchTerms, [key]: e.target.value })}
        />
        <select
          style={styles.select}
          value={filters[key]}
          onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
        >
          <option value="">All {label}s</option>
          {filteredOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <h2 style={styles.header}>Analytics Dashboard</h2>
        <div style={styles.headerButtons}>
          <button
            style={styles.button}
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <span>{loading ? '⟳' : '↻'}</span>
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
          <button
            style={{ ...styles.button, backgroundColor: '#A3E635', color: '#1F2937' }}
            onClick={downloadCSV}
          >
            <span>⬇</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div style={styles.filtersCard}>
        <div style={styles.filtersHeader}>
          <span style={styles.filtersIcon}>🔍</span>
          <span>Smart Filters</span>
          {hasActiveFilters && (
            <button
              style={{
                backgroundColor: 'transparent',
                color: '#008C8C',
                border: '2px solid #008C8C',
                borderRadius: '8px',
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          )}
        </div>
        <div style={styles.filtersContainer}>
          {renderDropdown('Label', 'label', uniqueValues.labels)}
          {renderDropdown('Behavior', 'behavior', uniqueValues.behaviors)}
          {/* {renderDropdown('Pose', 'pose', uniqueValues.poses)} */} {/* ❌ Pose removed */}
          {renderDropdown('Video Source', 'tile', uniqueValues.tiles)}
        </div>
      </div>

      {dataset.length > 0 && (
        <div style={styles.resultsInfo}>
          <span style={styles.resultsText}>
            Showing <span style={styles.resultsCount}>{filteredData.length}</span> of{' '}
            <span style={styles.resultsCount}>{dataset.length}</span> records
          </span>
          {hasActiveFilters && (
            <span style={{ ...styles.resultsText, color: '#008C8C', fontWeight: '600' }}>
              {Object.values(filters).filter((f) => f).length} filter(s) active
            </span>
          )}
        </div>
      )}

      <div style={styles.card}>
        <Table
          columns={COLUMNS}
          data={filteredData}
          loading={loading}
          emptyMessage="No analytics records found."
        />
      </div>
    </div>
  );
}
