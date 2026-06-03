import { useState } from "react";
import Navbar          from "../components/Navbar/Navbar";
import PageHeader      from "../components/PageHeader/PageHeader";
import SearchBox       from "../components/SearchBox/SearchBox";
import SearchSuggestions from "../components/SearchSuggestions/SearchSuggestions";
import LocaleFilter    from "../components/Filters/LocaleFilter/LocaleFilter";
import StageFilter     from "../components/Filters/StageFilter/StageFilter";
import UserFilter      from "../components/Filters/UserFilter/UserFilter";
import DateFilter      from "../components/Filters/DateFilter/DateFilter";
import ResetFilter     from "../components/Filters/ResetFilter/ResetFilter";
import DataTable       from "../components/Table/DataTable";
import Pagination      from "../components/Pagination/Pagination";
import useFetchRecords from "../hooks/useFetchRecords";
import useFilters      from "../hooks/useFilters";
import usePagination   from "../hooks/usePagination";
import { buildLocaleOptions, buildStageOptions, buildUserOptions } from "../utils/filterUtils";
import { matchesSearch } from "../utils/filterUtils";
import TableSummary from "../components/TableSummary/TableSummary";


/* Column definitions for the admin table */
const COLUMNS = [
  { label: "Entity",   width: "22%", align: "left" },
  { label: "Time" },
  { label: "Locales" },
  { label: "Stage" },
  { label: "Previous" },
  { label: "User" },
  { label: "CMS" },
  { label: "More" },
];

export default function MainDashboard() {
  const { data } = useFetchRecords();

  const filters    = useFilters(data);
  const pagination = usePagination(filters.filteredData);

  /* Dropdown open/close state — only one open at a time */
  const [showLocales, setShowLocales] = useState(false);
  const [showStage,   setShowStage]   = useState(false);
  const [showUsers,   setShowUsers]   = useState(false);

  const openLocales = () => { setShowLocales(true);  setShowStage(false); setShowUsers(false); };
  const openStage   = () => { setShowStage(true);    setShowLocales(false); setShowUsers(false); };
  const openUsers   = () => { setShowUsers(true);    setShowLocales(false); setShowStage(false); };

  /* Search suggestions — all data filtered by current search string */
  const [showSearchDrop, setShowSearchDrop] = useState(false);
  const searchSuggestions = data.filter((i) => filters.search.trim() && matchesSearch(i, filters.search));

  /* Expanded row */
  const [expandedId, setExpandedId] = useState(null);
  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const environment = data[0]?.environment || null;

  /* Derived filter options */
  const localeOptions = buildLocaleOptions(data);
  const stageOptions  = buildStageOptions(data);
  const userOptions   = buildUserOptions(data);

  /* Reset also collapses expanded row */
  const handleReset = () => { filters.resetFilters(); setExpandedId(null); };

  return (
    <div className="page-outer">
      <Navbar
        onHomeClick={handleReset}
        recordCount={filters.filteredData.length}
        environment={environment}
      />

      <PageHeader title="Webhook Dashboard">
        Monitor CMS content changes in real time
      </PageHeader>

      {/* ── Filters toolbar ── */}
      <div className="toolbar">
        {/* Search + suggestions */}
        <div style={{ position: "relative" }}>
          <SearchBox
            value={filters.search}
            onChange={(v) => { filters.setSearch(v); setShowSearchDrop(true); }}
            onFocus={() => setShowSearchDrop(true)}
            onBlur={() => setTimeout(() => setShowSearchDrop(false), 150)}
            onClear={() => filters.setSearch("")}
          />
          <SearchSuggestions
            show={showSearchDrop}
            query={filters.search}
            suggestions={searchSuggestions}
            onSelect={(item) => {
              filters.setSearch(item.title);
              setShowSearchDrop(false);
            }}
          />
        </div>

        <LocaleFilter
          options={localeOptions} selected={filters.selectedLocales}
          onToggle={filters.toggleLocale} onClear={filters.clearLocales}
          show={showLocales} onOpen={openLocales} onClose={() => setShowLocales(false)}
        />

        <StageFilter
          options={stageOptions} selected={filters.selectedStage}
          onToggle={filters.setSelectedStage} onClear={() => filters.setSelectedStage("")}
          show={showStage} onOpen={openStage} onClose={() => setShowStage(false)}
        />

        <UserFilter
          options={userOptions} selected={filters.selectedUsers}
          onToggle={filters.toggleUser} onClear={filters.clearUsers}
          show={showUsers} onOpen={openUsers} onClose={() => setShowUsers(false)}
        />

        <DateFilter
          startDate={filters.startDate} endDate={filters.endDate}
          onStartChange={filters.setStartDate} onEndChange={filters.setEndDate}
        />

        <ResetFilter hasActiveFilters={filters.hasActiveFilters} onReset={handleReset} />
      </div>

      {/* ── Table area ── */}
      <div className="page-inner">
        <div className="card-inner">

  <TableSummary
    totalCount={filters.filteredData.length}
    indexOfLast={pagination.indexOfLast}
    rowsPerPage={pagination.rowsPerPage}
    onRowsChange={pagination.changeRowsPerPage}
  />

  <DataTable
    columns={COLUMNS}
    rows={pagination.currentRows}
    expandedId={expandedId}
    onToggleExpand={toggleExpand}
    showPrevStage
  />

  <Pagination
    currentPage={pagination.currentPage}
    totalPages={pagination.totalPages}
    onPageChange={pagination.setCurrentPage}
    getPageNumbers={pagination.getPageNumbers}
  />

</div>
      </div>
    </div>
  );
}
