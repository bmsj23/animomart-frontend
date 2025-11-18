import ProductCard from '../common/ProductCard';

const ProductGrid = ({ products, loading, onClearFilters, hasActiveFilters }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-sm h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="flex items-center justify-center min-h-[240px] py-6">
          <img
            src="/assets/NoProducts.png"
            alt="No products"
            className="w-60 h-64 md:w-96 md:h-96 object-contain mx-auto mb-0 animate-slide-in"
          />
        </div>
        <h3 className="font-serif text-2xl md:text-3xl text-main mb-3">No products found</h3>
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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;