import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { getProducts } from '../api/products';
import ProductCard from '../components/common/ProductCard';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Books', label: 'Books' },
  { value: 'Clothing', label: 'Clothing' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'School Supplies', label: 'School Supplies' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Others', label: 'Others' }
];

const CONDITIONS = [
  { value: '', label: 'All Conditions' },
  { value: 'Brand New', label: 'Brand New' },
  { value: 'Like New', label: 'Like New' },
  { value: 'Good', label: 'Good' },
  { value: 'Fair', label: 'Fair' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' }
];

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest'
  });

  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;
    fetchProducts(pageFromUrl);
    setCurrentPage(pageFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchProducts = async (page = 1) => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setLoading(true);
      const params = {
        page,
        limit: 16,
        ...(filters.category && { category: filters.category }),
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.minPrice && { minPrice: Number(filters.minPrice) }),
        ...(filters.maxPrice && { maxPrice: Number(filters.maxPrice) })
      };
      const response = await getProducts(params);

      // client-side sorting
      let fetchedProducts = response.data.products || [];
      fetchedProducts = sortProducts(fetchedProducts, filters.sort);

      setProducts(fetchedProducts);
      setPagination(response.data.pagination || {});
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  // client-side sort function
  const sortProducts = (productsArray, sortMethod) => {
    const sorted = [...productsArray];
    switch (sortMethod) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const updateFilter = (key, value) => {

    let processedValue = value;
    if ((key === 'minPrice' || key === 'maxPrice') && value) {
      processedValue = parseFloat(value) || '';
    }

    const newFilters = { ...filters, [key]: processedValue };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest'
    });
    setSearchParams({});
    setShowFilters(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page);

    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasActiveFilters = filters.category || filters.condition || filters.minPrice || filters.maxPrice;

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.condition) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Header */}
        <div className="mb-10 md:mb-12">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-main mb-3 tracking-tight">Browse All Products</h1>
          <p className="text-gray text-base md:text-lg font-light">
            Showing {products.length} of {pagination.totalProducts || 0} products
          </p>
        </div>

        <div className="mb-10 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilters(!showFilters)}
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

                    {/* sort section */}
                    <div>
                      <p className="text-xs font-medium text-gray uppercase tracking-wider mb-2 px-1">Sort by</p>
                      <div className="space-y-1">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => {
                              updateFilter('sort', opt.value);
                              setShowFilters(false);
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
                        onChange={(e) => updateFilter('category', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm hover:cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* condition filter */}
                    <div>
                      <p className="text-xs font-medium text-gray uppercase tracking-wider mb-2 px-1">Condition</p>
                      <select
                        value={filters.condition}
                        onChange={(e) => updateFilter('condition', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm hover:cursor-pointer"
                      >
                        {CONDITIONS.map(cond => (
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
                          onChange={(e) => updateFilter('minPrice', e.target.value)}
                          placeholder="Min ₱"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white text-sm"
                        />
                        <input
                          type="number"
                          value={filters.maxPrice}
                          onChange={(e) => updateFilter('maxPrice', e.target.value)}
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
                          onClick={clearFilters}
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
                onClick={clearFilters}
                className="flex items-center gap-2 text-gray hover:text-primary transition-colors text-sm font-medium hover:cursor-pointer"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* active filter indicators */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap mt-4">
              {filters.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {CATEGORIES.find(c => c.value === filters.category)?.label || filters.category}
                  <button
                    onClick={() => updateFilter('category', '')}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors hover:cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.condition && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  {CONDITIONS.find(c => c.value === filters.condition)?.label}
                  <button
                    onClick={() => updateFilter('condition', '')}
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
                    onClick={() => updateFilter('minPrice', '')}
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
                    onClick={() => updateFilter('maxPrice', '')}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors hover:cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-sm h-80 animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 border border-gray-200 rounded-full hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm hover:cursor-pointer hover:bg-primary hover:text-white"
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {[...Array(pagination.totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[44px] px-4 py-2.5 rounded-full transition-all font-medium text-sm hover:cursor-pointer hover:bg-primary hover:text-white ${
                            currentPage === page
                              ? 'bg-primary text-white shadow-md'
                              : 'border border-gray-200 hover:bg-surface text-main'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-gray">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-5 py-2.5 border border-gray-200 rounded-full hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm hover:cursor-pointer hover:bg-primary hover:text-white"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <h3 className="font-serif text-2xl md:text-3xl text-main mb-3">No products found</h3>
            <p className="text-gray text-base md:text-lg mb-6 font-light">Try adjusting your filters or check back later</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;