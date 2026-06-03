import { MAX_VISIBLE_LOCALES } from "../../../constants/locales";
import "./LocalesCell.css";

export default function LocalesCell({ locales }) {
  if (!locales || locales.length === 0)
    return <span style={{ color: "var(--color-border)" }}>—</span>;

  const visible = locales.slice(0, MAX_VISIBLE_LOCALES);
  const hasMore = locales.length > MAX_VISIBLE_LOCALES;

  return (
    <div className="locales-cell">
      <div className="locales-cell__chips">
        {visible.map((loc) => (
          <span key={loc} className="locale-tag">{loc}</span>
        ))}
        {hasMore && <span className="locale-tag locale-tag--more">…</span>}
      </div>
      {hasMore && (
        <div className="locales-cell__tooltip">
          {locales.map((loc) => (
            <span key={loc} className="locales-cell__tooltip-chip">{loc}</span>
          ))}
        </div>
      )}
    </div>
  );
}
