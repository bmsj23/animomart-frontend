import { useRef, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Books', label: 'Books' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'School Supplies', label: 'School Supplies' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Others', label: 'Others' },
];

const CONDITIONS = [
  { value: '', label: 'All Conditions' },
  { value: 'Brand New', label: 'Brand New' },
  { value: 'Like New', label: 'Like New' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'trending', label: 'Trending' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

const WishlistFilters = ({
  filters,
  onUpdateFilter,
  onClearFilters,
  showFilters,
  onToggleFilters,
}) => {
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        onToggleFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onToggleFilters]);

  const hasActiveFilters =
    filters.category ||
    filters.condition ||
    filters.minPrice ||
    filters.maxPrice;

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.condition) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  };

  return (
    <div className="mb-10 pb-6 border-b border-gray-200">
      <div className="flex items-center justify-between gap-4">
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => onToggleFilters(!showFilters)}
            className="flex items-center gap-2 text-main hover:text-primary transition-colors text-sm tracking-wide hover:cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="font-medium">
              Filter and Sort
              {hasActiveFilters && ` (${getActiveFilterCount()})`}
            </span>
          </button>

          {showFilters && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[320px] overflow-hidden animate-fade-in">
              <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <p className="text-xs font-medium text-gray uppercase tracking-wider mb-2 px-1">
                    Sort by
                  </p>
                  <div className="space-y-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          onUpdateFilter('sort', opt.value);
                          onToggleFilters(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm hover:cursor-pointer ${
                          filters.sort === opt.value
                            ? 'bg-primary text-white'
                            : 'text-main hover:bg-surface'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-gray-200" />

                <div>
                  <p className="text-xs font-medium text-gray uppercase tracking-wider mb-2 px-1">
                    Category
                  </p>
                  <select
                    value={filters.category}
                    onChange={(e) => onUpdateFilter('category', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm hover:cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray uppercase tracking-wider mb-2 px-1">
                    Condition
                  </p>
                  <select
                    value={filters.condition}
                    onChange={(e) => onUpdateFilter('condition', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm hover:cursor-pointer"
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond.value} value={cond.value}>
                        {cond.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray uppercase tracking-wider mb-2 px-1">
                    Price Range
                  </p>
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
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 text-gray hover:text-primary transition-colors text-sm font-medium hover:cursor-pointer"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap mt-4">
          {filters.category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {CATEGORIES.find((c) => c.value === filters.category)?.label || filters.category}
              <button
                onClick={() => onUpdateFilter('category', '')}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors hover:cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.condition && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {CONDITIONS.find((c) => c.value === filters.condition)?.label}
              <button
                onClick={() => onUpdateFilter('condition', '')}
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
                onClick={() => onUpdateFilter('minPrice', '')}
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
                onClick={() => onUpdateFilter('maxPrice', '')}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors hover:cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default WishlistFilters;