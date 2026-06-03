import FilterDropdown from "../FilterDropdown/FilterDropdown";

export default function StageFilter({ options, selected, onToggle, onClear, show, onOpen, onClose }) {
  return (
    <FilterDropdown
      label="All Stages" isMulti={false} heading="Filter by stage"
      options={options} selected={selected}
      onToggle={onToggle} onClear={onClear}
      show={show} onOpen={onOpen} onClose={onClose}
      minWidth="180px"
    />
  );
}
