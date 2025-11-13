import ProductCard from '../common/ProductCard';
import SectionHeader from './SectionHeader';

const ProductsSection = ({ title, viewAllLink, products, loading, onGreenBg = false }) => {
  return (
    <section className="mb-16">
      <SectionHeader
        title={title}
        viewAllLink={viewAllLink}
        loading={loading}
        onGreenBg={onGreenBg}
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-sm h-80 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.slice(0, 8).map(product => (
            <ProductCard key={product._id} product={product} onGreenBg={onGreenBg} />
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductsSection;