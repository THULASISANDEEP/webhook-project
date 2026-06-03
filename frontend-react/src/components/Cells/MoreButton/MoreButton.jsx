import "./MoreButton.css";

export default function MoreButton({ isExpanded, onClick }) {
  return (
    <button
      className={`more-btn ${isExpanded ? "more-btn--active" : ""}`}
      onClick={onClick}
    >
      {isExpanded ? "▲" : "▼"}
    </button>
  );
}
