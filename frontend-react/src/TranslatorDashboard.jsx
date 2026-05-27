import { useEffect, useState, useRef } from "react";
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
  const [expanded, setExpanded] = useState(null);               // expanded row _id for locale detail
  const [selectedLocales, setSelectedLocales] = useState([]);   // locale filter
  const [showLocales, setShowLocales] = useState(false);        // locale dropdown open
  const [selectedUsers, setSelectedUsers] = useState([]);       // user filter
  const [showUsers, setShowUsers] = useState(false);            // user dropdown open

  /* Refs for hidden date inputs — used to call .showPicker() on box click */
  const fromDateRef = useRef(null);
  const toDateRef   = useRef(null);

  /* ── Fetch rejected records on mount ── */
  useEffect(() => {
    fetch("http://localhost:4000/records")
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
    setSelectedLocales([]);
    setSelectedUsers([]);
    setCurrentPage(1);
  };

  /* ── Apply search + date filters on the fly ── */
  const filteredData = data.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.title?.toLowerCase().includes(q) ||
      item.entityId?.toLowerCase().includes(q);

    const itemDate    = new Date(item.createdAt);
    const matchesFrom = !fromDate || itemDate >= new Date(fromDate);
    const matchesTo   = !toDate   || itemDate <= new Date(toDate + "T23:59:59");

    /* Locale filter */
    const matchesLocale =
      selectedLocales.length === 0 ||
      selectedLocales.some((l) => item.localesChanged?.includes(l));

    /* User filter */
    const matchesUser =
      selectedUsers.length === 0 ||
      selectedUsers.some((u) => (item.updatedByNames || []).includes(u));

    return matchesSearch && matchesFrom && matchesTo && matchesLocale && matchesUser;
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
  const hasActiveFilters = search || fromDate || toDate || selectedLocales.length > 0 || selectedUsers.length > 0;

  /* Unique locales and users from rejected data */
  const allLocales = [...new Set(data.flatMap((item) => item.localesChanged || []))];
  const allUsers   = [...new Set(data.flatMap((item) => item.updatedByNames || []))].filter(Boolean);

  /* Environment from first record */
  const environment = data[0]?.environment || null;

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
      <Navbar onHomeClick={resetFilters} recordCount={filteredData.length} environment={environment} />

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

        {/* ── Locales filter dropdown ── */}
        <div style={{ position: "relative" }}>
          <button
            className={`filter-btn ${selectedLocales.length > 0 ? "filter-btn--active" : ""}`}
            onClick={() => { setShowLocales((v) => !v); setShowUsers(false); }}
          >
            🌐 Locales
            {selectedLocales.length > 0 && (
              <span className="filter-btn__count">{selectedLocales.length}</span>
            )}
            <span style={{ opacity: 0.5, fontSize: "11px" }}>▼</span>
          </button>
          {showLocales && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setShowLocales(false)} />
              <div className="locale-dropdown" style={{ zIndex: 100 }}>
                <div className="locale-dropdown__heading">Filter by locale</div>
                {allLocales.length === 0 ? (
                  <div style={{ padding: "8px", color: "var(--color-text-muted)", fontSize: "13px" }}>No locales found</div>
                ) : (
                  <div style={{ maxHeight: "calc(4 * 38px)", overflowY: "auto" }}>
                    {allLocales.map((locale) => (
                      <label key={locale} className="locale-dropdown__label">
                        <input
                          type="checkbox"
                          checked={selectedLocales.includes(locale)}
                          style={{ accentColor: "var(--color-primary)" }}
                          onChange={(e) =>
                            setSelectedLocales(e.target.checked
                              ? [...selectedLocales, locale]
                              : selectedLocales.filter((l) => l !== locale))
                          }
                        />
                        {locale.toUpperCase()}
                      </label>
                    ))}
                  </div>
                )}
                {selectedLocales.length > 0 && (
                  <button className="locale-dropdown__clear" onClick={() => setSelectedLocales([])}>Clear all</button>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Users filter dropdown ── */}
        <div style={{ position: "relative" }}>
          <button
            className={`filter-btn ${selectedUsers.length > 0 ? "filter-btn--active" : ""}`}
            onClick={() => { setShowUsers((v) => !v); setShowLocales(false); }}
          >
            👤 Users
            {selectedUsers.length > 0 && (
              <span className="filter-btn__count">{selectedUsers.length}</span>
            )}
            <span style={{ opacity: 0.5, fontSize: "11px" }}>▼</span>
          </button>
          {showUsers && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setShowUsers(false)} />
              <div className="locale-dropdown" style={{ zIndex: 100, minWidth: "200px" }}>
                <div className="locale-dropdown__heading">Filter by user</div>
                {allUsers.length === 0 ? (
                  <div style={{ padding: "8px", color: "var(--color-text-muted)", fontSize: "13px" }}>No users found</div>
                ) : (
                  <div style={{ maxHeight: "calc(4 * 38px)", overflowY: "auto" }}>
                    {allUsers.map((user) => (
                      <label key={user} className="locale-dropdown__label">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user)}
                          style={{ accentColor: "var(--color-primary)" }}
                          onChange={(e) =>
                            setSelectedUsers(e.target.checked
                              ? [...selectedUsers, user]
                              : selectedUsers.filter((u) => u !== user))
                          }
                        />
                        {user}
                      </label>
                    ))}
                  </div>
                )}
                {selectedUsers.length > 0 && (
                  <button className="locale-dropdown__clear" onClick={() => setSelectedUsers([])}>Clear all</button>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Date range pickers ──
            Hidden native inputs; clicking the styled box calls .showPicker()
            so no "dd-mm-yyyy" placeholder is ever visible.
        ── */}
        <div
          className="date-box"
          onClick={() => fromDateRef.current?.showPicker()}
          title="From date"
        >
          <span className="date-box__icon">📅</span>
          <span className="date-box__label">
            {fromDate
              ? new Date(fromDate + "T00:00:00").toLocaleDateString()
              : "Start date"}
          </span>
          <input
            ref={fromDateRef}
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
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
          onClick={() => toDateRef.current?.showPicker()}
          title="End date"
        >
          <span className="date-box__icon">📅</span>
          <span className="date-box__label">
            {toDate
              ? new Date(toDate + "T00:00:00").toLocaleDateString()
              : "End date"}
          </span>
          <input
            ref={toDateRef}
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
            style={{
              position: "absolute",
              opacity: 0,
              width: 0,
              height: 0,
              pointerEvents: "none",
            }}
          />
        </div>

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
                <th>USER</th>
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

                      {/* Locale chips — capped width, tooltip on hover */}
                      <td>
                        <div className="locales-cell">
                          <div className="locales-cell__chips">
                            {(item.localesChanged || []).length > 0
                              ? item.localesChanged.map((loc) => (
                                  <span key={loc} className="locale-tag">{loc}</span>
                                ))
                              : <span style={{ color: "var(--color-border)" }}>—</span>
                            }
                          </div>
                          {(item.localesChanged || []).length > 0 && (
                            <div className="locales-cell__tooltip">
                              {item.localesChanged.join(" · ")}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stage badge */}
                      <td><StageBadge value={item.stage} /></td>

                      {/* User — truncated, full names on hover */}
                      <td>
                        {(item.updatedByNames || []).length > 0 ? (
                          <div className="user-cell">
                            <span className="user-cell__text">
                              {item.updatedByNames.join(", ")}
                            </span>
                            <div className="user-cell__tooltip">
                              {item.updatedByNames.map((name, i) => (
                                <div key={i} className="user-cell__tooltip-name">{name}</div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: "var(--color-text-muted)" }}>—</span>
                        )}
                      </td>

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