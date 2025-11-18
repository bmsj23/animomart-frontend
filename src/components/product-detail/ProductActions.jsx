import { Heart } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

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
  onToggleFavorite,
  onBuyNow = () => {}
}) => {
  const { showInfo } = useToast();

  const handleDecrement = () => {
    if (quantity <= 1) {
      showInfo('minimum quantity is 1');
      return;
    }
    onQuantityChange(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity >= maxStock) {
      showInfo(`maximum available stock is ${maxStock}`);
      return;
    }
    onQuantityChange(quantity + 1);
  };

  const getAddToCartClass = () => {
    if (isOutOfStock) {
      return 'border border-gray-200 text-gray-400 bg-gray-100 pointer-events-none';
    }
    if (addedToCart) {
      return 'border border-green-900 bg-green-900 text-white cursor-not-allowed';
    }
    return 'border border-green-800 text-green-800 bg-white hover:bg-green-600 hover:text-white hover:cursor-pointer';
  };

  const getBuyNowClass = () => {
    if (isOutOfStock) {
      return 'bg-gray-200 text-gray-500 pointer-events-none';
    }
    return 'bg-green-800 text-white hover:bg-green-700 hover:cursor-pointer shadow-sm';
  };

  return (
    <div className="space-y-6">
      {!isOwnProduct && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Quantity</span>
            <span className="text-gray-600">Available: {maxStock}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1 || isOutOfStock}
                className="w-11 h-11 border border-gray-300 rounded-full text-lg font-medium hover:bg-gray-50 hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                -
              </button>
              <div className="w-24 h-11 rounded-full border border-gray-300 flex items-center justify-center text-lg font-semibold text-gray-900">
                {quantity}
              </div>
              <button
                onClick={handleIncrement}
                disabled={quantity >= maxStock || isOutOfStock}
                className="w-11 h-11 border border-gray-300 rounded-full text-lg font-medium hover:bg-gray-50 hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            <button
              onClick={onToggleFavorite}
              disabled={isProcessing}
              aria-label={isFavorite ? 'remove from wishlist' : 'add to wishlist'}
              title={isFavorite ? 'remove from wishlist' : 'add to wishlist'}
              className={`w-11 h-11 border rounded-full flex items-center justify-center transition-all ${
                isFavorite ? 'border-red-300 text-red-500' : 'border-gray-300 text-gray-600 hover:border-red-200 hover:text-red-500'
              } ${isProcessing ? 'opacity-50 cursor-wait' : 'hover:cursor-pointer'}`}
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Heart
                  className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-current scale-105' : ''} ${justAdded ? 'animate-bounce' : ''}`}
                  fill={isFavorite ? 'currentColor' : 'none'}
                />
              )}
            </button>
          </div>
        </div>
      )}

      {!isOwnProduct ? (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock || isAdding || addedToCart}
            className={`${getAddToCartClass()} flex-1 min-w-40 min-h-12 rounded-2xl text-base font-semibold transition-colors duration-200 ${isAdding ? 'cursor-wait opacity-60' : ''}`}
          >
            {isOutOfStock ? 'Out of Stock' : addedToCart ? 'Added to Cart' : 'Add to Cart'}
          </button>
          <button
            onClick={() => {
              if (isOutOfStock || isAdding) return;
              onBuyNow();
            }}
            disabled={isOutOfStock || isAdding}
            className={`${getBuyNowClass()} flex-1 min-w-40 min-h-12 rounded-2xl text-base font-semibold transition-colors duration-200 ${isAdding ? 'cursor-wait opacity-60' : ''}`}
          >
            Buy Now
          </button>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center text-sm font-medium text-blue-800">
          This is your listing
        </div>
      )}
    </div>
  );
};

export default ProductActions;