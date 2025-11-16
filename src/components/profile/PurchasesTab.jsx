import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatCurrency } from "../../utils/formatCurrency";

const PurchasesTab = ({
  purchaseOrders,
  loading,
  error,
  canReview,
  onWriteReview
}) => {
  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (purchaseOrders.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-700 mb-4">You haven't purchased any products yet.</p>
        <Link to="/browse" className="px-4 py-2 bg-green-600 text-white rounded-md">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {purchaseOrders.map((order) => (
        <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold">Order #{order.orderNumber || order._id?.slice(-8)}</h3>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()} • {order.status}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-green-700">
                {formatCurrency(order.totalAmount)}
              </span>
              <Link
                to={`/orders/${order._id}`}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors hover:cursor-pointer"
              >
                View Order
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {(order.items || []).map((item, idx) => {
              const product = item.product || item;
              const productId = product._id || product.id;
              const reviewable = canReview(order, productId);

              return (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Link to={productId ? `/products/${productId}` : '#'} className="shrink-0">
                    <img
                      src={product.image || product.images?.[0] || '/api/placeholder/400/320'}
                      alt={product.name || 'Product'}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </Link>

                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{product.name || 'Product'}</h4>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(item.price || product.price || 0)} × {item.quantity}
                    </p>
                  </div>

                  {order.status === 'completed' && reviewable && (
                    <button
                      onClick={() => onWriteReview(order, product)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors hover:cursor-pointer"
                    >
                      Write Review
                    </button>
                  )}

                  {order.status === 'completed' && !reviewable && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      Reviewed
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PurchasesTab;