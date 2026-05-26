import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./App.css";

/* ─────────────────────────────────────────────
   STAGE BADGE
   Renders a coloured pill based on stage value.
   Exported so TranslatorDashboard can reuse it.
───────────────────────────────────────────── */
export const StageBadge = ({ value }) => {
  if (!value) return <span className="badge badge--neutral">—</span>;

  const cls = {
    review:   "badge badge--review",
    approved: "badge badge--approved",
    reject:   "badge badge--reject",
  };

  return (
    <span className={cls[value.toLowerCase()] || "badge badge--neutral"}>
      {value}
    </span>
  );
};

/* ─────────────────────────────────────────────
   SHARED NAVBAR
   Sticky top bar used on both pages.
   onHomeClick: callback for the Home button.
   recordCount: optional pill on the right.
───────────────────────────────────────────── */
export const Navbar = ({ onHomeClick, recordCount }) => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <span className="navbar__brand">⚡ WebhookCMS</span>

        {/* Admin — navigates to the main dashboard (/) */}
        <Link
          to="/"
          onClick={onHomeClick}
          className={`navbar__link ${location.pathname === "/" ? "navbar__link--active" : ""}`}
        >
          Admin
        </Link>

        {/* Translator page link */}
        <Link
          to="/translator"
          className={`navbar__link ${location.pathname === "/translator" ? "navbar__link--active" : ""}`}
        >
          Translator
        </Link>
      </div>

      <div className="navbar__right">
        <div>ENVIRONMENT = DEVELOPMENT</div>
        {recordCount !== undefined && (
          <span className="navbar__count">
            {recordCount} record{recordCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </nav>
  );
};


/* ─────────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
───────────────────────────────────────────── */
export default function MainDashboard() {
  /* ── State ── */
  const [data, setData] = useState([]);                       // raw API payload
  const [filteredData, setFilteredData] = useState([]);       // post-filter rows
  const [selectedLocales, setSelectedLocales] = useState([]); // active locale checkboxes
  const [selectedStage, setSelectedStage] = useState("");     // active stage filter
  const [startDate, setStartDate] = useState("");             // date range: from
  const [endDate, setEndDate] = useState("");                 // date range: to
  const [search, setSearch] = useState("");                   // search query
  const [expanded, setExpanded] = useState(null);             // _id of expanded row
  const [showLocales, setShowLocales] = useState(false);      // locale dropdown open
  const [showStage, setShowStage] = useState(false);          // stage dropdown open
  const [currentPage, setCurrentPage] = useState(1);         // current page number
  const [rowsPerPage, setRowsPerPage] = useState(10);         // rows shown per page
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  /* Refs for hidden date inputs — used to call .showPicker() on box click */
  const startDateRef = useRef(null);
  const endDateRef   = useRef(null);

  /* ── Load all payloads (review / approved / reject) on mount ── */
  const fetchData = async () => {
    const res = await fetch("http://localhost:4000/records");
    const json = await res.json();
    setData(json.data || []);
    setFilteredData(json.data || []);
  };

  useEffect(() => { fetchData(); }, []);

  /* Re-apply filters whenever any filter value or the base data changes */
  useEffect(() => { applyFilters(); }, [
    search, selectedLocales, selectedStage, startDate, endDate, data,
  ]);

  /* ── Filter logic — runs against raw `data` each time ── */
  const applyFilters = () => {
    let filtered = [...data];

    /* Text search: title or entityId */
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.entityId?.toLowerCase().includes(q)
      );
    }

    /* Locale filter: row must include at least one selected locale */
    if (selectedLocales.length > 0) {
      filtered = filtered.filter((item) =>
        selectedLocales.some((l) => item.localesChanged?.includes(l))
      );
    }

    /* Stage filter */
    if (selectedStage) {
      filtered = filtered.filter((item) => item.stage === selectedStage);
    }

    /* Date range — start (inclusive) */
    if (startDate) {
      filtered = filtered.filter(
        (item) => new Date(item.createdAt) >= new Date(startDate)
      );
    }

    /* Date range — end (inclusive through end of day) */
    if (endDate) {
      filtered = filtered.filter(
        (item) => new Date(item.createdAt) <= new Date(endDate + "T23:59:59")
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // always jump back to page 1 on filter change
  };

  /* ── Delete a record and refresh the list ── */
  /*i have removed the delete button*/


  /* ── Reset every filter and restore full dataset ── */
  const resetFilters = () => {
    setSearch("");
    setSelectedLocales([]);
    setSelectedStage("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    setFilteredData(data);
  };

  /* ── Safely extract display text from any DatoCMS field value ── */
  const getDisplayValue = (value) => {
    if (!value) return "-";
    if (typeof value === "string") return value;

    /* DatoCMS structured text: walk the document tree */
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

  /* ── Collect unique locales from all loaded records ── */
  const allLocales = [...new Set(data.flatMap((item) => item.localesChanged || []))];

  /* ── Pagination ── */
  const totalPages   = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLast  = currentPage * rowsPerPage;
  const currentRows  = filteredData.slice(indexOfLast - rowsPerPage, indexOfLast);

  /* Page numbers: up to 5 centred on currentPage */
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

  /* Show reset button only when something is active */
  const hasActiveFilters =
    search || selectedLocales.length > 0 || selectedStage || startDate || endDate;

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div className="page">

      {/* ── Shared navbar ── */}
      <Navbar onHomeClick={resetFilters}  onadminClick={() => window.location.href = ".\MainDashboard.jsx"} recordCount={filteredData.length} />

      {/* ── Page heading ── */}
      <div className="page-header">
        <h1 className="page-header__title">Webhook Dashboard</h1>
        <p className="page-header__subtitle">Monitor CMS content changes in real time</p>
      </div>

      {/* ── Filters toolbar ── */}
      <div className="toolbar">

        {/* Search field + live suggestion dropdown */}
        <div style={{ position: "relative" }}>
          <div className="search-wrapper">
            <span className="search-wrapper__icon">🔍</span>
            <input
              type="text"
              placeholder="Search title or record ID…"
              value={search}
              className="search-wrapper__input"
              onChange={(e) => { setSearch(e.target.value); setShowSearchDropdown(true); }}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 150)}
            />
            {search && (
              <button className="search-wrapper__clear" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          {showSearchDropdown && search.trim() && searchSuggestions.length > 0 && (
            <div className="suggestions-box">
              {searchSuggestions.slice(0, 6).map((item) => (
                <div
                  key={item._id}
                  className="suggestions-box__item"
                  onMouseDown={() => {
                    setSearch(item.title);
                    setFilteredData([item]);
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

        {/* ── Locales dropdown — click to open/close, scrollable if >4 locales ── */}
        <div style={{ position: "relative" }}>
          <button
            className={`filter-btn ${selectedLocales.length > 0 ? "filter-btn--active" : ""}`}
            onClick={() => { setShowLocales((v) => !v); setShowStage(false); }}
          >
            🌐 Locales
            {selectedLocales.length > 0 && (
              <span className="filter-btn__count">{selectedLocales.length}</span>
            )}
            <span style={{ opacity: 0.5, fontSize: "11px" }}>▼</span>
          </button>

          {showLocales && (
            /* Close when clicking outside */
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 99 }}
                onClick={() => setShowLocales(false)}
              />
              <div className="locale-dropdown" style={{ zIndex: 100 }}>
                <div className="locale-dropdown__heading">Filter by locale</div>
                {allLocales.length === 0 ? (
                  <div style={{ padding: "8px", color: "var(--color-text-muted)", fontSize: "13px" }}>
                    No locales found
                  </div>
                ) : (
                  /* Show max 4 items, scroll the rest */
                  <div style={{ maxHeight: "calc(4 * 38px)", overflowY: "auto" }}>
                    {allLocales.map((locale) => (
                      <label key={locale} className="locale-dropdown__label">
                        <input
                          type="checkbox"
                          checked={selectedLocales.includes(locale)}
                          style={{ accentColor: "var(--color-primary)" }}
                          onChange={(e) =>
                            setSelectedLocales(
                              e.target.checked
                                ? [...selectedLocales, locale]
                                : selectedLocales.filter((l) => l !== locale)
                            )
                          }
                        />
                        {locale.toUpperCase()}
                      </label>
                    ))}
                  </div>
                )}
                {selectedLocales.length > 0 && (
                  <button className="locale-dropdown__clear" onClick={() => setSelectedLocales([])}>
                    Clear all
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Stage dropdown — same click-to-open style as Locales ── */}
        <div style={{ position: "relative" }}>
          <button
            className={`filter-btn ${selectedStage ? "filter-btn--active" : ""}`}
            onClick={() => { setShowStage((v) => !v); setShowLocales(false); }}
          >
            {selectedStage
              ? selectedStage.charAt(0).toUpperCase() + selectedStage.slice(1)
              : "All Stages"}
            <span style={{ opacity: 0.5, fontSize: "11px" }}>▼</span>
          </button>

          {showStage && (
            <>
              {/* Click-away backdrop */}
              <div
                style={{ position: "fixed", inset: 0, zIndex: 99 }}
                onClick={() => setShowStage(false)}
              />
              <div className="locale-dropdown" style={{ zIndex: 100, minWidth: "140px" }}>
                <div className="locale-dropdown__heading">Filter by stage</div>
                {["", "review", "approved", "reject"].map((stage) => (
                  <div
                    key={stage}
                    className="locale-dropdown__label"
                    style={{
                      cursor: "pointer",
                      fontWeight: selectedStage === stage ? 600 : 400,
                      color: selectedStage === stage ? "var(--color-primary)" : "var(--color-text-secondary)",
                      background: selectedStage === stage ? "var(--color-primary-light)" : "transparent",
                      borderRadius: "var(--radius-sm)",
                    }}
                    onClick={() => { setSelectedStage(stage); setShowStage(false); }}
                  >
                    {stage === "" ? "All Stages" : stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Date range pickers ──
            The native <input type="date"> is hidden (opacity 0, zero size).
            Clicking anywhere on the styled box calls .showPicker() on the
            hidden input, so the calendar opens without any "dd-mm-yyyy"
            placeholder text ever being visible.
        ── */}
        <div
          className="date-box"
          onClick={() => startDateRef.current?.showPicker()}
          title="From date"
        >
          <span className="date-box__icon">📅</span>
          <span className="date-box__label">
            {startDate
              ? new Date(startDate + "T00:00:00").toLocaleDateString()
              : "Start date"}
          </span>
          {/* Hidden native input — positioned off-screen so it takes no space */}
          <input
            ref={startDateRef}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              position: "absolute",
              opacity: 0,
              width: 0,
              height: 0,
              pointerEvents: "none",
            }}
          />
        </div>

        <span style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>→</span>

        <div
          className="date-box"
          onClick={() => endDateRef.current?.showPicker()}
          title="End date"
        >
          <span className="date-box__icon">📅</span>
          <span className="date-box__label">
            {endDate
              ? new Date(endDate + "T00:00:00").toLocaleDateString()
              : "End date"}
          </span>
          <input
            ref={endDateRef}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              position: "absolute",
              opacity: 0,
              width: 0,
              height: 0,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Reset button — visible only when filters are active */}
        {hasActiveFilters && (
          <button className="reset-btn" onClick={resetFilters}>✕ Reset</button>
        )}
      </div>

      {/* ── Table card ── */}
      <div className="card">

        {/* Card header: count + rows-per-page */}
        <div className="card__header">
          <span className="card__entry-count">
            Showing <strong>{Math.min(indexOfLast, filteredData.length)}</strong> of{" "}
            <strong>{filteredData.length}</strong> entries
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Rows:</span>
            <select className="rows-select" value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
              {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Horizontally scrollable on small screens */}
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "22%", textAlign: "left" }}>Entity</th>
                <th>Time</th>
                <th>Locales</th>
                <th>Stage</th>
                <th>Previous</th>
                <th>USER</th>
                <th>CMS</th>
                <th>More</th>
              </tr>
            </thead>

            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-state">
                    No records match your current filters.
                  </td>
                </tr>
              ) : (
                currentRows.map((item) => (
                  <React.Fragment key={item._id}>

                    {/* Data row */}
                    <tr>
                      {/* Entity: title + record ID */}
                      <td>
                        <div className="entity-name">{item.title}</div>
                        <div className="entity-id">{item.entityId}</div>
                      </td>

                      {/* Timestamp */}
                      <td>
                        <div style={{ fontWeight: 500 }}>
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

                      {/* Stage badge */}
                      <td><StageBadge value={item.stage} /></td>

                      {/* Previous stage badge */}
                      <td><StageBadge value={item.previousStage} /></td>

                      {/* Environment */}
                      <td>{item.updatedByNames?.join(", ") || "-"}</td>

                      {/* CMS link */}
                      <td>
                        {item.cmsLink
                          ? <a href={item.cmsLink} target="_blank" rel="noreferrer" className="cms-link">Open ↗</a>
                          : <span style={{ color: "var(--color-border)" }}>—</span>
                        }
                      </td>

                      {/* Expand toggle */}
                      <td>
                        <button
                          className={`more-btn ${expanded === item._id ? "more-btn--active" : ""}`}
                          onClick={() => setExpanded(expanded === item._id ? null : item._id)}
                        >
                          {expanded === item._id ? "▲" : "▼"}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded field-changes panel */}
                    {expanded === item._id && (
                      <tr>
                        <td colSpan={9} className="expanded-cell">
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
                                    <div className="locale-block__title">🌐 {locale.toUpperCase()}</div>

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
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span className="pagination__info">Page {currentPage} of {totalPages || 1}</span>
          <div className="pagination__buttons">
            <button className="page-btn" disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}>‹</button>

            {getPageNumbers().map((p) => (
              <button key={p}
                className={`page-btn ${p === currentPage ? "page-btn--active" : ""}`}
                onClick={() => setCurrentPage(p)}>{p}</button>
            ))}

            <button className="page-btn" disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}