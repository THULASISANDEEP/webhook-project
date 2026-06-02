import { useEffect, useState, useRef } from "react";
import "./App.css";
import { StageBadge, Navbar } from "./MainDashboard";

/* ─────────────────────────────────────────────
   Reusable sub-components imported inline
   (LocalesCell, UserCell, FilterDropdown are
    defined in MainDashboard and re-used here
    via a local copy to avoid circular imports)
───────────────────────────────────────────── */

const FilterDropdown = ({
  label, icon, selected, isMulti,
  options, onToggle, onClear,
  show, onOpen, onClose,
  minWidth = "160px", heading,
}) => {
  const activeCount = isMulti ? selected.length : (selected ? 1 : 0);
  const btnLabel    = isMulti
    ? label
    : (selected ? selected.charAt(0).toUpperCase() + selected.slice(1) : label);

  return (
    <div style={{ position: "relative" }}>
      <button
        className={`filter-btn ${activeCount > 0 ? "filter-btn--active" : ""}`}
        onClick={() => show ? onClose() : onOpen()}>
        {icon && <span>{icon}</span>}
        {btnLabel}
        {isMulti && activeCount > 0 && <span className="filter-btn__count">{activeCount}</span>}
        <span style={{ opacity: 0.5, fontSize: "11px" }}>▼</span>
      </button>

      {show && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={onClose} />
          <div className="locale-dropdown" style={{ zIndex: 100, minWidth }}>
            <div className="locale-dropdown__heading">{heading}</div>
            {options.length === 0 ? (
              <div style={{ padding: "8px", color: "var(--color-text-muted)", fontSize: "13px" }}>No options found</div>
            ) : (
              <div style={{ maxHeight: "calc(4 * 38px)", overflowY: "auto" }}>
                {options.map((opt) =>
                  isMulti ? (
                    <label key={opt.value} className="locale-dropdown__label">
                      <input type="checkbox" checked={selected.includes(opt.value)}
                        style={{ accentColor: "var(--color-primary)" }}
                        onChange={() => onToggle(opt.value)} />
                      <span style={{ flex: 1 }}>{opt.label}</span>
                      <span className="filter-option-count">{opt.count}</span>
                    </label>
                  ) : (
                    <div key={opt.value} className="locale-dropdown__label"
                      style={{
                        cursor: "pointer",
                        fontWeight: selected === opt.value ? 600 : 400,
                        color: selected === opt.value ? "var(--color-primary)" : "var(--color-text-secondary)",
                        background: selected === opt.value ? "var(--color-primary-light)" : "transparent",
                        borderRadius: "var(--radius-sm)",
                      }}
                      onClick={() => { onToggle(opt.value); onClose(); }}>
                      <span style={{ flex: 1 }}>{opt.label}</span>
                      <span className="filter-option-count">{opt.count}</span>
                    </div>
                  )
                )}
              </div>
            )}
            {isMulti && selected.length > 0 && (
              <button className="locale-dropdown__clear" onClick={onClear}>Clear all</button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const LocalesCell = ({ locales }) => {
  if (!locales || locales.length === 0)
    return <span style={{ color: "var(--color-border)" }}>—</span>;
  const visible = locales.slice(0, 3);
  const hasMore = locales.length > 3;
  return (
    <div className="locales-cell">
      <div className="locales-cell__chips">
        {visible.map((loc) => <span key={loc} className="locale-tag">{loc}</span>)}
        {hasMore && <span className="locale-tag locale-tag--more">…</span>}
      </div>
      {hasMore && (
        <div className="locales-cell__tooltip">
          {locales.map((loc) => <span key={loc} className="locales-cell__tooltip-chip">{loc}</span>)}
        </div>
      )}
    </div>
  );
};

const UserCell = ({ names }) => {
  if (!names || names.length === 0)
    return <span style={{ color: "var(--color-text-muted)" }}>—</span>;
  const hasMore = names.length > 1;
  return (
    <div className="user-cell">
      <span className="user-cell__text">{names[0]}</span>
      {hasMore && (
        <span className="user-cell__more-dot" title={`+${names.length - 1} more`}>⋯</span>
      )}
      {hasMore && (
        <div className="user-cell__tooltip">
          {names.map((name, i) => <div key={i} className="user-cell__tooltip-name">{name}</div>)}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   TRANSLATOR DASHBOARD
───────────────────────────────────────────── */
export default function TranslatorDashboard() {
  const [data,            setData]            = useState([]);
  const [search,          setSearch]          = useState("");
  const [fromDate,        setFromDate]        = useState("");
  const [toDate,          setToDate]          = useState("");
  const [currentPage,     setCurrentPage]     = useState(1);
  const [rowsPerPage,     setRowsPerPage]     = useState(10);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [expanded,        setExpanded]        = useState(null);
  const [selectedLocales, setSelectedLocales] = useState([]);
  const [showLocales,     setShowLocales]     = useState(false);
  const [selectedUsers,   setSelectedUsers]   = useState([]);
  const [showUsers,       setShowUsers]       = useState(false);

  const fromDateRef = useRef(null);
  const toDateRef   = useRef(null);

  useEffect(() => {
    fetch("http://localhost:4000/records")
      .then((r) => r.json())
      .then((r) => setData((r.data || []).filter((i) => i.stage === "reject")));
  }, []);

  const resetFilters = () => {
    setSearch(""); setFromDate(""); setToDate("");
    setSelectedLocales([]); setSelectedUsers([]); setCurrentPage(1);
  };

  const filteredData = data.filter((item) => {
    const q            = search.toLowerCase();
    const matchSearch  = item.title?.toLowerCase().includes(q) || item.entityId?.toLowerCase().includes(q);
    const itemDate     = new Date(item.createdAt);
    const matchFrom    = !fromDate || itemDate >= new Date(fromDate);
    const matchTo      = !toDate   || itemDate <= new Date(toDate + "T23:59:59");
    const matchLocale  = selectedLocales.length === 0 || selectedLocales.some((l) => item.localesChanged?.includes(l));
    const matchUser    = selectedUsers.length === 0 || selectedUsers.some(
  (u) =>
    (item.updatedByNames || []).some(
      (x) => x.name === u
    )
);
    return matchSearch && matchFrom && matchTo && matchLocale && matchUser;
  });

  const totalPages  = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const currentRows = filteredData.slice(indexOfLast - rowsPerPage, indexOfLast);
  const getPageNumbers = () => {
    const pages = [];
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) pages.push(i);
    return pages;
  };

  const searchSuggestions = data.filter((i) => {
    const q = search.toLowerCase();
    return i.title?.toLowerCase().includes(q) || i.entityId?.toLowerCase().includes(q);
  });

  const hasActiveFilters = search || fromDate || toDate || selectedLocales.length > 0 || selectedUsers.length > 0;
  const allLocales        = [...new Set(data.flatMap((i) => i.localesChanged || []))];
  const allUsers = [
    ...new Set(
      data.flatMap(
        (i) =>
          (i.updatedByNames || []).map(
            (u) => u.name
          )
      )
    )
  ];
  const environment       = data[0]?.environment || null;

  /* Options with counts */
  const localeOptions = allLocales.map((loc) => ({
    value: loc, label: loc.toUpperCase(),
    count: data.filter((i) => i.localesChanged?.includes(loc)).length,
  }));
  const userOptions = allUsers.map((u) => ({
    value: u, label: u,
    count: data.filter(
  (i) =>
    (i.updatedByNames || []).some(
      (x) => x.name === u
    )
).length,
  }));

  const openLocales = () => { setShowLocales(true);  setShowUsers(false); };
  const openUsers   = () => { setShowUsers(true);    setShowLocales(false); };

  const getDisplayValue = (value) => {
    if (!value) return "-";
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.document?.children) {
      try {
        return value.document.children
          .map((c) => c.children?.map((x) => x.value || "").join("")).join(" ");
      } catch { return "[Structured Text]"; }
    }
    return JSON.stringify(value);
  };

  /* ═══ RENDER ═══ */
  return (
    <div className="page-outer">

      <Navbar onHomeClick={resetFilters} recordCount={filteredData.length} environment={environment} />

      <div className="page-header">
        <h1 className="page-header__title">Translator Dashboard</h1>
        <p className="page-header__subtitle">
          Rejected records requiring translation review
          {data.length > 0 && (
            <span style={{ marginLeft: "12px", background: "var(--color-danger-bg)", color: "var(--color-danger)",
              padding: "2px 10px", borderRadius: "20px", fontSize: "13px", fontWeight: 600 }}>
              {data.length} rejected
            </span>
          )}
        </p>
      </div>

      <div className="toolbar">

        {/* Search */}
        <div style={{ position: "relative" }}>
          <div className="search-wrapper">
            <span className="search-wrapper__icon">🔍</span>
            <input type="text" placeholder="Search title or record ID…" value={search}
              className="search-wrapper__input"
              onChange={(e) => { setSearch(e.target.value); setShowSearchDropdown(true); setCurrentPage(1); }}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 150)} />
            {search && <button className="search-wrapper__clear" onClick={() => setSearch("")}>✕</button>}
          </div>
          {showSearchDropdown && search.trim() && searchSuggestions.length > 0 && (
            <div className="suggestions-box">
              {searchSuggestions.slice(0, 6).map((item) => (
                <div key={item._id} className="suggestions-box__item"
                  onMouseDown={() => { setSearch(item.title); setShowSearchDropdown(false); }}>
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
          onToggle={(v) => setSelectedLocales((p) => p.includes(v) ? p.filter((l) => l !== v) : [...p, v])}
          onClear={() => setSelectedLocales([])}
          show={showLocales} onOpen={openLocales} onClose={() => setShowLocales(false)} />

        {/* Users filter */}
        <FilterDropdown
          label="Users" icon="👤" isMulti heading="Filter by user"
          options={userOptions} selected={selectedUsers}
          onToggle={(v) => setSelectedUsers((p) => p.includes(v) ? p.filter((u) => u !== v) : [...p, v])}
          onClear={() => setSelectedUsers([])}
          show={showUsers} onOpen={openUsers} onClose={() => setShowUsers(false)}
          minWidth="220px" />

        {/* Date pickers */}
        <div className="date-box" onClick={() => fromDateRef.current?.showPicker()} title="From date">
          <span className="date-box__icon">📅</span>
          <span className="date-box__label">{fromDate ? new Date(fromDate + "T00:00:00").toLocaleDateString() : "Start date"}</span>
          <input ref={fromDateRef} type="date" value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }} />
        </div>
        <span style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>→</span>
        <div className="date-box" onClick={() => toDateRef.current?.showPicker()} title="End date">
          <span className="date-box__icon">📅</span>
          <span className="date-box__label">{toDate ? new Date(toDate + "T00:00:00").toLocaleDateString() : "End date"}</span>
          <input ref={toDateRef} type="date" value={toDate}
            onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }} />
        </div>

        {hasActiveFilters && <button className="reset-btn" onClick={resetFilters}>✕ Reset</button>}
      </div>

      {/* Table area */}
      <div className="page-inner">
        <div className="card-inner">
          <div className="card__header">
            <span className="card__entry-count">
              Showing <strong>{Math.min(indexOfLast, filteredData.length)}</strong> of{" "}
              <strong>{filteredData.length}</strong> rejected records
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>Rows:</span>
              <select className="rows-select" value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="table-scroll-area">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left", width: "28%" }}>Entity</th>
                  <th>Time</th>
                  <th>Locales</th>
                  <th>Stage</th>
                  <th>User</th>
                  <th>CMS</th>
                  <th>More</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      {data.length === 0 ? "No rejected records found." : "No records match your current filters."}
                    </td>
                  </tr>
                ) : (
                  currentRows.map((item) => (
                    <>
                      <tr key={item._id}>
                        <td>
                          <div className="entity-name">{item.title}</div>
                          <div className="entity-id">{item.entityId}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td><LocalesCell locales={item.localesChanged} /></td>
                        <td><StageBadge value={item.stage} /></td>
                        <td><UserCell
  names={
    item.updatedByNames?.map(
      (u) => u.name
    ) || []
  }
/></td>
                        <td>
                          {item.cmsLink
                            ? <a href={item.cmsLink} target="_blank" rel="noreferrer" className="cms-link">Open ↗</a>
                            : <span style={{ color: "var(--color-border)" }}>—</span>}
                        </td>
                        <td>
                          <button className={`more-btn ${expanded === item._id ? "more-btn--active" : ""}`}
                            onClick={() => setExpanded(expanded === item._id ? null : item._id)}>
                            {expanded === item._id ? "▲" : "▼"}
                          </button>
                        </td>
                      </tr>

                      {expanded === item._id && (
                        <tr key={`${item._id}-exp`}>
                          <td colSpan={7} className="expanded-cell">
                            <div className="expanded-inner">
                              <div className="expanded-heading">Field Changes</div>
                              {/* REVIEW HISTORY */}
{item.changeStageToReview?.users?.length > 0 && (
  <div
    style={{
      marginBottom: "20px",
      padding: "15px",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      background: "#fafafa",
    }}
  >
    <h4 style={{ marginBottom: "10px" }}>
      Review History
    </h4>

    <div
      style={{
        fontSize: "13px",
        color: "#666",
        marginBottom: "10px",
      }}
    >
      Date: {item.changeStageToReview.date}
    </div>

    {item.changeStageToReview.users.map(
      (user, index) => (
        <div
          key={index}
          style={{
            padding: "8px 0",
            borderBottom:
              index !==
              item.changeStageToReview.users.length - 1
                ? "1px solid #ddd"
                : "none",
          }}
        >
          <div>
            <strong>{user.name}</strong>
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "#666",
            }}
          >
            {user.time}
          </div>
        </div>
      )
    )}
  </div>
)}
                              {Object.keys(item.localeChanges || {}).length === 0 ? (
                                <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>No field changes recorded.</p>
                              ) : (
                                (() => {
                                  const entries = Object.entries(item.localeChanges || {});
                                  const rows    = [];
                                  for (let i = 0; i < entries.length; i += 5) rows.push(entries.slice(i, i + 5));
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
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

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