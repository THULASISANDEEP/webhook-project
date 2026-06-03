import { MAX_SUGGESTIONS } from "../../constants/pagination";
import "./SearchSuggestions.css";

export default function SearchSuggestions({ show, query, suggestions, onSelect }) {
  if (!show || !query.trim() || suggestions.length === 0) return null;

  return (
    <div className="suggestions-box">
      {suggestions.slice(0, MAX_SUGGESTIONS).map((item) => (
        <div
          key={item._id}
          className="suggestions-box__item"
          onMouseDown={() => onSelect(item)}
        >
          <div className="suggestions-box__title">{item.title}</div>
          <div className="suggestions-box__id">{item.entityId}</div>
        </div>
      ))}
    </div>
  );
}
