import { useState, useEffect } from "react";
import { applyDashboardFilters, toggleMultiSelect } from "../utils/filterUtils";

/**
 * Manage all filter state and derived filtered data.
 *
 * @param {Object[]} data  — raw (unfiltered) records
 * @returns {Object}
 */
export default function useFilters(data) {
  const [search,          setSearch]          = useState("");
  const [selectedLocales, setSelectedLocales] = useState([]);
  const [selectedStage,   setSelectedStage]   = useState("");
  const [selectedUsers,   setSelectedUsers]   = useState([]);
  const [startDate,       setStartDate]       = useState("");
  const [endDate,         setEndDate]         = useState("");
  const [filteredData,    setFilteredData]    = useState([]);

  /* Re-run whenever data or any filter changes */
  useEffect(() => {
    setFilteredData(
      applyDashboardFilters(data, {
        search, selectedLocales, selectedStage, selectedUsers, startDate, endDate,
      })
    );
  }, [data, search, selectedLocales, selectedStage, selectedUsers, startDate, endDate]);

  const resetFilters = () => {
    setSearch("");
    setSelectedLocales([]);
    setSelectedStage("");
    setSelectedUsers([]);
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters =
    search || selectedLocales.length > 0 || selectedStage ||
    selectedUsers.length > 0 || startDate || endDate;

  return {
    /* values */
    search, selectedLocales, selectedStage, selectedUsers, startDate, endDate,
    filteredData, hasActiveFilters,
    /* setters */
    setSearch, setSelectedStage, setStartDate, setEndDate,
    toggleLocale:  (v) => setSelectedLocales((p) => toggleMultiSelect(p, v)),
    clearLocales:  ()  => setSelectedLocales([]),
    toggleUser:    (v) => setSelectedUsers((p)   => toggleMultiSelect(p, v)),
    clearUsers:    ()  => setSelectedUsers([]),
    resetFilters,
  };
}
