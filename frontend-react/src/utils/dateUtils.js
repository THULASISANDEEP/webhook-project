/**
 * Format a date string to a short time string (HH:MM AM/PM).
 * @param {string} isoString
 * @returns {string}
 */
export const formatTime = (isoString) =>
  new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/**
 * Format a date string to a locale date string (e.g. "6/3/2026").
 * @param {string} isoString
 * @returns {string}
 */
export const formatDate = (isoString) =>
  new Date(isoString).toLocaleDateString();

/**
 * Format a YYYY-MM-DD value (from a date input) for display.
 * Uses T00:00:00 to avoid timezone-shift issues.
 * @param {string} dateValue  — e.g. "2026-06-03"
 * @param {string} fallback   — shown when dateValue is empty
 * @returns {string}
 */
export const formatDateInput = (dateValue, fallback = "Start date") =>
  dateValue ? new Date(`${dateValue}T00:00:00`).toLocaleDateString() : fallback;

/**
 * Returns true when a record's createdAt falls within [startDate, endDate].
 * Either bound may be empty — treated as unbounded.
 * @param {string} createdAt
 * @param {string} startDate  — YYYY-MM-DD or ""
 * @param {string} endDate    — YYYY-MM-DD or ""
 * @returns {boolean}
 */
export const isWithinDateRange = (createdAt, startDate, endDate) => {
  const date = new Date(createdAt);
  if (startDate && date < new Date(startDate)) return false;
  if (endDate   && date > new Date(`${endDate}T23:59:59`)) return false;
  return true;
};
