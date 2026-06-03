import "./SearchBox.css";

export default function SearchBox({ value, onChange, onFocus, onBlur, onClear }) {
  return (
    <div className="search-wrapper">
      <span className="search-wrapper__icon">🔍</span>
      <input
        type="text"
        placeholder="Search title or record ID…"
        value={value}
        className="search-wrapper__input"
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {value && (
        <button className="search-wrapper__clear" onClick={onClear}>✕</button>
      )}
    </div>
  );
}
