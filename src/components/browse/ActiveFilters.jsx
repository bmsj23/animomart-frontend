import { X } from 'lucide-react';

const ActiveFilters = ({ filters, onRemoveFilter, categories, conditions }) => {
  return (
    <div className="flex items-center gap-2 flex-wrap mt-4">
      {filters.category && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
          {categories.find(c => c.value === filters.category)?.label || filters.category}
          <button
            onClick={() => onRemoveFilter('category')}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors hover:cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {filters.condition && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
          {conditions.find(c => c.value === filters.condition)?.label}
          <button
            onClick={() => onRemoveFilter('condition')}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors hover:cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {filters.minPrice && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
          Min: ₱{filters.minPrice}
          <button
            onClick={() => onRemoveFilter('minPrice')}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors hover:cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {filters.maxPrice && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
          Max: ₱{filters.maxPrice}
          <button
            onClick={() => onRemoveFilter('maxPrice')}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors hover:cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
    </div>
  );
};

export default ActiveFilters;