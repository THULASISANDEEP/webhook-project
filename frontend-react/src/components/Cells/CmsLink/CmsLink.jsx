import "./CmsLink.css";

export default function CmsLink({ href }) {
  if (!href) return <span style={{ color: "var(--color-border)" }}>—</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="cms-link">
      Open ↗
    </a>
  );
}
