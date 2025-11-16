import { Heart } from 'lucide-react';

const ProductActions = ({
  isOwnProduct,
  isOutOfStock,
  quantity,
  maxStock,
  isFavorite,
  isAdding,
  addedToCart,
  isProcessing,
  justAdded,
  onQuantityChange,
  onAddToCart,
  onToggleFavorite
}) => {
  
  const getAddToCartClass = () => {
    if (isOutOfStock) {
      return 'flex-1 bg-gray-300 text-white py-3 rounded-lg cursor-not-allowed font-medium';
    }
    if (addedToCart) {
      return 'flex-1 bg-green-800 text-white py-3 rounded-lg cursor-not-allowed font-medium';
    }
    return 'flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 hover:cursor-pointer transition-colors font-medium';
  };

  return (
    <div>
      {!isOwnProduct && !isOutOfStock && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max={maxStock}
              value={quantity}
              onChange={(e) => onQuantityChange(Math.max(1, Math.min(maxStock, parseInt(e.target.value) || 1)))}
              className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => onQuantityChange(Math.min(maxStock, quantity + 1))}
              className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 hover:cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        {!isOwnProduct && (
          <>
            <button
              onClick={onAddToCart}
              disabled={isOutOfStock || isAdding || addedToCart}
              className={getAddToCartClass()}
            >
              {isOutOfStock ? 'Out of Stock' : (addedToCart ? 'Added to Cart' : 'Add to Cart')}
            </button>
            <button
              onClick={onToggleFavorite}
              disabled={isProcessing}
              aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
              title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`w-12 h-12 border border-gray-300 rounded-lg transition-all duration-300 flex items-center justify-center ${
                isFavorite
                  ? 'bg-white/95 text-red-500'
                  : 'bg-white/80 text-gray-600 hover:bg-white/95 hover:text-red-500'
              } ${isProcessing ? 'opacity-50 cursor-wait' : 'hover:cursor-pointer'}`}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Heart className={`w-6 h-6 transition-transform ${isFavorite ? 'fill-current scale-110' : ''} ${justAdded ? 'animate-bounce' : ''}`} fill={isFavorite ? 'currentColor' : 'none'} />
              )}
            </button>
          </>
        )}
        {isOwnProduct && (
          <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800 font-medium">This is your listing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductActions;