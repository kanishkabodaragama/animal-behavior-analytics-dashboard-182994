import React, { useMemo, useState } from 'react';
import Table from '../components/common/Table';
import rowsData from '../mock/data/analytics.json';

// Column labels must appear EXACTLY in this order:
// ["Frame Time (s)", "Timestamp", "Animal ID", "Label", "Tile", "Confidence", "Pose", "Behavior"]

const COLUMNS = [
  { key: 'frameTime', label: 'Frame Time (s)', render: (r) => (r.frameTime ?? '—') },
  { key: 'timestamp', label: 'Timestamp', render: (r) => (r.timestamp ?? '—') },
  { key: 'animalId', label: 'Animal ID', render: (r) => (r.animalId ?? '—') },
  { key: 'label', label: 'Label', render: (r) => (r.label ?? '—') },
  { key: 'tile', label: 'Tile', render: (r) => (r.tile ?? '—') },
  { key: 'confidence', label: 'Confidence', render: (r) => {
      const v = r.confidence;
      // Print with up to 2 decimals when number, else placeholder
      return typeof v === 'number' ? v.toFixed(2) : (v ?? '—');
    }
  },
  { key: 'pose', label: 'Pose', render: (r) => (r.pose ?? '—') },
  { key: 'behavior', label: 'Behavior', render: (r) => (r.behavior ?? '—') },
];

// PUBLIC_INTERFACE
export default function Analytics() {
  /**
   * Displays analytics detections in a table using the specified headers and mapping.
   * Uses local mock data to avoid runtime errors and ensure all fields are present.
   */
  const [loading, setLoading] = useState(false);
  const [dataset, setDataset] = useState(rowsData || []);

  // Allow for potential future client-side transforms without re-computation on rerenders
  const data = useMemo(() => dataset, [dataset]);

  const refresh = () => {
    // For mock data, a "refresh" just re-reads the data source;
    // a real implementation would refetch from api.analytics.list()
    setLoading(true);
    try {
      // Simulate refresh without changing content
      setDataset(Array.isArray(rowsData) ? [...rowsData] : []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Analytics</h2>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn ghost" onClick={refresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="card">
        <Table
          columns={COLUMNS}
          data={data}
          loading={loading}
          emptyMessage="No analytics records."
        />
      </div>
    </div>
  );
}
