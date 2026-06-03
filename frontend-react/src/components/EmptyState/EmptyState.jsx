import "./EmptyState.css";

export default function EmptyState({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="empty-state">
        {message || "No records match your current filters."}
      </td>
    </tr>
  );
}
