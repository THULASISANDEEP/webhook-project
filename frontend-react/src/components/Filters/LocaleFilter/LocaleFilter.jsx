import FilterDropdown from "../FilterDropdown/FilterDropdown";

export default function LocaleFilter({ options, selected, onToggle, onClear, show, onOpen, onClose }) {
  return (
    <FilterDropdown
      label="Locales" icon="🌐" isMulti heading="Filter by locale"
      options={options} selected={selected}
      onToggle={onToggle} onClear={onClear}
      show={show} onOpen={onOpen} onClose={onClose}
    />
  );
}
