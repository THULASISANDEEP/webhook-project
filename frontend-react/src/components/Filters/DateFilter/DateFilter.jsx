import { useRef } from "react";
import { formatDateInput } from "../../../utils/dateUtils";
import "./DateFilter.css";

export default function DateFilter({ startDate, endDate, onStartChange, onEndChange }) {
  const startRef = useRef(null);
  const endRef   = useRef(null);

  return (
    <>
      <div className="date-box" onClick={() => startRef.current?.showPicker()} title="From date">
        <span className="date-box__icon">📅</span>
        <span className="date-box__label">{formatDateInput(startDate, "Start date")}</span>
        <input ref={startRef} type="date" value={startDate} onChange={(e) => onStartChange(e.target.value)} />
      </div>

      <span style={{ color: "var(--color-text-muted)", fontSize: "13px" }}>→</span>

      <div className="date-box" onClick={() => endRef.current?.showPicker()} title="End date">
        <span className="date-box__icon">📅</span>
        <span className="date-box__label">{formatDateInput(endDate, "End date")}</span>
        <input ref={endRef} type="date" value={endDate} onChange={(e) => onEndChange(e.target.value)} />
      </div>
    </>
  );
}
