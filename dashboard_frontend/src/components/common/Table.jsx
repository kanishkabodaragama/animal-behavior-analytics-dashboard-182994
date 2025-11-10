import React from 'react';

/**
 * Table component with pagination.
 *
 * Props:
 * - columns: array of { key: string, label: string, render?: (row) => ReactNode }
 * - data: array of row objects (for client-side mode; in server-side mode this should be the current page rows)
 * - loading: boolean
 * - emptyMessage: string
 *
 * Pagination props (client-side by default):
 * - initialPageSize: number (default 10)
 * - pageSizeOptions: number[] (default [5,10,25,50])
 * - serverSide: boolean (default false). If true, the component expects server-side pagination behavior:
 *    - totalCount: number (total rows on server)
 *    - page: number (1-based current page) optional, if provided component will be controlled
 *    - onPageChange: function(page, pageSize) required to request new page from server
 *
 * Example (server-side):
 * <Table serverSide totalCount={200} page={2} onPageChange={(p,ps)=>fetchPage(p,ps)} ... />
 */

// PUBLIC_INTERFACE
export default function Table({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  serverSide = false,
  totalCount = null, // required when serverSide === true
  page: controlledPage = undefined, // optional controlled page (1-based)
  onPageChange = undefined, // (page, pageSize) => void
}) {
  const styles = {
    tableContainer: {
      width: '100%',
      overflowX: 'auto',
      display: 'block',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      fontSize: '14px',
      color: '#1F2937',
    },
    thead: {
      backgroundColor: '#F9FAFB',
      borderBottom: '2px solid #008C8C',
    },
    th: {
      padding: '16px 20px',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: '13px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#1F2937',
      borderBottom: '2px solid #008C8C',
    },
    tbody: {
      backgroundColor: '#FFFFFF',
    },
    tr: {
      borderBottom: '1px solid #E5E7EB',
      transition: 'background-color 0.15s ease',
    },
    trHover: {
      backgroundColor: '#F9FAFB',
    },
    td: {
      padding: '16px 20px',
      color: '#1F2937',
      verticalAlign: 'middle',
    },
    emptyTd: {
      padding: '32px 20px',
      textAlign: 'center',
      color: '#6B7280',
      fontStyle: 'italic',
    },
    loadingTd: {
      padding: '32px 20px',
      textAlign: 'center',
      color: '#008C8C',
      fontWeight: '500',
    },
    loadingDot: {
      display: 'inline-block',
      animation: 'pulse 1.5s ease-in-out infinite',
    },

    // pagination
    pager: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 8px',
      gap: 12,
      marginTop: 12,
    },
    pagerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
    pagerRight: { display: 'flex', alignItems: 'center', gap: 8 },

    pageButton: {
      minWidth: 36,
      height: 36,
      padding: '0 10px',
      borderRadius: 6,
      border: '1px solid transparent',
      background: 'transparent',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 500,
    },
    pageButtonActive: {
      backgroundColor: '#008C8C',
      color: '#FFFFFF',
      borderColor: '#006e6e',
    },
    pageButtonDisabled: {
      opacity: 0.45,
      cursor: 'not-allowed',
    },

    select: {
      padding: '8px 10px',
      borderRadius: 6,
      border: '1px solid #D1D5DB',
      background: '#FFFFFF',
    },

    infoText: {
      color: '#374151',
      fontSize: 13,
    },
  };

  // --- Pagination state (supports controlled or uncontrolled page) ---
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [internalPage, setInternalPage] = React.useState(1); // 1-based index
  const page = typeof controlledPage === 'number' ? controlledPage : internalPage;

  // compute total rows and pages
  const computedTotal = serverSide ? (typeof totalCount === 'number' ? totalCount : 0) : (Array.isArray(data) ? data.length : 0);
  const totalPages = Math.max(1, Math.ceil(computedTotal / Math.max(1, pageSize)));

  // if page is out of range, clamp it
  React.useEffect(() => {
    if (!serverSide) {
      if (page > totalPages) setInternalPage(totalPages);
      if (page < 1) setInternalPage(1);
    } else {
      // serverSide: if controlled page is not provided, we still want to keep internalPage within range when totalCount changes
      if (typeof controlledPage === 'undefined') {
        if (internalPage > totalPages) setInternalPage(totalPages);
        if (internalPage < 1) setInternalPage(1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedTotal, pageSize, totalPages]);

  // when pageSize changes, reset to first page and notify server if needed
  const handlePageSizeChange = (newSize) => {
    const sanitized = Number(newSize) || initialPageSize;
    setPageSize(sanitized);
    if (typeof controlledPage === 'number') {
      // controlled page: user is expected to call onPageChange from parent
      if (onPageChange) onPageChange(1, sanitized);
    } else {
      setInternalPage(1);
      if (serverSide && onPageChange) onPageChange(1, sanitized);
    }
  };

  const goToPage = (p) => {
    const next = Math.max(1, Math.min(totalPages, p));
    if (typeof controlledPage === 'number') {
      if (onPageChange) onPageChange(next, pageSize);
    } else {
      setInternalPage(next);
      if (serverSide && onPageChange) onPageChange(next, pageSize);
    }
  };

  const handlePrev = () => goToPage(page - 1);
  const handleNext = () => goToPage(page + 1);
  const handleFirst = () => goToPage(1);
  const handleLast = () => goToPage(totalPages);

  // compute visible rows for client-side mode
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, computedTotal);

  const rowsToRender = serverSide ? (Array.isArray(data) ? data : []) : (Array.isArray(data) ? data.slice(startIdx, endIdx) : []);

  // helpers for page buttons (compact with ellipses)
  const getPageRange = (current, total, maxButtons = 7) => {
    const pages = [];
    if (total <= maxButtons) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    const side = Math.floor((maxButtons - 3) / 2); // room for first, last, and potential ellipses
    let start = Math.max(2, current - side);
    let end = Math.min(total - 1, current + side);
    // adjust when near edges
    if (current - 1 < side) {
      end = Math.min(total - 1, end + (side - (current - 2)));
    }
    if (total - current < side) {
      start = Math.max(2, start - (side - (total - current - 1)));
    }

    pages.push(1);
    if (start > 2) pages.push('left-ellipsis');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('right-ellipsis');
    pages.push(total);
    return pages;
  };

  const pageButtons = getPageRange(page, totalPages, 7);

  // safety: if serverSide is enabled but no totalCount or onPageChange provided, warn in console
  React.useEffect(() => {
    if (serverSide) {
      if (typeof totalCount !== 'number') {
        console.warn('Table: serverSide is true but totalCount is not provided as a number.');
      }
      if (typeof onPageChange !== 'function') {
        console.warn('Table: serverSide is true but onPageChange callback is not provided.');
      }
    }
  }, [serverSide, totalCount, onPageChange]);

  const [hoveredRow, setHoveredRow] = React.useState(null);

  return (
    <div style={styles.tableContainer}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>

      <table style={styles.table} role="table" aria-busy={loading}>
        <thead style={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" style={styles.th}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody style={styles.tbody}>
          {loading ? (
            <tr>
              <td colSpan={columns.length || 1} style={styles.loadingTd}>
                <span style={styles.loadingDot}>Loading...</span>
              </td>
            </tr>
          ) : (!rowsToRender || rowsToRender.length === 0) ? (
            <tr>
              <td colSpan={columns.length || 1} style={styles.emptyTd}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rowsToRender.map((row, idx) => (
              <tr
                key={row.id ?? `${(page - 1) * pageSize + idx}`}
                style={{
                  ...styles.tr,
                  ...(hoveredRow === idx ? styles.trHover : {})
                }}
                onMouseEnter={() => setHoveredRow(idx)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {columns.map((col) => {
                  const content = typeof col.render === 'function' ? col.render(row) : (row?.[col.key] ?? '—');
                  return (
                    <td key={col.key} style={styles.td}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div style={styles.pager} aria-label="Table pagination">
        <div style={styles.pagerLeft}>
          <div style={styles.infoText}>
            {serverSide ? (
              <>
                Showing <strong>{(page - 1) * pageSize + 1}</strong>
                {' – '}
                <strong>{(page - 1) * pageSize + rowsToRender.length}</strong>
                {' of '}
                <strong>{computedTotal}</strong>
              </>
            ) : (
              <>
                Showing <strong>{startIdx + 1}</strong>
                {' – '}
                <strong>{endIdx}</strong>
                {' of '}
                <strong>{computedTotal}</strong>
              </>
            )}
          </div>

          <div>
            <label style={{ fontSize: 13, marginRight: 8, color: '#374151' }}>
              Rows:
            </label>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              style={styles.select}
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={styles.pagerRight}>
          <button
            type="button"
            onClick={handleFirst}
            style={{
              ...styles.pageButton,
              ...(page === 1 ? styles.pageButtonDisabled : {})
            }}
            disabled={page === 1}
            aria-label="First page"
          >
            «
          </button>

          <button
            type="button"
            onClick={handlePrev}
            style={{
              ...styles.pageButton,
              ...(page === 1 ? styles.pageButtonDisabled : {})
            }}
            disabled={page === 1}
            aria-label="Previous page"
          >
            ‹
          </button>

          {pageButtons.map((pbtn, i) => {
            if (typeof pbtn === 'string' && pbtn.includes('ellipsis')) {
              return (
                <span key={`e-${i}`} style={{ padding: '0 8px', color: '#6B7280' }}>
                  …
                </span>
              );
            }
            const isActive = pbtn === page;
            return (
              <button
                key={`p-${pbtn}`}
                type="button"
                onClick={() => goToPage(pbtn)}
                style={{
                  ...styles.pageButton,
                  ...(isActive ? styles.pageButtonActive : {}),
                }}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${pbtn}`}
              >
                {pbtn}
              </button>
            );
          })}

          <button
            type="button"
            onClick={handleNext}
            style={{
              ...styles.pageButton,
              ...(page === totalPages ? styles.pageButtonDisabled : {})
            }}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            ›
          </button>

          <button
            type="button"
            onClick={handleLast}
            style={{
              ...styles.pageButton,
              ...(page === totalPages ? styles.pageButtonDisabled : {})
            }}
            disabled={page === totalPages}
            aria-label="Last page"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
