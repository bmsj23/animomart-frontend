import ProductCard from '../common/ProductCard';

const WishlistGrid = ({
  products,
  loading,
  pagination,
  currentPage,
  onPageChange,
  hasActiveFilters,
  onClearFilters,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-sm h-80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="font-serif text-2xl md:text-3xl text-main mb-3">
          No products found
        </h3>
        <p className="text-gray text-base md:text-lg mb-6 font-light">
          Try adjusting your filters or check back later
        </p>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-primary hover:text-primary/80 font-medium transition-colors hover:cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button
            onClick={() => onPageChange(currentPage - 1)}
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
                    onClick={() => onPageChange(page)}
                    className={`min-w-11 px-4 py-2.5 rounded-full transition-all font-medium text-sm hover:cursor-pointer hover:bg-primary hover:text-white ${
                      currentPage === page
                        ? 'bg-primary text-white shadow-md'
                        : 'border border-gray-200 hover:bg-surface text-main'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === currentPage - 2 ||
                page === currentPage + 2
              ) {
                return (
                  <span key={page} className="px-2 text-gray">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="px-5 py-2.5 border border-gray-200 rounded-full hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm hover:cursor-pointer hover:bg-primary hover:text-white"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default WishlistGrid;