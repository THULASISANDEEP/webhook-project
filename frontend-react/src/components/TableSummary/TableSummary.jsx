import "./TableSummary.css";

export default function TableSummary({
  totalCount,
  indexOfLast,
  rowsPerPage,
  onRowsChange,
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
        entries
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
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}