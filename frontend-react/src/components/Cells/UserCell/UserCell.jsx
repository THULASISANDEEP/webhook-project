import "./UserCell.css";

export default function UserCell({ names }) {
  if (!names || names.length === 0)
    return <span style={{ color: "var(--color-text-muted)" }}>—</span>;

  const hasMore = names.length > 1;

  return (
    <div className="user-cell">
      <span className="user-cell__text">{names[0]}</span>
      {hasMore && (
        <span className="user-cell__more-dot" title={`+${names.length - 1} more`}>⋯</span>
      )}
      {hasMore && (
        <div className="user-cell__tooltip">
          {names.map((name, i) => (
            <div key={i} className="user-cell__tooltip-name">{name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
