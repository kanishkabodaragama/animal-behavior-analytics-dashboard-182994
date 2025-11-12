import React, { useEffect, useState } from 'react';
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

// ✅ Extracted sub-component (safe to use hooks here)
const FilterDropdown = ({
  label,
  filterKey,
  options = [],
  filters,
  setFilters,
  searchTerms,
  setSearchTerms,
  setPage,
  styles,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const search = (searchTerms[filterKey] || '').toLowerCase();
  const filteredOptions = options.filter(
    (opt) => typeof opt === 'string' && opt.toLowerCase().includes(search)
  );

  const handleSelectSuggestion = (value) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
    setSearchTerms((prev) => ({ ...prev, [filterKey]: value }));
    setShowSuggestions(false);
    setPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleSelectSuggestion(filteredOptions[0]);
    }
  };

  return (
    <div style={{ ...styles.filterGroup, position: 'relative' }}>
      <label style={styles.filterLabel}>{label}</label>

      {/* 🔍 Search box */}
      <input
        style={styles.input}
        placeholder={`Search ${label.toLowerCase()}...`}
        value={searchTerms[filterKey]}
        onChange={(e) => {
          setSearchTerms((prev) => ({ ...prev, [filterKey]: e.target.value }));
          setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />

      {/* 💡 Suggestion box */}
      {showSuggestions && search && filteredOptions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: 8,
            listStyle: 'none',
            marginTop: 4,
            padding: 0,
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            maxHeight: 150,
            overflowY: 'auto',
            zIndex: 10,
          }}
        >
          {filteredOptions.map((opt) => (
            <li
              key={opt}
              style={{
                padding: '8px 10px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseDown={() => handleSelectSuggestion(opt)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#f0f0f0')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'white')
              }
            >
              {opt}
            </li>
          ))}
        </ul>
      )}

      {/* ⬇️ Dropdown menu */}
      <select
        style={styles.select}
        value={filters[filterKey]}
        onChange={(e) => {
          setFilters((prev) => ({ ...prev, [filterKey]: e.target.value }));
          setPage(1);
        }}
      >
        <option value="">All {label}s</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default function Analytics() {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [dataset, setDataset] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState({ label: '', behavior: '', tile: '' });
  const [searchTerms, setSearchTerms] = useState({ label: '', behavior: '', tile: '' });

  const [uniqueValues, setUniqueValues] = useState({
    labels: [],
    behaviors: [],
    tiles: [],
  });

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

  const fetchAnalytics = async (pageNum = 1, size = pageSize) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        pageSize: size,
      });

      if (filters.label) params.append('label', filters.label);
      if (filters.behavior) params.append('behaviour', filters.behavior);
      if (filters.tile) params.append('tile', filters.tile);

      const response = await fetch(`${API_BASE_URL}/animals?${params.toString()}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const records = data.results || [];
      const transformed = transformData(records);

      setDataset(transformed);
      setTotalCount(data.totalCount ?? records.length);
    } catch (err) {
      console.error('❌ Failed to fetch analytics:', err);
      setDataset([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(page, pageSize);
  }, [page, pageSize, filters]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(totalCount / pageSize));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [totalCount, pageSize]);

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
      a.download = `animal_detections_export_${new Date().toISOString().split('T')[0]}.csv`;
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

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const styles = {
    container: { backgroundColor: '#F9FAFB', minHeight: '100vh', padding: '32px', position: 'relative' },
    headerSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '20px', borderBottom: '3px solid #008C8C' },
    header: { margin: 0, color: '#1F2937', fontSize: '32px', fontWeight: '700', letterSpacing: '-0.5px' },
    headerButtons: { display: 'flex', gap: '12px' },
    filtersCard: { backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' },
    filtersHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#1F2937', fontSize: '16px', fontWeight: '600' },
    filtersContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' },
    filterGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    filterLabel: { fontSize: '13px', fontWeight: '600', color: '#1F2937', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' },
    input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #E5E7EB', fontSize: '14px', outline: 'none', transition: 'all 0.2s ease', backgroundColor: '#FFFFFF', color: '#1F2937', boxSizing: 'border-box' },
    select: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid #E5E7EB', fontSize: '14px', outline: 'none', cursor: 'pointer', backgroundColor: '#FFFFFF', color: '#1F2937', transition: 'all 0.2s ease', boxSizing: 'border-box' },
    button: { backgroundColor: '#008C8C', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '11px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(0,140,140,0.2)', display: 'flex', alignItems: 'center', gap: '8px' },
    exportButton: { backgroundColor: exporting ? '#86EFAC' : '#A3E635', color: '#1F2937', border: 'none', borderRadius: '8px', padding: '11px 24px', fontSize: '14px', fontWeight: '600', cursor: exporting ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', boxShadow: '0 2px 4px rgba(163,230,53,0.3)', display: 'flex', alignItems: 'center', gap: '8px', opacity: exporting ? 0.7 : 1 },
    toast: { position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#008C8C', color: '#FFFFFF', padding: '12px 20px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', fontSize: '14px', fontWeight: '500' },
  };

  const clearAllFilters = () => {
    setFilters({ label: '', behavior: '', tile: '' });
    setSearchTerms({ label: '', behavior: '', tile: '' });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((f) => f !== '');

  return (
    <div style={styles.container}>
      {toast && <div style={styles.toast}>{toast}</div>}

      <div style={styles.headerSection}>
        <h2 style={styles.header}>Analytics Dashboard</h2>
        <div style={styles.headerButtons}>
          <button style={styles.button} onClick={() => fetchAnalytics(page, pageSize)} disabled={loading}>
            <span>{loading ? '⟳' : '↻'}</span>
            <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>

          <button style={styles.exportButton} onClick={handleExportCSV} disabled={exporting}>
            <span>{exporting ? '⏳' : '⬇'}</span>
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      <div style={styles.filtersCard}>
        <div style={styles.filtersHeader}>
          <span>🔍 Smart Filters</span>
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
          <FilterDropdown
            label="Label"
            filterKey="label"
            options={uniqueValues.labels}
            filters={filters}
            setFilters={setFilters}
            searchTerms={searchTerms}
            setSearchTerms={setSearchTerms}
            setPage={setPage}
            styles={styles}
          />
          <FilterDropdown
            label="Behavior"
            filterKey="behavior"
            options={uniqueValues.behaviors}
            filters={filters}
            setFilters={setFilters}
            searchTerms={searchTerms}
            setSearchTerms={setSearchTerms}
            setPage={setPage}
            styles={styles}
          />
          <FilterDropdown
            label="Video Source"
            filterKey="tile"
            options={uniqueValues.tiles}
            filters={filters}
            setFilters={setFilters}
            searchTerms={searchTerms}
            setSearchTerms={setSearchTerms}
            setPage={setPage}
            styles={styles}
          />
        </div>
      </div>

      <div style={styles.card}>
        <Table
          columns={COLUMNS}
          data={dataset}
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
