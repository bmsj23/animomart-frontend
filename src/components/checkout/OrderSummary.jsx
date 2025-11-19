import { formatCurrency } from '../../utils/formatCurrency';

const OrderSummary = ({ sellerGroups, subtotal, shippingFee, total, isProcessing, onSubmit, onCancel }) => {
  return (
    <aside className="w-full h-fit sticky top-24">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

        {/* group by seller */}
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {sellerGroups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              no items selected for checkout
            </div>
          ) : (
            sellerGroups.map((group, idx) => (
              <div key={group.sellerId || idx} className="pb-4 border-b border-gray-200 last:border-0">
                <div className="flex items-center gap-2 mb-3">
                  {group.seller?.profilePicture ? (
                    <img
                      src={group.seller.profilePicture}
                      alt={group.sellerName}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
                    style={{ display: group.seller?.profilePicture ? 'none' : 'flex' }}
                  >
                    <span className="text-xs font-medium text-green-700">
                      {group.sellerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {group.sellerName}
                  </span>
                </div>
                <div className="space-y-2 ml-10">
                  {group.items.map((item) => (
                    <div key={item._id || item.product?._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={item.product?.images?.[0] || '/api/placeholder/80/80'}
                          alt={item.product?.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="text-sm flex-1">
                          <div className="font-medium line-clamp-1">{item.product?.name}</div>
                          <div className="text-xs text-gray-500">Quantity: {item.quantity}</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold ml-2">
                        {formatCurrency((item.product?.price || 0) * (item.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2 mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping Fee</span>
            <span className="font-semibold">{formatCurrency(shippingFee)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span>Total</span>
            <span className="text-green-600">{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={isProcessing}
          className="w-full bg-green-800 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium hover:cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Place Order'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium hover:cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </aside>
  );
};

export default OrderSummary;