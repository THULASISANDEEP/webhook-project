import { getDisplayValue, chunkArray } from "../../utils/displayUtils";
import { LOCALE_BLOCKS_PER_ROW } from "../../constants/uiConstants";
import "./LocaleChanges.css";

export default function LocaleChanges({ localeChanges }) {
  const entries = Object.entries(localeChanges || {});

  if (entries.length === 0) {
    return (
      <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
        No field changes recorded.
      </p>
    );
  }

  const rows = chunkArray(entries, LOCALE_BLOCKS_PER_ROW);

  return (
    <>
      {rows.map((rowEntries, rowIdx) => (
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
      ))}
    </>
  );
}
