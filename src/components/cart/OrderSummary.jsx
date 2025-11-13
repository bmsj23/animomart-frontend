import { formatCurrency } from '../../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';

const OrderSummary = ({ selectedCount, total, onCheckout }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-fit sticky top-24">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-600">
            <span className="text-black">{selectedCount} Selected Item(s)</span>
            <span className="text-black">{formatCurrency(total)}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span className="text-black">Subtotal</span>
            <span className="font-semibold text-black">{formatCurrency(total)}</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span className="text-black">Shipping</span>
            <span className="text-black">Free</span>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={selectedCount === 0}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium mb-3 disabled:bg-gray-300 disabled:cursor-not-allowed hover:cursor-pointer"
        >
          Proceed to Checkout
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium hover:cursor-pointer"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;