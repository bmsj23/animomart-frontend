import { ShoppingCart, MoreVertical, Eye, User, Calendar, Package } from 'lucide-react';

const OrdersMobileCard = ({
  orders,
  activeDropdown,
  onToggleDropdown,
  onViewOrder,
  getFirstItem,
  getTotalItems,
  getSellerName,
  formatPrice,
  formatDate,
  getStatusColor,
}) => {
  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="md:hidden divide-y divide-gray-200">
      {orders.map((order) => {
        const firstItem = getFirstItem(order);
        const totalItems = getTotalItems(order);

        return (
          <div key={order._id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-4 h-4 text-amber-600" />
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {order._id?.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-600">Buyer:</span>
                    <span className="text-gray-900 font-medium">{order.buyer?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-600">Seller:</span>
                    <span className="text-gray-900 font-medium">{getSellerName(firstItem)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-600">Items:</span>
                    <span className="text-gray-900">
                      {firstItem.product?.name || 'Unknown'}
                      {totalItems > 1 && ` +${totalItems - 1} more`}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onToggleDropdown(activeDropdown === order._id ? null : order._id)}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{formatPrice(order.totalAmount || 0)}</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(order.createdAt)}</span>
            </div>

            {activeDropdown === order._id && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    onViewOrder(order);
                    onToggleDropdown(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-2 hover:cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrdersMobileCard;