import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/products';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { logger } from '../utils/logger';

const Trending = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 16;

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({ limit: 1000 });

        // sort by views descending and take top products
        const allTrendingProducts = (response.data.products || [])
          .sort((a, b) => (b.views || 0) - (a.views || 0));

        // calculate pagination
        const totalProducts = allTrendingProducts.length;
        const calculatedTotalPages = Math.ceil(totalProducts / productsPerPage);
        setTotalPages(calculatedTotalPages);

        // slice for current page
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const paginatedProducts = allTrendingProducts.slice(startIndex, endIndex);

        setProducts(paginatedProducts);
        logger.info('Trending products fetched', { count: paginatedProducts.length, total: totalProducts });
      } catch (error) {
        logger.error('Error fetching trending products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* header */}
        <div className="mb-12 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors group text-sm tracking-wide uppercase hover:cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </button>

          {/* title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-main mb-4 tracking-tight">
            Trending Products
          </h1>

          {/* subtitle */}
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Most viewed products on Campus
          </p>

          {/* subtle divider line */}
          <div className="mt-8 mx-auto w-16 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
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
                No trending products yet
              </h3>
              <p className="text-gray text-base leading-relaxed">Check back later for popular items</p>
            </div>
          ) : (
            <>
              {/* product cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
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
                      className="p-2.5 rounded-full border border-gray-300 hover:border-primary hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-300 hover:cursor-pointer"
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
                            className={`min-w-10 h-10 rounded-full font-medium transition-all duration-300 text-sm hover:cursor-pointer ${
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
                      className="p-2.5 rounded-full border border-gray-300 hover:border-primary hover:bg-primary/5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all duration-300 hover:cursor-pointer"
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

export default Trending;