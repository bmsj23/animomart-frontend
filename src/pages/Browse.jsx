import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { getProducts } from '../api/products';
import BrowseHeader from '../components/browse/BrowseHeader';
import FilterButton from '../components/browse/FilterButton';
import FilterDropdown from '../components/browse/FilterDropdown';
import ActiveFilters from '../components/browse/ActiveFilters';
import ProductGrid from '../components/browse/ProductGrid';
import Pagination from '../components/browse/Pagination';
import { logger } from '../utils/logger';

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
  { value: 'trending', label: 'Trending' },
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
      logger.error('Failed to fetch products:', err);
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
      case 'trending':
        // sort by engagement score (rating * 0.4 + reviews * 0.6)
        return sorted.sort((a, b) => {
          const scoreA = (a.averageRating || 0) * 0.4 + (a.totalReviews || 0) * 0.6;
          const scoreB = (b.averageRating || 0) * 0.4 + (b.totalReviews || 0) * 0.6;
          return scoreB - scoreA;
        });
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

        <BrowseHeader
          productsCount={products.length}
          totalProducts={pagination.totalProducts}
        />

        <div className="mb-10 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="relative" ref={filterRef}>
              <FilterButton
                onToggle={() => setShowFilters(!showFilters)}
                activeFilterCount={getActiveFilterCount()}
              />

              {showFilters && (
                <FilterDropdown
                  filters={filters}
                  onUpdateFilter={updateFilter}
                  onClearFilters={clearFilters}
                  onClose={() => setShowFilters(false)}
                  hasActiveFilters={hasActiveFilters}
                  sortOptions={SORT_OPTIONS}
                  categories={CATEGORIES}
                  conditions={CONDITIONS}
                />
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

          {hasActiveFilters && (
            <ActiveFilters
              filters={filters}
              onRemoveFilter={(key) => updateFilter(key, '')}
              categories={CATEGORIES}
              conditions={CONDITIONS}
            />
          )}
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Browse;