import React, { useState, useEffect } from 'react';
import { Heart, ArrowRight, Sparkles, TrendingUp, Package, Grid3x3 } from 'lucide-react';
import { getProducts } from '../../api/products';
import { formatCurrency } from '../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

// ProductCard component
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const { error: showError } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isFavorited = favorites?.some(fav => {
    // favorites structure
    const favProductId = fav._id || fav.product?._id || fav.product;
    return favProductId === product._id;
  });
  // check if product belongs to current user
  const isOwnProduct = product.seller && user?._id &&
    (user._id === product.seller._id || user._id === product.seller);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      if (isFavorited) {
        await removeFromFavorites(product._id);
      } else {
        await addToFavorites(product._id);

        // show "Added!" feedback
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update favorites';
      showError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 h-full ${
        isHovered ? 'shadow-lg border-gray-200' : 'shadow-sm'
      }`}
    >
      {/* Product Image */}
      <div className="relative h-full w-full">
        <img
          src={product.image || '/api/placeholder/400/320'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
        />

        {/* favorite button (always visible on mobile, hover on desktop, hidden for own prods)  */}
        {!isOwnProduct && (
          <button
            onClick={handleFavorite}
            disabled={isProcessing}
            className={`absolute top-3 right-3 px-3 py-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 md:opacity-0 md:group-hover:opacity-100 flex items-center gap-1.5 ${
              isFavorited
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 transition-transform ${isFavorited ? 'fill-current scale-110' : ''} ${justAdded ? 'animate-bounce' : ''}`} />
            )}
            {justAdded && (
              <span className="text-xs font-medium whitespace-nowrap animate-fade-in">Added!</span>
            )}
          </button>
        )}

        {/* stock badge */}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-green-600/90 backdrop-blur-md rounded-lg text-xs font-medium text-white z-10">
            Out of stock
          </div>
        )}

        {/* Own Product Badge */}
        {isOwnProduct && (
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-green-600/90 backdrop-blur-md rounded-lg text-xs font-medium text-white z-10">
            Your Listing
          </div>
        )}

        {/* hover overlay (slides up from bottom of bento card) */}
        <div
          className={`hidden md:block absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent transition-all duration-500 ${
            isHovered ? 'h-2/5' : 'h-0'
          }`}
        >
          {/* product info (appears on hover) */}
          <div
            className={`absolute bottom-0 inset-x-0 p-4 sm:p-5 text-white transition-all duration-500 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h3 className="font-semibold text-sm sm:text-base mb-1.5 line-clamp-2">
              {product.name}
            </h3>

            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="text-lg sm:text-xl font-bold">
                  {formatCurrency(product.price)}
                </span>
                {product.stock > 0 && (
                  <p className="text-xs text-white/80 mt-0.5">
                    {product.stock} in stock
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-white/80 text-sm">
                <span>View Details</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: always-visible bottom info bar */}
        <div className="md:hidden absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <h3 className="font-semibold text-white text-xs line-clamp-1 mb-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">
              {formatCurrency(product.price)}
            </span>
            <div className="flex items-center gap-1 text-white text-xs">
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CategoryCard component
const CategoryCard = ({ title, subtitle, icon: Icon, bgColor = 'bg-gray-50', textColor = 'text-gray-900', onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative ${bgColor} border border-gray-100 rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-300 h-full ${
        isHovered ? 'shadow-lg border-gray-200' : 'shadow-sm'
      } flex flex-col justify-between min-h-[100px] sm:min-h-[120px]`}
    >
      <div className="flex flex-col flex-grow">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 border border-gray-200 rounded-lg flex items-center justify-center mb-2 sm:mb-3 ${textColor}`}>
          {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
        <h3 className={`text-sm sm:text-base font-semibold ${textColor} mb-0.5 sm:mb-1`}>{title}</h3>
        <p className="text-gray-600 text-xs sm:text-sm">{subtitle}</p>
      </div>

      <div className={`mt-2 sm:mt-3 flex items-center justify-end transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
        <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 ${textColor}`} />
      </div>
    </div>
  );
};

// Loading Skeleton
const SkeletonCard = () => (
  <div className="bg-gray-100 border border-gray-100 rounded-xl overflow-hidden shadow-sm h-full animate-pulse" />
);

const SkeletonCategory = () => (
  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 sm:p-5 h-full animate-pulse min-h-[100px] sm:min-h-[120px]">
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg mb-2 sm:mb-3" />
    <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-1.5 sm:mb-2" />
    <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2" />
  </div>
);

// Main BentoBox component
const BentoBox = () => {
  const navigate = useNavigate();
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
          stock: product.stock,
          seller: product.seller,
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
      subtitle: 'Fresh from sellers',
      icon: Sparkles,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      onClick: () => {
        // todo: create /new-arrivals page and scroll to new arrivals section in home
      }
    },
    {
      title: 'Trending',
      subtitle: 'Popular on campus',
      icon: TrendingUp,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-900',
      onClick: () => {
        // todo: create /trending page, scroll down to trending section in home, and trending algorithm
        console.log('Trending - Coming soon!');
      }
    },
    {
      title: 'Electronics',
      subtitle: 'Tech & gadgets',
      icon: Package,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-900',
      onClick: () => navigate('/categories')
    },
    {
      title: 'All Items',
      subtitle: 'Browse all',
      icon: Grid3x3,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-900',
      onClick: () => navigate('/browse')
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
    <div className="w-full max-w-7xl mx-auto">

      {/* Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 sm:gap-4 auto-rows-[180px] sm:auto-rows-[200px] md:auto-rows-[240px] mb-8">

        {/* LEFT: Large Featured Product - 2 cols, 3 rows */}
        <div className="col-span-2 row-span-3">
          {loading ? (
            <SkeletonCard />
          ) : (
            products[0] && <ProductCard product={products[0]} />
          )}
        </div>

        {/* MIDDLE: Category Grid - 2x2 grid, 2 cols, 2 rows */}
        <div className="col-span-2 row-span-2 grid grid-cols-2 gap-3 sm:gap-4">
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

        {/* RIGHT: Medium Product - 2 cols, 2 rows */}
        <div className="hidden md:block col-span-2 row-span-2">
          {loading ? (
            <SkeletonCard />
          ) : (
            products[1] && <ProductCard product={products[1]} />
          )}
        </div>

        {/* BOTTOM MIDDLE: Wide Product - 2 cols, 1 row */}
        <div className="col-span-2 row-span-1">
          {loading ? (
            <SkeletonCard />
          ) : (
            products[2] && <ProductCard product={products[2]} />
          )}
        </div>

        {/* BOTTOM RIGHT: Small Product - 2 cols, 1 row */}
        <div className="hidden md:block col-span-2 row-span-1">
          {loading ? (
            <SkeletonCard />
          ) : (
            products[3] && <ProductCard product={products[3]} />
          )}
        </div>

        {/* mobile only: additional products in 2-column grid */}
        <div className="md:hidden col-span-1 row-span-1">
          {loading ? (
            <SkeletonCard />
          ) : (
            products[1] && <ProductCard product={products[1]} />
          )}
        </div>

        <div className="md:hidden col-span-1 row-span-1">
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