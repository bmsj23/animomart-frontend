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
  const [currentPage, setCurrentPage] = useState(1);
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
    fetchProducts(1);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 16,
        ...(filters.category && { category: filters.category }),
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        sort: filters.sort
      };
      const response = await getProducts(params);
      setProducts(response.data.products || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
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
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = filters.category || filters.condition || filters.minPrice || filters.maxPrice;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Header */}
        <div className="mb-10 md:mb-12">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-main mb-3 tracking-tight">Browse All Products</h1>
          <p className="text-secondary text-base md:text-lg font-light">
            Showing {products.length} of {pagination.totalProducts || 0} products
          </p>
        </div>

        <div className="bg-surface border border-gray-100 rounded-sm shadow-sm p-4 md:p-6 mb-10">
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-between px-4 py-3 bg-surface text-primary rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters {hasActiveFilters && `(${[filters.category, filters.condition, filters.minPrice, filters.maxPrice].filter(Boolean).length})`}
              </span>
              <X className={`w-5 h-5 transition-transform ${showMobileFilters ? 'rotate-90' : ''}`} />
            </button>
          </div>

          <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-main mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface hover:cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-main mb-2">Condition</label>
                <select
                  value={filters.condition}
                  onChange={(e) => updateFilter('condition', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface hover:cursor-pointer"
                >
                  {CONDITIONS.map(cond => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-main mb-2">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  placeholder="₱0"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface hover:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main mb-2">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  placeholder="₱10,000"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface hover:cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-main mb-2">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-surface hover:cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            )}
          </div>
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
                  className="px-5 py-2.5 border border-gray-200 rounded-full hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
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
                          className={`min-w-[44px] px-4 py-2.5 rounded-full transition-all font-medium text-sm ${
                            currentPage === page
                              ? 'bg-primary text-white shadow-md'
                              : 'border border-gray-200 hover:bg-surface text-main'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-secondary">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-5 py-2.5 border border-gray-200 rounded-full hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <h3 className="font-serif text-2xl md:text-3xl text-main mb-3">No products found</h3>
            <p className="text-secondary text-base md:text-lg mb-6 font-light">Try adjusting your filters or check back later</p>
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