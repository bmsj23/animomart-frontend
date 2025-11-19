import { ShoppingCart, MoreVertical, Eye, User, Calendar, Package } from 'lucide-react';

const OrdersTable = ({
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
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Buyer
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Seller
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Items
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map((order, index) => {
            const firstItem = getFirstItem(order);
            const totalItems = getTotalItems(order);

            return (
              <tr
                key={order._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-amber-600" />
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {order._id?.slice(-8).toUpperCase()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{order.buyer?.name || 'unknown'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{getSellerName(firstItem)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      {firstItem.product?.name || 'unknown'}
                      {totalItems > 1 && <span className="text-gray-500 text-xs ml-1">+{totalItems - 1}</span>}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{formatPrice(order.totalAmount || 0)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 text-sm">{formatDate(order.createdAt)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end relative">
                    <button
                      onClick={() => onToggleDropdown(activeDropdown === order._id ? null : order._id)}
                      className="p-1 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                    {activeDropdown === order._id && (
                      <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 ${
                        index >= orders.length - 3 ? 'bottom-8' : 'top-8 mt-2'
                      }`}>
                        <button
                          onClick={() => {
                            onViewOrder(order);
                            onToggleDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-gray-700 hover:cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;