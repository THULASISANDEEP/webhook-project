import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./App.css";

/* ─────────────────────────────────────────────
   STAGE BADGE — coloured pill for stage values
───────────────────────────────────────────── */
export const StageBadge = ({ value }) => {
  if (!value) return <span className="badge badge--neutral">—</span>;
  const cls = { review: "badge badge--review", approved: "badge badge--approved", reject: "badge badge--reject" };
  return <span className={cls[value.toLowerCase()] || "badge badge--neutral"}>{value}</span>;
};

/* ─────────────────────────────────────────────
   SHARED NAVBAR
───────────────────────────────────────────── */
export const Navbar = ({ onHomeClick, recordCount, environment }) => {
  const location = useLocation();
  const envLabel = environment
    ? environment.charAt(0).toUpperCase() + environment.slice(1).toLowerCase()
    : null;

  return (
    <nav className="navbar">
      <div className="navbar__left">
        <span className="navbar__brand">⚡ WebhookCMS</span>
        <Link to="/" onClick={onHomeClick}
          className={`navbar__link ${location.pathname === "/" ? "navbar__link--active" : ""}`}>
          Admin
        </Link>
        <Link to="/translator"
          className={`navbar__link ${location.pathname === "/translator" ? "navbar__link--active" : ""}`}>
          Translator
        </Link>
      </div>
      <div className="navbar__right">
        {recordCount !== undefined && (
          <span className="navbar__count">{recordCount} record{recordCount !== 1 ? "s" : ""}</span>
        )}
        {envLabel && <span className="navbar__env-badge">{envLabel}</span>}
      </div>
    </nav>
  );
};

/* ─────────────────────────────────────────────
   REUSABLE FILTER DROPDOWN
   Used for Locales, Stage, and Users.
   Props:
     label       — button text when nothing selected
     icon        — emoji prefix
     selected    — array (locales/users) or string (stage)
     isMulti     — true = checkboxes, false = single-select
     options     — array of { value, label, count }
     onToggle    — (value) => void
     onClear     — () => void
     show        — boolean
     onOpen      — () => void
     onClose     — () => void
───────────────────────────────────────────── */
const FilterDropdown = ({
  label, icon, selected, isMulti,
  options, onToggle, onClear,
  show, onOpen, onClose,
  minWidth = "160px",
  heading,
}) => {
  /* Count of active selections */
  const activeCount = isMulti ? selected.length : (selected ? 1 : 0);

  /* Label shown on the trigger button */
  const btnLabel = isMulti
    ? label
    : (selected ? selected.charAt(0).toUpperCase() + selected.slice(1) : label);

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        className={`filter-btn ${activeCount > 0 ? "filter-btn--active" : ""}`}
        onClick={() => show ? onClose() : onOpen()}
      >
        {icon && <span>{icon}</span>}
        {btnLabel}
        {isMulti && activeCount > 0 && (
          <span className="filter-btn__count">{activeCount}</span>
        )}
        <span style={{ opacity: 0.5, fontSize: "11px" }}>▼</span>
      </button>

      {show && (
        <>
          {/* Click-away backdrop */}
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={onClose} />

          <div className="locale-dropdown" style={{ zIndex: 100, minWidth }}>
            <div className="locale-dropdown__heading">{heading}</div>

            {options.length === 0 ? (
              <div style={{ padding: "8px", color: "var(--color-text-muted)", fontSize: "13px" }}>
                No options found
              </div>
            ) : (
              /* Scrollable list — max 4 items visible */
              <div style={{ maxHeight: "calc(4 * 38px)", overflowY: "auto" }}>
                {options.map((opt) => (
                  isMulti ? (
                    /* Multi-select: checkbox row */
                    <label key={opt.value} className="locale-dropdown__label">
                      <input
                        type="checkbox"
                        checked={selected.includes(opt.value)}
                        style={{ accentColor: "var(--color-primary)" }}
                        onChange={() => onToggle(opt.value)}
                      />
                      <span style={{ flex: 1 }}>{opt.label}</span>
                      {/* Count badge on the right */}
                      <span className="filter-option-count">{opt.count}</span>
                    </label>
                  ) : (
                    /* Single-select: clickable row */
                    <div
                      key={opt.value}
                      className="locale-dropdown__label"
                      style={{
                        cursor: "pointer",
                        fontWeight: selected === opt.value ? 600 : 400,
                        color: selected === opt.value ? "var(--color-primary)" : "var(--color-text-secondary)",
                        background: selected === opt.value ? "var(--color-primary-light)" : "transparent",
                        borderRadius: "var(--radius-sm)",
                      }}
                      onClick={() => { onToggle(opt.value); onClose(); }}
                    >
                      <span style={{ flex: 1 }}>{opt.label}</span>
                      <span className="filter-option-count">{opt.count}</span>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Clear all — multi only */}
            {isMulti && selected.length > 0 && (
              <button className="locale-dropdown__clear" onClick={onClear}>Clear all</button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   LOCALES CELL
   Shows first 3 chips. If more, shows "…" and
   a tooltip with all locales on hover.
───────────────────────────────────────────── */
const LocalesCell = ({ locales }) => {
  if (!locales || locales.length === 0)
    return <span style={{ color: "var(--color-border)" }}>—</span>;

  const visible  = locales.slice(0, 3);
  const hasMore  = locales.length > 3;

  return (
    <div className="locales-cell">
      <div className="locales-cell__chips">
        {visible.map((loc) => (
          <span key={loc} className="locale-tag">{loc}</span>
        ))}
        {hasMore && <span className="locale-tag locale-tag--more">…</span>}
      </div>
      {/* Tooltip only when there are more than 3 */}
      {hasMore && (
        <div className="locales-cell__tooltip">
          {locales.map((loc) => (
            <span key={loc} className="locales-cell__tooltip-chip">{loc}</span>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   USER CELL
   Single user  → name only, no extra indicator.
   Multiple users → name + small "⋯" dot-box so
   it's immediately clear more names exist.
   Hover shows tooltip with all names.
───────────────────────────────────────────── */
const UserCell = ({ names }) => {
  if (!names || names.length === 0)
    return <span style={{ color: "var(--color-text-muted)" }}>—</span>;

  const hasMore = names.length > 1;

  return (
    <div className="user-cell">
      {/* First name — truncated if too long */}
      <span className="user-cell__text">{names[0]}</span>

      {/* Dot-box — only shown when there are more names */}
      {hasMore && (
        <span className="user-cell__more-dot" title={`+${names.length - 1} more`}>⋯</span>
      )}

      {/* Tooltip lists all names — only rendered when hasMore */}
      {hasMore && (
        <div className="user-cell__tooltip">
          {names.map((name, i) => (
            <div key={i} className="user-cell__tooltip-name">{name}</div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN DASHBOARD
───────────────────────────────────────────── */
export default function MainDashboard() {
  const [data,           setData]           = useState([]);
  const [filteredData,   setFilteredData]   = useState([]);
  const [selectedLocales,setSelectedLocales]= useState([]);
  const [selectedStage,  setSelectedStage]  = useState("");
  const [startDate,      setStartDate]      = useState("");
  const [endDate,        setEndDate]        = useState("");
  const [search,         setSearch]         = useState("");
  const [expanded,       setExpanded]       = useState(null);
  const [showLocales,    setShowLocales]    = useState(false);
  const [showStage,      setShowStage]      = useState(false);
  const [showUsers,      setShowUsers]      = useState(false);
  const [selectedUsers,  setSelectedUsers]  = useState([]);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [rowsPerPage,    setRowsPerPage]    = useState(10);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const startDateRef = useRef(null);
  const endDateRef   = useRef(null);

  /* ── Fetch ── */
  const fetchData = async () => {
    const res  = await fetch("http://localhost:4000/records");
    const json = await res.json();
    setData(json.data || []);
    setFilteredData(json.data || []);
  };
  useEffect(() => { fetchData(); }, []);

  /* ── Re-filter on any change ── */
  useEffect(() => { applyFilters(); }, [
    search, selectedLocales, selectedStage, selectedUsers, startDate, endDate, data,
  ]);

  const applyFilters = () => {
    let f = [...data];
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter((i) => i.title?.toLowerCase().includes(q) || i.entityId?.toLowerCase().includes(q));
    }
    if (selectedLocales.length > 0)
      f = f.filter((i) => selectedLocales.some((l) => i.localesChanged?.includes(l)));
    if (selectedStage)
      f = f.filter((i) => i.stage === selectedStage);
    if (startDate)
      f = f.filter((i) => new Date(i.createdAt) >= new Date(startDate));
    if (endDate)
      f = f.filter((i) => new Date(i.createdAt) <= new Date(endDate + "T23:59:59"));
    if (selectedUsers.length > 0)
      f = f.filter((i) => selectedUsers.some((u) => (i.updatedByNames || []).includes(u)));
    setFilteredData(f);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch(""); setSelectedLocales([]); setSelectedStage("");
    setSelectedUsers([]); setStartDate(""); setEndDate("");
    setCurrentPage(1); setFilteredData(data);
  };

  const getDisplayValue = (value) => {
    if (!value) return "-";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.document?.children) {
      try {
        return value.document.children
          .map((child) => child.children?.map((c) => c.value || "").join("")).join(" ");
      } catch { return "[Structured Text]"; }
    }
    return JSON.stringify(value);
  };

  /* ── Derived option lists with counts ── */
  const allLocales = [...new Set(data.flatMap((i) => i.localesChanged || []))];
  const allUsers   = [...new Set(data.flatMap((i) => i.updatedByNames  || []))].filter(Boolean);
  const environment = data[0]?.environment || null;

  /* Count how many records in `data` contain each locale/user/stage */
  const localeOptions = allLocales.map((loc) => ({
    value: loc,
    label: loc.toUpperCase(),
    count: data.filter((i) => i.localesChanged?.includes(loc)).length,
  }));

  const stageOptions = ["", "review", "approved", "reject"].map((s) => ({
    value: s,
    label: s === "" ? "All Stages" : s.charAt(0).toUpperCase() + s.slice(1),
    count: s === "" ? data.length : data.filter((i) => i.stage === s).length,
  }));

  const userOptions = allUsers.map((u) => ({
    value: u,
    label: u,
    count: data.filter((i) => (i.updatedByNames || []).includes(u)).length,
  }));

  /* ── Pagination ── */
  const totalPages  = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const currentRows = filteredData.slice(indexOfLast - rowsPerPage, indexOfLast);
  const getPageNumbers = () => {
    const pages = [];
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++)
      pages.push(i);
    return pages;
  };

  const searchSuggestions = data.filter((i) => {
    const q = search.toLowerCase();
    return i.title?.toLowerCase().includes(q) || i.entityId?.toLowerCase().includes(q);
  });

  const hasActiveFilters = search || selectedLocales.length > 0 || selectedStage ||
    selectedUsers.length > 0 || startDate || endDate;

  /* ── Helpers to close other dropdowns when one opens ── */
  const openLocales = () => { setShowLocales(true);  setShowStage(false); setShowUsers(false); };
  const openStage   = () => { setShowStage(true);    setShowLocales(false); setShowUsers(false); };
  const openUsers   = () => { setShowUsers(true);    setShowLocales(false); setShowStage(false); };

  /* ═══════════════════════════════════════ RENDER ══════════════════════════════════════ */
  return (
    /*
      Layout:
        .page-outer  — full viewport height, flex-column, no overflow
          navbar     — fixed height, sticky
          page-header— fixed height
          toolbar    — fixed height
          .page-inner — flex:1, overflow hidden, flex-column
            card__header — fixed
            table-head   — fixed (sticky thead)
            table-body   — flex:1, overflowY scroll
            pagination   — fixed
    */
    <div className="page-outer">

      {/* ── Navbar (sticky) ── */}
      <Navbar onHomeClick={resetFilters} recordCount={filteredData.length} environment={environment} />

      {/* ── Page heading ── */}
      <div className="page-header">
        <h1 className="page-header__title">Webhook Dashboard</h1>
        <p className="page-header__subtitle">Monitor CMS content changes in real time</p>
      </div>

      {/* ── Filters toolbar ── */}
      <div className="toolbar">

        {/* Search */}
        <div style={{ position: "relative" }}>
          <div className="search-wrapper">
            <span className="search-wrapper__icon">🔍</span>
            <input type="text" placeholder="Search title or record ID…" value={search}
              className="search-wrapper__input"
              onChange={(e) => { setSearch(e.target.value); setShowSearchDropdown(true); }}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 150)} />
            {search && <button className="search-wrapper__clear" onClick={() => setSearch("")}>✕</button>}
          </div>
          {showSearchDropdown && search.trim() && searchSuggestions.length > 0 && (
            <div className="suggestions-box">
              {searchSuggestions.slice(0, 6).map((item) => (
                <div key={item._id} className="suggestions-box__item"
                  onMouseDown={() => { setSearch(item.title); setFilteredData([item]); setShowSearchDropdown(false); }}>
                  <div className="suggestions-box__title">{item.title}</div>
                  <div className="suggestions-box__id">{item.entityId}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Locales filter */}
        <FilterDropdown
          label="Locales" icon="🌐" isMulti heading="Filter by locale"
          options={localeOptions} selected={selectedLocales}
          onToggle={(v) => setSelectedLocales((prev) =>
            prev.includes(v) ? prev.filter((l) => l !== v) : [...prev, v])}
          onClear={() => setSelectedLocales([])}
          show={showLocales} onOpen={openLocales} onClose={() => setShowLocales(false)}
        />

        {/* Stage filter */}
        <FilterDropdown
          label="All Stages" isMulti={false} heading="Filter by stage"
          options={stageOptions} selected={selectedStage}
          onToggle={(v) => setSelectedStage(v)}
          onClear={() => setSelectedStage("")}
          show={showStage} onOpen={openStage} onClose={() => setShowStage(false)}
          minWidth="180px"
        />

        {/* Users filter */}
        <FilterDropdown
          label="Users" icon="👤" isMulti heading="Filter by user"
          options={userOptions} selected={selectedUsers}
          onToggle={(v) => setSelectedUsers((prev) =>
            prev.includes(v) ? prev.filter((u) => u !== v) : [...prev, v])}
          onClear={() => setSelectedUsers([])}
          show={showUsers} onOpen={openUsers} onClose={() => setShowUsers(false)}
          minWidth="220px"
        />

        {/* Date range — hidden native inputs, styled boxes */}
        <div className="date-box" onClick={() => startDateRef.current?.showPicker()} title="From date">
          <span className="date-box__icon">📅</span>
          <span className="date-box__label">{startDate ? new Date(startDate + "T00:00:00").toLocaleDateString() : "Start date"}</span>
          <input ref={startDateRef} type="date" value={startDate}
            onChange={(e) => setStartDate(e.target.value)} />
        </div>

        <span style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>→</span>

        <div className="date-box" onClick={() => endDateRef.current?.showPicker()} title="End date">
          <span className="date-box__icon">📅</span>
          <span className="date-box__label">{endDate ? new Date(endDate + "T00:00:00").toLocaleDateString() : "End date"}</span>
          <input ref={endDateRef} type="date" value={endDate}
            onChange={(e) => setEndDate(e.target.value)} />
        </div>

        {hasActiveFilters && <button className="reset-btn" onClick={resetFilters}>✕ Reset</button>}
      </div>

      {/* ── Table area (fills remaining height, scrolls only tbody) ── */}
      <div className="page-inner">
        <div className="card-inner">

          {/* Card header — fixed */}
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

          {/* Table with sticky thead + scrollable tbody */}
          <div className="table-scroll-area">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "22%", textAlign: "left" }}>Entity</th>
                  <th>Time</th>
                  <th>Locales</th>
                  <th>Stage</th>
                  <th>Previous</th>
                  <th>User</th>
                  <th>CMS</th>
                  <th>More</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-state">No records match your current filters.</td>
                  </tr>
                ) : (
                  currentRows.map((item) => (
                    <React.Fragment key={item._id}>
                      <tr>
                        {/* Entity */}
                        <td>
                          <div className="entity-name">{item.title}</div>
                          <div className="entity-id">{item.entityId}</div>
                        </td>
                        {/* Time */}
                        <td>
                          <div style={{ fontWeight: 500 }}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        {/* Locales — max 3 visible, tooltip if more */}
                        <td><LocalesCell locales={item.localesChanged} /></td>
                        {/* Stage */}
                        <td><StageBadge value={item.stage} /></td>
                        {/* Previous stage */}
                        <td><StageBadge value={item.previousStage} /></td>
                        {/* User — first name only, tooltip for rest */}
                        <td><UserCell names={item.updatedByNames} /></td>
                        {/* CMS link */}
                        <td>
                          {item.cmsLink
                            ? <a href={item.cmsLink} target="_blank" rel="noreferrer" className="cms-link">Open ↗</a>
                            : <span style={{ color: "var(--color-border)" }}>—</span>}
                        </td>
                        {/* Expand toggle */}
                        <td>
                          <button
                            className={`more-btn ${expanded === item._id ? "more-btn--active" : ""}`}
                            onClick={() => setExpanded(expanded === item._id ? null : item._id)}>
                            {expanded === item._id ? "▲" : "▼"}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded field-changes panel — max 5 locale blocks per row */}
                      {expanded === item._id && (
                        <tr>
                          <td colSpan={8} className="expanded-cell">
                            <div className="expanded-inner">
                              <div className="expanded-heading">Field Changes</div>
                              {Object.keys(item.localeChanges || {}).length === 0 ? (
                                <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
                                  No field changes recorded.
                                </p>
                              ) : (
                                /* Chunk the locale entries into rows of max 5 */
                                (() => {
                                  const entries = Object.entries(item.localeChanges || {});
                                  const rows    = [];
                                  for (let i = 0; i < entries.length; i += 5)
                                    rows.push(entries.slice(i, i + 5));
                                  return rows.map((rowEntries, rowIdx) => (
                                    <div key={rowIdx} className="locale-blocks">
                                      {rowEntries.map(([locale, changes]) => (
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
                                  ));
                                })()
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

          {/* Pagination — fixed at bottom */}
          <div className="pagination">
            <span className="pagination__info">Page {currentPage} of {totalPages || 1}</span>
            <div className="pagination__buttons">
              <button className="page-btn" disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}>‹</button>
              {getPageNumbers().map((p) => (
                <button key={p} className={`page-btn ${p === currentPage ? "page-btn--active" : ""}`}
                  onClick={() => setCurrentPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}>›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}