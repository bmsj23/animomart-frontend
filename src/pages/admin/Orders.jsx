import { useState, useEffect } from 'react';
import { getAllOrders } from '../../api/admin';
import { useToast } from '../../hooks/useToast';
import { Search, ShoppingCart, MoreVertical, Eye, User, Calendar, Package } from 'lucide-react';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { logger } from '../../utils/logger';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { showError } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      // handle different response structures
      const ordersData = response.orders || response.data?.orders || response?.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      showError('failed to fetch orders');
      logger.error('error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  // helper to get first item from order
  const getFirstItem = (order) => order.items?.[0] || {};

  // helper to get total items count
  const getTotalItems = (order) => {
    return order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  };

  // helper to get seller name from item
  const getSellerName = (item) => {
    if (!item) return 'unknown';

    // seller is at item level, not product level
    const seller = item.seller;

    // check if seller is populated object or just ID string
    if (typeof seller === 'string') {
      return 'unknown';
    } else if (seller && typeof seller === 'object') {
      return seller.name || seller.username || 'unknown';
    }

    return 'unknown';
  };  const filteredOrders = orders.filter(order => {
    const firstItem = getFirstItem(order);
    const sellerName = getSellerName(firstItem);
    return order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sellerName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Track and manage marketplace transactions</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-amber-500 to-amber-600 text-white rounded-2xl">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-semibold">{orders.length} Orders</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders by ID, buyer, or seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* mobile card view */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No orders found
            </div>
          ) : (
            filteredOrders.map((order) => {
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
                    onClick={() => setActiveDropdown(activeDropdown === order._id ? null : order._id)}
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
                        handleViewOrder(order);
                        setActiveDropdown(null);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-2 hover:cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                )}
              </div>
            )})
          )}
        </div>

        {/* desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => {
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
                          onClick={() => setActiveDropdown(activeDropdown === order._id ? null : order._id)}
                          className="p-1 hover:bg-gray-200 rounded-lg transition-colors hover:cursor-pointer"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {activeDropdown === order._id && (
                          <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 ${
                            index >= filteredOrders.length - 3 ? 'bottom-8' : 'top-8 mt-2'
                          }`}>
                            <button
                              onClick={() => {
                                handleViewOrder(order);
                                setActiveDropdown(null);
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
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="Order Details"
        >
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
                <p className="font-semibold text-gray-900">Order ID</p>
              </div>
              <p className="font-mono text-sm text-gray-700">{selectedOrder._id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Buyer</p>
              <div className="flex items-center gap-3">
                {(selectedOrder.buyer?.profilePicture || selectedOrder.buyer?.picture) ? (
                  <img
                    src={(selectedOrder.buyer?.profilePicture || selectedOrder.buyer?.picture)?.replace(/=s\d+-c/, '=s200-c')}
                    alt={selectedOrder.buyer.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
                  style={{ display: (selectedOrder.buyer?.profilePicture || selectedOrder.buyer?.picture) ? 'none' : 'flex' }}
                >
                  <span className="text-lg font-semibold text-green-700">
                    {selectedOrder.buyer?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedOrder.buyer?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.buyer?.email}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-2">Order Items</p>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.product?.name || 'Unknown'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {(item.seller?.profilePicture || item.seller?.picture) ? (
                          <img
                            src={(item.seller?.profilePicture || item.seller?.picture)?.replace(/=s\d+-c/, '=s200-c')}
                            alt={item.seller.name}
                            className="w-5 h-5 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center"
                          style={{ display: (item.seller?.profilePicture || item.seller?.picture) ? 'none' : 'flex' }}
                        >
                          <span className="text-xs font-semibold text-amber-700">
                            {getSellerName(item).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Seller: {getSellerName(item)}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatPrice(item.price)} × {item.quantity} = {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* delivery address or meetup location */}
            {selectedOrder.deliveryMethod === 'shipping' && selectedOrder.deliveryAddress && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-2">Delivery Address</p>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-900">{selectedOrder.deliveryAddress.fullAddress}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Contact: {selectedOrder.deliveryAddress.contactNumber}
                  </p>
                  {selectedOrder.deliveryAddress.specialInstructions && (
                    <p className="text-sm text-gray-600 mt-1">
                      Note: {selectedOrder.deliveryAddress.specialInstructions}
                    </p>
                  )}
                </div>
              </div>
            )}

            {selectedOrder.deliveryMethod === 'meetup' && selectedOrder.meetupLocation && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-2">Meetup Location</p>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-gray-900">{selectedOrder.meetupLocation}</p>
                  {selectedOrder.deliveryAddress?.specialInstructions && (
                    <p className="text-sm text-gray-600 mt-1">
                      Note: {selectedOrder.deliveryAddress.specialInstructions}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* payment method */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-2">Payment Method</p>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900 capitalize">
                  {selectedOrder.paymentMethod?.replace(/_/g, ' ') || 'N/A'}
                </p>
              </div>
            </div>

            {/* pricing */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="text-gray-900">
                  {formatPrice(
                    selectedOrder.subtotal ||
                    selectedOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) ||
                    0
                  )}
                </p>
              </div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600">Shipping Fee</p>
                <p className="text-gray-900">{formatPrice(selectedOrder.shippingFee || 0)}</p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <p className="font-semibold text-gray-900">Total</p>
                <p className="font-bold text-lg text-gray-900">{formatPrice(selectedOrder.totalAmount || 0)}</p>
              </div>
            </div>

            {/* status and date */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;