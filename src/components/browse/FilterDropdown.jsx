import { X } from 'lucide-react';

const FilterDropdown = ({
  filters,
  onUpdateFilter,
  onClearFilters,
  onClose,
  hasActiveFilters,
  sortOptions,
  categories,
  conditions
}) => {
  return (
    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[320px] overflow-hidden animate-fade-in">
      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">

        {/* sort section */}
        <div>
          <p className="text-xs font-medium text-gray uppercase tracking-wider mb-2 px-1">Sort by</p>
          <div className="space-y-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onUpdateFilter('sort', opt.value);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm hover:cursor-pointer ${
                  filters.sort === opt.value ? 'bg-primary text-white' : 'text-main hover:bg-surface'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* category filter */}
        <div>
          <p className="text-xs font-medium text-gray uppercase tracking-wider mb-2 px-1">Category</p>
          <select
            value={filters.category}
            onChange={(e) => onUpdateFilter('category', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm hover:cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* condition filter */}
        <div>
          <p className="text-xs font-medium text-gray uppercase tracking-wider mb-2 px-1">Condition</p>
          <select
            value={filters.condition}
            onChange={(e) => onUpdateFilter('condition', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm hover:cursor-pointer"
          >
            {conditions.map(cond => (
              <option key={cond.value} value={cond.value}>{cond.label}</option>
            ))}
          </select>
        </div>

        {/* price range */}
        <div>
          <p className="text-xs font-medium text-gray uppercase tracking-wider mb-2 px-1">Price Range</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => onUpdateFilter('minPrice', e.target.value)}
              placeholder="Min ₱"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm"
            />
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onUpdateFilter('maxPrice', e.target.value)}
              placeholder="Max ₱"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm"
            />
          </div>
        </div>

        {/* clear filters button */}
        {hasActiveFilters && (
          <>
            <div className="h-px bg-gray-200" />
            <button
              onClick={onClearFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-primary hover:bg-surface rounded-lg transition-colors font-medium text-sm hover:cursor-pointer"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FilterDropdown;