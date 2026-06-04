import "./TableSummary.css";
import {
  ROWS_PER_PAGE_OPTIONS,
} from "../../constants/pagination";

export default function TableSummary({
  totalCount,
  indexOfLast,
  rowsPerPage,
  onRowsChange,
  entryLabel = "entries",
}) {
  return (
    <div className="table-summary">
      <span className="table-summary__count">
        Showing{" "}
        <strong>
          {Math.min(indexOfLast, totalCount)}
        </strong>{" "}
        of{" "}
        <strong>
          {totalCount}
        </strong>{" "}
        {entryLabel}
      </span>

      <div className="table-summary__rows">
        <span>Rows:</span>

        <select
          className="rows-select"
          value={rowsPerPage}
          onChange={(e) =>
            onRowsChange(Number(e.target.value))
          }
        >
          {ROWS_PER_PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}