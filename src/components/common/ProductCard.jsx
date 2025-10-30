import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites } from '../../hooks/useFavorites';
import { formatCurrency } from '../../utils/formatCurrency';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();

  const isOwnProduct = () => {
    return product.seller && user?._id &&
      (user._id === product.seller._id || user._id === product.seller);
  };

  const isFavorited = () => {
    return favorites.some(fav => fav._id === product._id);
  };

  const handleFavorite = async (e) => {
    e.stopPropagation(); // prevent navigation when clicking favorite
    const isFav = isFavorited();
    try {
      if (isFav) {
        await removeFromFavorites(product._id);
      } else {
        await addToFavorites(product._id);
      }
    } catch (error) {
      console.error('failed to update favorites:', error);
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${product._id}`);
  };

  const isOwn = isOwnProduct();
  const isFav = isFavorited();

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer"
    >
      {/* product image*/}
      <div className="relative bg-white rounded-sm overflow-hidden mb-4 shadow-sm hover:shadow-xl transition-shadow duration-300 ease-in-out"
           style={{ aspectRatio: '4/5' }}
      >
        {/* image with hover zoom */}
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400x500'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {/* dark overlay with view product on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 ease-in-out flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white text-sm font-medium tracking-wide px-6 py-2 border border-white/80 rounded-full backdrop-blur-sm">
              View Product
            </span>
          </div>
        </div>

        {/* top-left badge pill*/}
        {isOwn && (
          <div className="absolute top-3 left-3 px-4 py-1.5 bg-primary rounded-full text-xs font-medium text-white tracking-wide z-[5]">
            Your Listing
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute top-3 left-3 px-4 py-1.5 bg-black/90 backdrop-blur-sm rounded-full text-xs font-medium text-white tracking-wide z-10">
            Sold Out
          </div>
        )}

        {/* top right favorite button */}
        {!isOwn && (
          <button
            onClick={handleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 hover:cursor-pointer ${
              isFav
                ? 'bg-white/95 text-red-500'
                : 'bg-white/80 text-gray-600 hover:bg-white/95 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* product info*/}
      <div className="space-y-2">
        {/* product name*/}
        <h3 className="font-semibold text-main text-base leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
          {product.name}
        </h3>


        {/* star rating + review count */}
        {/* uncomment nalang when reviews are already implemented....
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
            ))}
          </div>
          <span className="text-xs text-gray">(24)</span>
        </div>
        */}

        {/* price */}
        <p className="text-lg font-bold text-main pt-1">
          {formatCurrency(product.price)}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;