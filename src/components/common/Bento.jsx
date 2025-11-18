import React, { useState, useEffect } from 'react';
import { Heart, ArrowRight, Sparkles, TrendingUp, Zap, Grid3x3 } from 'lucide-react';
import { getProducts } from '../../api/products';
import { formatCurrency } from '../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../hooks/useWishlist';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { logger } from '../../utils/logger';

// ProductCard component
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { error: showError } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!product || !product._id || !product.name || product.price === undefined) {
    return null;
  }

  const isInWishlist = wishlist?.some(item => {
    // wishlist structure
    const itemProductId = item._id || item.product?._id || item.product;
    return itemProductId === product._id;
  });
  // check if product belongs to current user
  const isOwnProduct = product.seller && user?._id &&
    (user._id === product.seller._id || user._id === product.seller);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      if (isInWishlist) {
        await removeFromWishlist(product._id);
      } else {
        // provide product object for optimistic update
        await addToWishlist(product._id, product);

        // show "Added!" feedback
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'failed to update wishlist';
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
      className={`group relative bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 h-full ${
        isHovered ? 'shadow-2xl' : 'shadow-md'
      }`}
    >
      {/* product image */}
      <div className="relative h-full w-full">
        <img
          src={product.image || '/api/placeholder/400/320'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />

        {/* favorite button  */}
        {!isOwnProduct && (
          <button
            onClick={handleFavorite}
            disabled={isProcessing}
            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 z-5 md:opacity-0 md:group-hover:opacity-100 hover:cursor-pointer ${
              isInWishlist
                ? 'bg-white/95 text-red-500'
                : 'bg-white/80 text-gray-600 hover:bg-white/95 hover:text-red-500'
            } ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 transition-transform ${isInWishlist ? 'fill-current scale-110' : ''} ${justAdded ? 'animate-bounce' : ''}`} />
            )}
          </button>
        )}

        {/* badges */}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 px-4 py-1.5 bg-black/90 backdrop-blur-sm rounded-full text-xs font-medium text-white tracking-wide z-5">
            Sold Out
          </div>
        )}

        {/* own product badge */}
        {isOwnProduct && (
          <div className="absolute top-3 left-3 px-4 py-1.5 bg-primary rounded-full text-xs font-medium text-white tracking-wide z-5">
            Your Listing
          </div>
        )}

        {/* hover overlay */}
        <div
          className={`hidden md:block absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/65 to-transparent transition-all duration-700 ease-out ${
            isHovered ? 'h-2/5' : 'h-0'
          }`}
        >
          {/* product info (appears on hover) */}
          <div
            className={`absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >

            <h3 className="font-serif text-base sm:text-lg font-normal mb-1 line-clamp-2 tracking-tight text-white drop-shadow-lg">
              {product.name}
            </h3>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xl sm:text-2xl font-bold tracking-tight drop-shadow-lg">
                  {formatCurrency(product.price)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-white/90 text-sm font-medium tracking-wide group-hover:gap-3 transition-all duration-300">
                <span>View</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>

        {/* mobile */}
        <div className="md:hidden absolute bottom-0 inset-x-0 bg-linear-to-t from-black via-black/80 to-transparent p-4">
          <h3 className="font-serif text-white text-sm font-normal line-clamp-1 mb-1.5 tracking-tight drop-shadow-lg">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-white tracking-tight">
              {formatCurrency(product.price)}
            </span>
            <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium">
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
      className={`group relative ${bgColor} rounded-3xl cursor-pointer transition-all duration-500 h-full shadow-sm hover:shadow-xl ${
        isHovered ? 'scale-[1.02]' : 'scale-100'
      } flex flex-col justify-between min-h-[100px] sm:min-h-[120px] p-5 sm:p-6`}
    >
      <div className="flex flex-col grow">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-all duration-300 ${
          isHovered ? 'bg-white/80 scale-110' : ''
        }`}>
          {Icon && <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${textColor}`} />}
        </div>
        <h3 className={`text-base sm:text-lg font-serif font-light ${textColor} mb-1 tracking-tight`}>
          {title}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm font-light">{subtitle}</p>
      </div>

      <div className={`mt-3 sm:mt-4 flex items-center justify-end transition-all duration-300 ${
        isHovered ? 'translate-x-2' : 'translate-x-0'
      }`}>
        <ArrowRight className={`w-5 h-5 ${textColor} transition-all duration-300`} />
      </div>
    </div>
  );
};

// Loading Skeleton
const SkeletonCard = () => (
  <div className="bg-gray-100 rounded-3xl overflow-hidden shadow-md h-full animate-pulse" />
);

const SkeletonCategory = () => (
  <div className="bg-gray-50 rounded-3xl p-5 sm:p-6 h-full animate-pulse min-h-[100px] sm:min-h-[120px]">
    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full mb-3 sm:mb-4" />
    <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-1/2" />
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

      // fetch general products for bento display
      const generalData = await getProducts({ limit: 6 });

      if (generalData.success) {
        // map general products
        const mappedProducts = generalData.data.products.map(product => ({
          _id: product._id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          seller: product.seller,
          rating: product.averageRating || 0,
          reviewCount: product.totalReviews || 0,
          category: product.category,
          createdAt: product.createdAt,
          image: product.images && product.images.length > 0
            ? product.images[0]
            : '/api/placeholder/400/320'
        }));
        setProducts(mappedProducts);
      } else {
        throw new Error(generalData.message || 'Failed to fetch products');
      }
      setLoading(false);
    } catch (err) {
      logger.error('Error fetching products:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const categories = [
    {
      title: 'New Arrivals',
      subtitle: 'Latest listings',
      icon: Sparkles,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-900',
      onClick: () => navigate('/browse?sort=newest')
    },
    {
      title: 'Trending',
      subtitle: 'Popular on campus',
      icon: TrendingUp,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-900',
      onClick: () => navigate('/browse?sort=trending')
    },
    {
      title: 'Electronics',
      subtitle: 'Tech essentials',
      icon: Zap,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-900',
      onClick: () => navigate('/categories/Electronics')
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
      <div className="w-full p-12 text-center">
        <p className="text-red-500 mb-4 font-light">Error loading products: {error}</p>
        <button
          onClick={fetchProducts}
          className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all duration-300 font-medium tracking-wide"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">

      {/* Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 sm:gap-5 auto-rows-[160px] sm:auto-rows-[180px] md:auto-rows-[220px] mb-4">

        {/* left: featured product */}
        <div className="col-span-2 row-span-3">
          {loading ? (
            <SkeletonCard />
          ) : (
            products[0] && <ProductCard product={products[0]} />
          )}
        </div>

        {/* middle: category grid */}
        <div className="col-span-2 row-span-2 grid grid-cols-2 gap-4 sm:gap-5">
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

        {/* right: medium product */}
        <div className="hidden md:block col-span-2 row-span-2">
          {loading ? (
            <SkeletonCard />
          ) : (
            products[1] && <ProductCard product={products[1]} />
          )}
        </div>

        {/* bottom middle: wide product */}
        <div className="col-span-2 row-span-1">
          {loading ? (
            <SkeletonCard />
          ) : (
            products[2] && <ProductCard product={products[2]} />
          )}
        </div>

        {/* bottom right: compact product */}
        <div className="hidden md:block col-span-2 row-span-1">
          {loading ? (
            <SkeletonCard />
          ) : (
            products[3] && <ProductCard product={products[3]} />
          )}
        </div>

        {/* mobile: additional products */}
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