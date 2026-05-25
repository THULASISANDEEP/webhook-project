import { useEffect, useState } from "react";
import "./App.css";
 

/* Import shared components from MainDashboard */
import { StageBadge, Navbar } from "./MainDashboard";

/* ─────────────────────────────────────────────
   TRANSLATOR DASHBOARD
   Displays only "rejected" stage records so the
   translation team can review what needs rework.
───────────────────────────────────────────── */
export default function TranslatorDashboard() {
  /* ── State ── */
  const [data, setData] = useState([]);         // all rejected records from API
  const [search, setSearch] = useState("");      // text search query
  const [fromDate, setFromDate] = useState("");  // date range: start
  const [toDate, setToDate] = useState("");      // date range: end
  const [currentPage, setCurrentPage] = useState(1);   // pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);   // rows per page
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [expanded, setExpanded] = useState(null); // expanded row _id for locale detail

  /* ── Fetch rejected records on mount ── */
  useEffect(() => {
    fetch("http://localhost:4000/payloads")
      .then((res) => res.json())
      .then((res) => {
        /* Only keep records with stage = "reject" */
        const rejected = (res.data || []).filter(
          (item) => item.stage === "reject"
        );
        setData(rejected);
      });
  }, []);

  /* ── Reset all filters ── */
  const resetFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  /* ── Apply search + date filters on the fly ── */
  const filteredData = data.filter((item) => {
    /* Text search: title or entityId */
    const q = search.toLowerCase();
    const matchesSearch =
      item.title?.toLowerCase().includes(q) ||
      item.entityId?.toLowerCase().includes(q);

    /* Date range */
    const itemDate    = new Date(item.createdAt);
    const matchesFrom = !fromDate || itemDate >= new Date(fromDate);
    const matchesTo   = !toDate   || itemDate <= new Date(toDate + "T23:59:59");

    return matchesSearch && matchesFrom && matchesTo;
  });

  /* ── Pagination ── */
  const totalPages  = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const currentRows = filteredData.slice(indexOfLast - rowsPerPage, indexOfLast);

  const getPageNumbers = () => {
    const pages = [];
    for (
      let i = Math.max(1, currentPage - 2);
      i <= Math.min(totalPages, currentPage + 2);
      i++
    ) pages.push(i);
    return pages;
  };

  /* Live search suggestions */
  const searchSuggestions = data.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.entityId?.toLowerCase().includes(q)
    );
  });

  /* Show reset button only when a filter is active */
  const hasActiveFilters = search || fromDate || toDate;

  /* ── Safely extract display text from a DatoCMS field value ── */
  const getDisplayValue = (value) => {
    if (!value) return "-";
    if (typeof value === "string") return value;

    if (typeof value === "object" && value.document?.children) {
      try {
        return value.document.children
          .map((child) => child.children?.map((c) => c.value || "").join(""))
          .join(" ");
      } catch {
        return "[Structured Text]";
      }
    }

    return JSON.stringify(value);
  };

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div className="page">

      {/* ── Shared navbar — Home resets filters here too ── */}
      <Navbar onHomeClick={resetFilters} recordCount={filteredData.length} />

      {/* ── Page heading ── */}
      <div className="page-header">
        <h1 className="page-header__title">Translator Dashboard</h1>
        <p className="page-header__subtitle">
          Rejected records requiring translation review
          {data.length > 0 && (
            <span style={{
              marginLeft: "12px",
              background: "var(--color-danger-bg)",
              color: "var(--color-danger)",
              padding: "2px 10px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 600,
            }}>
              {data.length} rejected
            </span>
          )}
        </p>
      </div>

      {/* ── Filters toolbar ── */}
      <div className="toolbar">

        {/* Search with live dropdown */}
        <div style={{ position: "relative" }}>
          <div className="search-wrapper">
            <span className="search-wrapper__icon">🔍</span>
            <input
              type="text"
              placeholder="Search title or record ID…"
              value={search}
              className="search-wrapper__input"
              onChange={(e) => { setSearch(e.target.value); setShowSearchDropdown(true); setCurrentPage(1); }}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 150)}
            />
            {search && (
              <button className="search-wrapper__clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          {/* Suggestion dropdown */}
          {showSearchDropdown && search.trim() && searchSuggestions.length > 0 && (
            <div className="suggestions-box">
              {searchSuggestions.slice(0, 6).map((item) => (
                <div
                  key={item._id}
                  className="suggestions-box__item"
                  onMouseDown={() => {
                    setSearch(item.title);
                    setShowSearchDropdown(false);
                  }}
                >
                  <div className="suggestions-box__title">{item.title}</div>
                  <div className="suggestions-box__id">{item.entityId}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date range pickers */}
        <input
          type="date"
          className="date-input"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
          title="From date"
        />
        <span style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>→</span>
        <input
          type="date"
          className="date-input"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
          title="To date"
        />

        {/* Reset — only shows when filters are active */}
        {hasActiveFilters && (
          <button className="reset-btn" onClick={resetFilters}>✕ Reset</button>
        )}
      </div>

      {/* ── Table card ── */}
      <div className="card">

        {/* Card header: entry count + rows per page */}
        <div className="card__header">
          <span className="card__entry-count">
            Showing <strong>{Math.min(indexOfLast, filteredData.length)}</strong> of{" "}
            <strong>{filteredData.length}</strong> rejected records
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Rows:</span>
            <select
              className="rows-select"
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Scrollable table */}
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left", width: "28%" }}>Entity</th>
                <th>Time</th>
                <th>Locales</th>
                <th>Stage</th>
                <th>Environment</th>
                <th>CMS</th>
                <th>More</th>
              </tr>
            </thead>

            <tbody>
              {currentRows.length === 0 ? (
                /* Empty state — either no data or no filter matches */
                <tr>
                  <td colSpan={7} className="empty-state">
                    {data.length === 0
                      ? "No rejected records found."
                      : "No records match your current filters."}
                  </td>
                </tr>
              ) : (
                currentRows.map((item) => (
                  <>
                    {/* ── Data row ── */}
                    <tr key={item._id}>
                      {/* Entity: title + ID */}
                      <td>
                        <div className="entity-name">{item.title}</div>
                        <div className="entity-id">{item.entityId}</div>
                      </td>

                      {/* Timestamp */}
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Locale chips */}
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", justifyContent: "center" }}>
                          {(item.localesChanged || []).length > 0
                            ? item.localesChanged.map((loc) => (
                                <span key={loc} className="locale-tag">{loc}</span>
                              ))
                            : <span style={{ color: "var(--color-border)" }}>—</span>
                          }
                        </div>
                      </td>

                      {/* Stage badge — always "reject" here but using shared badge for consistency */}
                      <td><StageBadge value={item.stage} /></td>

                      {/* Environment */}
                      <td><span className="env-tag">{item.environment || "—"}</span></td>

                      {/* CMS link */}
                      <td>
                        {item.cmsLink
                          ? <a href={item.cmsLink} target="_blank" rel="noreferrer" className="cms-link">Open ↗</a>
                          : <span style={{ color: "var(--color-border)" }}>—</span>
                        }
                      </td>

                      {/* Expand locale changes */}
                      <td>
                        <button
                          className={`more-btn ${expanded === item._id ? "more-btn--active" : ""}`}
                          onClick={() => setExpanded(expanded === item._id ? null : item._id)}
                        >
                          {expanded === item._id ? "▲" : "▼"}
                        </button>
                      </td>
                    </tr>

                    {/* ── Expanded locale changes panel ── */}
                    {expanded === item._id && (
                      <tr key={`${item._id}-expanded`}>
                        <td colSpan={7} className="expanded-cell">
                          <div className="expanded-inner">
                            <div className="expanded-heading">Field Changes</div>

                            {Object.keys(item.localeChanges || {}).length === 0 ? (
                              <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
                                No field changes recorded.
                              </p>
                            ) : (
                              <div className="locale-blocks">
                                {Object.entries(item.localeChanges || {}).map(([locale, changes]) => (
                                  <div key={locale} className="locale-block">
                                    {/* Locale label */}
                                    <div className="locale-block__title">🌐 {locale.toUpperCase()}</div>

                                    {/* Individual field diffs */}
                                    {(Array.isArray(changes) ? changes : [changes]).map((c, i) => (
                                      <div key={i} className="change-row">
                                        <span className="field-label">{c.field}</span>
                                        <div className="diff-row">
                                          <span className="diff-before">{getDisplayValue(c.before)}</span>
                                          <span className="diff-arrow">→</span>
                                          <span className="diff-after">{getDisplayValue(c.after)}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="pagination">
          <span className="pagination__info">
            Page {currentPage} of {totalPages || 1}
          </span>

          <div className="pagination__buttons">
            <button className="page-btn" disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}>‹</button>

            {getPageNumbers().map((p) => (
              <button key={p}
                className={`page-btn ${p === currentPage ? "page-btn--active" : ""}`}
                onClick={() => setCurrentPage(p)}>{p}</button>
            ))}

            <button className="page-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}