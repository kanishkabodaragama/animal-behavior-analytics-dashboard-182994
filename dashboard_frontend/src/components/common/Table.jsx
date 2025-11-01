import React from 'react';

/**
 * Simple table component that renders column headers and rows based on provided definitions.
 * - columns: array of { key: string, label: string, render?: (row) => ReactNode }
 * - data: array of row objects
 * - loading: boolean to show loading state (optional)
 * - emptyMessage: string to show when no data (optional)
 */

// PUBLIC_INTERFACE
export default function Table({ columns = [], data = [], loading = false, emptyMessage = 'No records found.' }) {
  /** Renders a data table using column definitions for flexible mapping and formatting. */
  return (
    <table className="table" role="table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} scope="col">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td className="muted" colSpan={columns.length}>Loading...</td>
          </tr>
        ) : !data || data.length === 0 ? (
          <tr>
            <td className="muted" colSpan={columns.length}>{emptyMessage}</td>
          </tr>
        ) : (
          data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map((col) => {
                const content = typeof col.render === 'function'
                  ? col.render(row)
                  : (row?.[col.key] ?? '—');
                return <td key={col.key}>{content}</td>;
              })}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
