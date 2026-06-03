import TableHeader  from "./TableHeader";
import TableRow     from "./TableRow";
import EmptyState   from "../EmptyState/EmptyState";
import "./DataTable.css";

/**
 * Props:
 *  columns       — [{ label, width?, align? }]
 *  rows          — current page's record array
 *  expandedId    — _id of the currently expanded row (or null)
 *  onToggleExpand — (id) => void
 *  showPrevStage — boolean
 */
export default function DataTable({ columns, rows, expandedId, onToggleExpand, showPrevStage }) {
  const colSpan = columns.length;

  return (
    <div className="table-scroll-area">
      <table className="data-table">
        <TableHeader columns={columns} />
        <tbody>
          {rows.length === 0 ? (
            <EmptyState colSpan={colSpan} />
          ) : (
            rows.map((item) => (
              <TableRow
                key={item._id}
                item={item}
                isExpanded={expandedId === item._id}
                onToggle={() => onToggleExpand(item._id)}
                colSpan={colSpan}
                showPrevStage={showPrevStage}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
