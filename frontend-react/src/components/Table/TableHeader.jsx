import "./TableHeader.css";

export default function TableHeader({ columns }) {
  return (
    <thead>
      <tr>
        {columns.map(({ label, width, align }) => (
          <th key={label} style={{ width: width || undefined, textAlign: align || "center" }}>
            {label}
          </th>
        ))}
      </tr>
    </thead>
  );
}
