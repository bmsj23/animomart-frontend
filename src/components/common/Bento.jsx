import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Star, ArrowRight, Sparkles, TrendingUp, Package, Grid3x3 } from 'lucide-react';
import { getProducts } from '../../api/products';

// ProductCard component
const ProductCard = ({ product, size = 'default' }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    console.log('Added to cart:', product);
    // todo: cart logic here
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    console.log('Wishlist toggled:', product);
  };

  const handleCardClick = () => {
    console.log('Navigate to product:', product._id);
    // todo: navigation logic here: navigate(`/product/${product._id}`)
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 h-full flex flex-col ${
        isHovered ? 'shadow-2xl -translate-y-1' : 'shadow-md'
      }`}
    >
      {/* Product Image */}
      <div className={`relative overflow-hidden bg-gray-100 flex-shrink-0 ${size === 'large' ? 'h-96' : size === 'medium' ? 'h-64' : 'h-32'}`}>
        <img
          src={product.image || '/api/placeholder/400/320'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
            isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50'
          } shadow-lg`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Category Badge */}
        {product.category && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {product.category}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 rounded-lg">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-gray-700">
              {product.rating || '4.5'}
            </span>
          </div>
        </div>

        {/* Price and Cart */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-green-500">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-green-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="p-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg flex-shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// CategoryCard component
const CategoryCard = ({ title, subtitle, icon: Icon, color, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative bg-gradient-to-br ${color} rounded-2xl p-4 cursor-pointer overflow-hidden transition-all duration-300 h-full ${
        isHovered ? 'shadow-2xl -translate-y-1' : 'shadow-md'
      } flex flex-col justify-between min-h-[120px]`}
    >
      <div className="relative z-10">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        <h3 className="text-base font-bold text-white mb-1">{title}</h3>
        <p className="text-white/80 text-xs">{subtitle}</p>
      </div>

      <div className={`mt-3 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
        <ArrowRight className="w-5 h-5 text-white" />
      </div>

      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
    </div>
  );
};

// Loading Skeleton
const SkeletonCard = ({ size = 'default' }) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md h-full flex flex-col">
    <div className={`bg-gray-200 animate-pulse flex-shrink-0 ${size === 'large' ? 'h-64' : size === 'medium' ? 'h-48' : 'h-32'}`} />
    <div className="p-3 space-y-2 flex-grow">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
      <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3 mt-auto" />
    </div>
  </div>
);

const SkeletonCategory = () => (
  <div className="bg-gray-200 rounded-2xl p-4 h-full animate-pulse min-h-[120px]">
    <div className="w-10 h-10 bg-gray-300 rounded-xl mb-3" />
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-300 rounded w-1/2" />
  </div>
);

// Main BentoBox component
const BentoBox = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts({ limit: 6 });

      if (data.success) {
        // backend products mapping for component structure matching
        const mappedProducts = data.data.products.map(product => ({
          _id: product._id,
          name: product.name,
          price: product.price,
          rating: product.averageRating || 4.5,
          reviewCount: product.totalReviews || 0,
          category: product.category,
          image: product.images && product.images.length > 0
            ? product.images[0]
            : '/api/placeholder/400/320'
        }));
        setProducts(mappedProducts);
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const categories = [
    {
      title: 'New Arrivals',
      subtitle: 'Fresh items from sellers',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      onClick: () => console.log('Navigate to new arrivals')
    },
    {
      title: 'Trending Now',
      subtitle: 'Popular in campus',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      onClick: () => console.log('Navigate to trending')
    },
    {
      title: 'Electronics',
      subtitle: 'Tech & gadgets',
      icon: Package,
      color: 'from-orange-500 to-red-500',
      onClick: () => console.log('Navigate to electronics')
    },
    {
      title: 'All Categories',
      subtitle: 'Browse everything',
      icon: Grid3x3,
      color: 'from-green-500 to-teal-500',
      onClick: () => console.log('Navigate to all categories')
    }
  ];

  if (error) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-red-500">Error loading products: {error}</p>
        <button
          onClick={fetchProducts}
          className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Discover Campus Marketplace
        </h2>
        <p className="text-gray-600">Find everything you need from fellow students</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" style={{ gridAutoRows: '240px' }}>

        {/* LEFT COLUMN: Large Box - spans 3 rows */}
        <div className="md:col-span-2 lg:col-span-1 lg:row-span-3">
          {loading ? (
            <SkeletonCard size="large" />
          ) : (
            products[0] && <ProductCard product={products[0]} size="large" />
          )}
        </div>

        {/* MIDDLE SECTION TOP: 2x2 Grid (4 small category boxes) - spans 2 rows */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 grid grid-cols-2 gap-4">
          {loading ? (
            <>
              <SkeletonCategory />
              <SkeletonCategory />
              <SkeletonCategory />
              <SkeletonCategory />
            </>
          ) : (
            categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))
          )}
        </div>

        {/* RIGHT COLUMN TOP: Product Card - 2 rows */}
        <div className="lg:col-span-1 lg:row-span-2">
          {loading ? (
            <SkeletonCard />
          ) : (
            products[1] && <ProductCard product={products[1]} size="medium" />
          )}
        </div>

        {/* MIDDLE SECTION BOTTOM: Wide Rectangle - spans 2 columns, 1 row */}
        <div className="md:col-span-2 lg:col-span-2 lg:row-span-1">
          {loading ? (
            <SkeletonCard />
          ) : (
            products[2] && <ProductCard product={products[2]} />
          )}
        </div>

        {/* RIGHT COLUMN BOTTOM: Product Card - 1 row */}
        <div className="lg:col-span-1 lg:row-span-1">
          {loading ? (
            <SkeletonCard />
          ) : (
            products[3] && <ProductCard product={products[3]} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BentoBox;