import { SlidersHorizontal } from 'lucide-react';

const FilterButton = ({ onToggle, activeFilterCount }) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 text-main hover:text-primary transition-colors text-sm tracking-wide hover:cursor-pointer"
    >
      <SlidersHorizontal className="w-4 h-4" />
      <span className="font-medium">
        Filter and Sort
        {activeFilterCount > 0 && ` (${activeFilterCount})`}
      </span>
    </button>
  );
};

export default FilterButton;