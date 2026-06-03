import FilterDropdown from "../FilterDropdown/FilterDropdown";

export default function UserFilter({ options, selected, onToggle, onClear, show, onOpen, onClose }) {
  return (
    <FilterDropdown
      label="Users" icon="👤" isMulti heading="Filter by user"
      options={options} selected={selected}
      onToggle={onToggle} onClear={onClear}
      show={show} onOpen={onOpen} onClose={onClose}
      minWidth="220px"
    />
  );
}
