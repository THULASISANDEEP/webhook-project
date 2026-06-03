import "./FilterDropdown.css";

/**
 * Reusable filter dropdown.
 * Supports both multi-select (checkboxes) and single-select (click rows).
 */
export default function FilterDropdown({
  label, icon, selected, isMulti,
  options, onToggle, onClear,
  show, onOpen, onClose,
  minWidth = "160px",
  heading,
}) {
  const activeCount = isMulti ? selected.length : (selected ? 1 : 0);
  const btnLabel    = isMulti
    ? label
    : (selected ? selected.charAt(0).toUpperCase() + selected.slice(1) : label);

  return (
    <div style={{ position: "relative" }}>
      <button
        className={`filter-btn ${activeCount > 0 ? "filter-btn--active" : ""}`}
        onClick={() => (show ? onClose() : onOpen())}
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
              <div style={{ maxHeight: "calc(4 * 38px)", overflowY: "auto" }}>
                {options.map((opt) =>
                  isMulti ? (
                    <label key={opt.value} className="locale-dropdown__label">
                      <input
                        type="checkbox"
                        checked={selected.includes(opt.value)}
                        style={{ accentColor: "var(--color-primary)" }}
                        onChange={() => onToggle(opt.value)}
                      />
                      <span style={{ flex: 1 }}>{opt.label}</span>
                      <span className="filter-option-count">{opt.count}</span>
                    </label>
                  ) : (
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
                )}
              </div>
            )}

            {isMulti && selected.length > 0 && (
              <button className="locale-dropdown__clear" onClick={onClear}>
                Clear all
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
