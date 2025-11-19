import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products';
import { ChevronLeft, ChevronRight, ArrowLeft, ShoppingBag, SlidersHorizontal, Star } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { getCategoryData } from '../constants/categories';
import { logger } from '../utils/logger';

const CategoryDetail = () => {
  const navigate = useNavigate();
  const { categoryName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterRef = useRef(null);

  // decode category name from url
  const decodedCategoryName = decodeURIComponent(categoryName);
  const categoryData = getCategoryData(decodedCategoryName);

  // redirect to categories if invalid category
  useEffect(() => {
    if (!categoryData) {
      navigate('/categories');
    }
  }, [categoryData, navigate]);

  const subcategories = categoryData ? [`All ${categoryData.name}`, ...categoryData.subcategories] : [];

  const [selectedSubcategory, setSelectedSubcategory] = useState(
    searchParams.get('subcategory') || `All ${decodedCategoryName}`
  );
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // newest, price-low, price-high, name
  const productsPerPage = 16;

  // fetch products based on selected subcategory and page
  useEffect(() => {
    if (!categoryData) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: productsPerPage,
        };

        // if "All [Category]" is selected, filter by all subcategories of this category
        if (selectedSubcategory === `All ${categoryData.name}`) {
          // backend should handle filtering by main category to get all subcategories
          params.category = categoryData.name;
        } else {
          // filter by specific subcategory
          params.category = selectedSubcategory;
        }
        const response = await getProducts(params);
        let fetchedProducts = response.data.products || [];

        // sort products based on sortBy state
        fetchedProducts = sortProducts(fetchedProducts, sortBy);

        setProducts(fetchedProducts);
        setTotalPages(response.data.totalPages || 1);
      } catch (error) {
        logger.error('failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryData, selectedSubcategory, currentPage, sortBy]);

  // update url params when subcategory changes
  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setCurrentPage(1);
    if (subcategory === `All ${categoryData.name}`) {
      searchParams.delete('subcategory');
    } else {
      searchParams.set('subcategory', subcategory);
    }
    setSearchParams(searchParams);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // sort products func
  const sortProducts = (productsArray, sortMethod) => {
    const sorted = [...productsArray];
    switch (sortMethod) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const handleSortChange = (sortMethod) => {
    setSortBy(sortMethod);
    setShowFilters(false);
  };

  // close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (!categoryData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* <- back header */}
        <div className="mb-12 text-center">
          <button
            onClick={() => navigate('/categories')}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors group text-sm tracking-wide uppercase hover:cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Categories</span>
          </button>

          {/* title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-main mb-4 tracking-tight">
            {categoryData.name}
          </h1>

          {/* subtitle */}
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            {categoryData.description}
          </p>

          {/* subtle divider line */}
          <div className="mt-8 mx-auto w-16 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* filter & sort bar */}
        {!loading && products.length > 0 && (
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-main hover:text-primary transition-colors text-sm tracking-wide hover:cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-medium">Filter and Sort</span>
              </button>

              {/* dropdown menu */}
              {showFilters && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[200px] overflow-hidden animate-fade-in">
                  <div className="p-2">
                    <p className="px-3 py-2 text-xs font-medium text-gray uppercase tracking-wider">Sort by</p>
                    <button
                      onClick={() => handleSortChange('newest')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm hover:cursor-pointer ${
                        sortBy === 'newest' ? 'bg-primary text-white' : 'text-main hover:bg-surface'
                      }`}
                    >
                      Newest First
                    </button>
                    <button
                      onClick={() => handleSortChange('price-low')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm hover:cursor-pointer ${
                        sortBy === 'price-low' ? 'bg-primary text-white' : 'text-main hover:bg-surface'
                      }`}
                    >
                      Price: Low to High
                    </button>
                    <button
                      onClick={() => handleSortChange('price-high')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm hover:cursor-pointer ${
                        sortBy === 'price-high' ? 'bg-primary text-white' : 'text-main hover:bg-surface'
                      }`}
                    >
                      Price: High to Low
                    </button>
                    <button
                      onClick={() => handleSortChange('name')}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm hover:cursor-pointer ${
                        sortBy === 'name' ? 'bg-primary text-white' : 'text-main hover:bg-surface'
                      }`}
                    >
                      Name: A to Z
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!loading && (
              <p className="text-gray text-sm">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>
            )}
          </div>
        </div>
        )}

        {/* horizontal scrollable category filter buttons */}
        <div className="mb-10 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 pb-2 min-w-max">
            {subcategories.map((subcategory) => {
              const isActive = selectedSubcategory === subcategory;
              return (
                <button
                  key={subcategory}
                  onClick={() => handleSubcategoryChange(subcategory)}
                  className={`group flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 ease-in-out hover:cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-main border border-gray-200 hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                  <span className="text-sm font-medium tracking-wide">{subcategory}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'translate-x-0.5' : ''}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* products */}
        <main className="min-w-0">

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray font-light text-sm tracking-wide">Loading collection...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="py-8 text-center">
              <div className="flex items-center justify-center">
                  <img
                    src="/assets/NoProducts.png"
                    alt="No products"
                    className="w-60 h-64 md:w-80 md:h-80 object-contain mx-auto mb-4 animate-slide-in"
                  />
              </div>

              <h3 className="text-3xl font-light text-main mb-3">
                No products found
              </h3>
              <p className="text-gray text-base leading-relaxed">Check back later or explore other collections</p>
            </div>
          ) : (
            <>
              {/* product cards*/}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* pagination */}
              {totalPages > 1 && (
                <div className="mt-16 pt-12 border-t border-gray-200">
                  <div className="flex justify-center items-center gap-3">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2.5 rounded-full border border-gray-300 hover:border-primary hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-300"
                    >
                      <ChevronLeft className="w-5 h-5 text-main" />
                    </button>

                    <div className="flex items-center gap-2">
                      {getPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-3 text-gray font-light">...</span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`min-w-10 h-10 rounded-full font-medium transition-all duration-300 text-sm ${
                              currentPage === page
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-white border border-gray-200 text-main hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2.5 rounded-full border border-gray-300 hover:border-primary hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-300"
                    >
                      <ChevronRight className="w-5 h-5 text-main" />
                    </button>
                  </div>

                  <p className="text-center mt-6 text-gray text-sm">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoryDetail;