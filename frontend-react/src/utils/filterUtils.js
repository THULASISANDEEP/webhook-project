import { isWithinDateRange } from "./dateUtils";

/**
 * Returns true when the item matches the search query
 * (checks title and entityId, case-insensitive).
 */
export const matchesSearch = (item, query) => {
  const q = query.toLowerCase();
  return (
    item.title?.toLowerCase().includes(q) ||
    item.entityId?.toLowerCase().includes(q)
  );
};

/**
 * Apply all dashboard filters to a data array.
 * Any filter with an empty / zero-length value is skipped (show all).
 *
 * @param {Object[]} data
 * @param {Object}   filters
 * @param {string}   filters.search
 * @param {string[]} filters.selectedLocales
 * @param {string}   filters.selectedStage
 * @param {string[]} filters.selectedUsers
 * @param {string}   filters.startDate
 * @param {string}   filters.endDate
 * @returns {Object[]}
 */
export const applyDashboardFilters = (data, filters) => {
  const { search, selectedLocales, selectedStage, selectedUsers, startDate, endDate } = filters;
  let result = [...data];

  if (search.trim())
    result = result.filter((i) => matchesSearch(i, search));

  if (selectedLocales.length > 0)
    result = result.filter((i) =>
      selectedLocales.some((l) => i.localesChanged?.includes(l))
    );

  if (selectedStage)
    result = result.filter((i) => i.stage === selectedStage);

  if (startDate || endDate)
    result = result.filter((i) => isWithinDateRange(i.createdAt, startDate, endDate));

  if (selectedUsers.length > 0)
    result = result.filter((i) =>
      selectedUsers.some((u) =>
        (i.updatedByNames || []).some((x) => x.name === u)
      )
    );

  return result;
};

/**
 * Build locale options (value/label/count) from a raw data array.
 */
export const buildLocaleOptions = (data) => {
  const allLocales = [...new Set(data.flatMap((i) => i.localesChanged || []))];
  return allLocales.map((loc) => ({
    value: loc,
    label: loc.toUpperCase(),
    count: data.filter((i) => i.localesChanged?.includes(loc)).length,
  }));
};

/**
 * Build stage options (value/label/count) from a raw data array.
 * Includes an "All" entry with value "".
 */
export const buildStageOptions = (data) =>
  ["", "review", "approved", "reject"].map((s) => ({
    value: s,
    label: s === "" ? "All Stages" : s.charAt(0).toUpperCase() + s.slice(1),
    count: s === "" ? data.length : data.filter((i) => i.stage === s).length,
  }));

/**
 * Build user options (value/label/count) from a raw data array.
 */
export const buildUserOptions = (data) => {
  const allUsers = [
    ...new Set(data.flatMap((i) => (i.updatedByNames || []).map((u) => u.name))),
  ];
  return allUsers.map((u) => ({
    value: u,
    label: u,
    count: data.filter((i) =>
      (i.updatedByNames || []).some((x) => x.name === u)
    ).length,
  }));
};

/**
 * Toggle a value in a multi-select array.
 * Returns a new array (immutable).
 */
export const toggleMultiSelect = (prev, value) =>
  prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];
