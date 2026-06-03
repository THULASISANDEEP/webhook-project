import "./ResetFilter.css";

export default function ResetFilter({ hasActiveFilters, onReset }) {
  if (!hasActiveFilters) return null;
  return (
    <button className="reset-btn" onClick={onReset}>✕ Reset</button>
  );
}
