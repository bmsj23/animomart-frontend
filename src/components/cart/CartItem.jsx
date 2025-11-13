import { X, Minus, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';

const CartItem = ({
  item,
  isSelected,
  onToggleSelection,
  onRemove,
  onUpdateQuantity
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white/60 rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 hover:shadow-xl transition-shadow relative overflow-hidden min-h-[20vh]"
      style={{ borderRadius: '28px' }}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelection(item.product._id)}
        className="absolute top-9 left-8 z-10 w-4 h-4 accent-green-600 border-gray-300 rounded hover:cursor-pointer"
        aria-label="Select item"
      />

      <button
        onClick={() => onRemove(item.product._id, item.product?.name)}
        className="absolute top-7 right-6 text-gray-600 hover:text-gray-800 p-1 rounded-full"
        aria-label="Remove item"
      >
        <X className="w-5 h-5 hover:text-red-600 hover:cursor-pointer" />
      </button>

      <div className="absolute top-72 right-9 text-right">
        <div className="font-semibold text-md text-black-400">
          Subtotal: <span className="font-bold text-black-900 text-lg">{formatCurrency(((item.product?.price || 0) * (item.quantity || 1)))}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-6 w-full items-start">
        <div className="shrink-0 relative">
          <img
            src={item.product?.images?.[0] || '/assets/emptycart.png'}
            onClick={() => navigate(`/products/${item.product._id}`)}
            alt={item.product?.name}
            className="mt-7 w-44 h-48 md:w-56 md:h-64 object-cover rounded-md bg-white hover:cursor-pointer"
          />
        </div>

        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate(`/products/${item.product._id}`)}
            className="mt-6 text-base md:text-lg text-black font-semibold truncate text-left focus:outline-none hover:cursor-pointer"
            aria-label={`View ${item.product?.name}`}
          >
            {item.product?.name}
          </button>

          <div className="text-md text-gray-500">
            {item.product?.condition || 'N/A'}
          </div>

          <div className="mt-2 text-base md:text-md font-semibold text-black-900">
            {formatCurrency(item.product?.price || 0)}
          </div>

          <div className="mt-3 md:mt-29 md:col-start-1 md:row-start-2">
            <div className="text-md font-semibold text-black mb-1">Quantity</div>

            <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => onUpdateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                disabled={item.quantity <= 1}
                className="px-3 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="px-4 py-1 text-sm font-semibold text-gray-900">{item.quantity}</div>

              <button
                type="button"
                onClick={() => onUpdateQuantity(item.product._id, Math.min(item.product?.stock || 99, item.quantity + 1))}
                disabled={item.product?.stock ? item.quantity >= item.product.stock : false}
                className="px-3 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;