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
      return typeof v === 'number' ? `${(v * 100).toFixed(1)}%` : (v ?? '—');
    },
  },
  { key: 'behavior', label: 'Behavior', render: (r) => (r.behavior ?? '—') },
];

const API_BASE_URL = 'https://sbh3fg3j-5050.asse.devtunnels.ms/api';

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [dataset, setDataset] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [filters, setFilters] = useState({
    label: '',
    behavior: '',
    tile: '',
  });

  const [searchTerms, setSearchTerms] = useState({
    label: '',
    behavior: '',
    tile: '',
  });

  // ✅ Store backend filter values
  const [uniqueValues, setUniqueValues] = useState({
    labels: [],
    behaviors: [],
    tiles: [],
  });

  // Transform API data into table-friendly objects
  const transformData = (apiData) =>
    apiData.map((item) => ({
      frameTime: item.frameTimeSeconds,
      timestamp: item.timestampFromCamera,
      animalId: item.animalId ?? '—',
      label: item.label,
      tile: item.videoSource?.split('/').pop() || '—',
      confidence: item.confidence,
      behavior: (item.behaviour || item.behavior || '').trim() || '—',
    }));

  // Fetch analytics with pagination
  const fetchAnalytics = async (pageNum = 1, size = pageSize) => {
  setLoading(true);
  try {
    const params = new URLSearchParams({
      page: pageNum,
      pageSize: size,
    });

    if (filters.label) params.append("label", filters.label);
    if (filters.behavior) params.append("behaviour", filters.behavior); // ✅ backend uses "behaviour"
    if (filters.tile) params.append("tile", filters.tile);

    const response = await fetch(`${API_BASE_URL}/animals?${params.toString()}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const records = data.results || [];
    const transformed = transformData(records);

    setDataset(transformed);
    setTotalCount(data.totalCount ?? records.length);
  } catch (err) {
    console.error("❌ Failed to fetch analytics:", err);
    setDataset([]);
    setTotalCount(0);
  } finally {
    setLoading(false);
  }
};


  // Fetch data when component mounts or pagination changes
  useEffect(() => {
    fetchAnalytics(page, pageSize);
  }, [page, pageSize, filters]);

  // Fetch backend filter options
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/animals/filters`);
        if (!response.ok) throw new Error('Failed to fetch filter options');
        const data = await response.json();
        setUniqueValues({
          labels: data.labels || [],
          behaviors: data.behaviors || [],
          tiles: data.tiles?.map((t) => t.split('/').pop()) || [],
        });
      } catch (err) {
        console.error('❌ Failed to load filters:', err);
      }
    };

    fetchFilters();
  }, []);

  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };
  const filteredData = dataset;

  // ✅ CSV Export with Toast + Button Feedback
  const handleExportCSV = async () => {
    setExporting(true);
    showToast('⏳ CSV file is downloading...');

    try {
      const response = await fetch(`${API_BASE_URL}/animals/export`);

      if (!response.ok) throw new Error('Failed to export CSV');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `animal_detections_export_${new Date()
        .toISOString()
        .split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

      showToast('✅ CSV downloaded successfully!');
    } catch (error) {
      console.error('❌ CSV export failed:', error);
      showToast('❌ CSV export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // ✅ Toast Utility
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Inline styles
  const styles = {
    container: {
      backgroundColor: '#F9FAFB',
      minHeight: '100vh',
      padding: '32px',
      position: 'relative',
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
      boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
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
      boxShadow: '0 2px 4px rgba(0,140,140,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    exportButton: {
      backgroundColor: exporting ? '#86EFAC' : '#A3E635',
      color: '#1F2937',
      border: 'none',
      borderRadius: '8px',
      padding: '11px 24px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: exporting ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(163,230,53,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      opacity: exporting ? 0.7 : 1,
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
      boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
      border: '1px solid #E5E7EB',
    },
    toast: {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#008C8C',
      color: '#FFFFFF',
      padding: '12px 20px',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      fontSize: '14px',
      fontWeight: '500',
      animation: 'fadein 0.5s, fadeout 0.5s 2.5s',
    },
  };

  const clearAllFilters = () => {
    setFilters({ label: '', behavior: '', tile: '' });
    setSearchTerms({ label: '', behavior: '', tile: '' });
  };

  const hasActiveFilters = Object.values(filters).some((f) => f !== '');

  const renderDropdown = (label, key, options) => {
    const search = searchTerms[key].toLowerCase();
    const filteredOptions = options.filter((opt) => opt.toLowerCase().includes(search));

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
      {toast && <div style={styles.toast}>{toast}</div>}

      <div style={styles.headerSection}>
        <h2 style={styles.header}>Analytics Dashboard</h2>
        <div style={styles.headerButtons}>
          <button
            style={styles.button}
            onClick={() => fetchAnalytics(page, pageSize)}
            disabled={loading}
          >
            <span>{loading ? '⟳' : '↻'}</span>
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>

          <button
            style={styles.exportButton}
            onClick={handleExportCSV}
            disabled={exporting}
          >
            <span>{exporting ? '⏳' : '⬇'}</span>
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
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
          {renderDropdown('Video Source', 'tile', uniqueValues.tiles)}
        </div>
      </div>

      {dataset.length > 0 && (
        <div style={styles.resultsInfo}>
          <span style={styles.resultsText}>
            Showing <span style={styles.resultsCount}>{filteredData.length}</span> of{' '}
            <span style={styles.resultsCount}>{totalCount}</span> records
          </span>
          {hasActiveFilters && (
            <span
              style={{
                ...styles.resultsText,
                color: '#008C8C',
                fontWeight: '600',
              }}
            >
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
          serverSide
          totalCount={totalCount}
          page={page}
          onPageChange={handlePageChange}
          initialPageSize={pageSize}
        />
      </div>
    </div>
  );
}
