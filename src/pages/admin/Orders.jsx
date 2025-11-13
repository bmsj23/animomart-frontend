import { useState, useEffect, useCallback } from 'react';
import { getAllOrders } from '../../api/admin';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import OrdersHeader from '../../components/admin/orders/OrdersHeader';
import OrdersSearchBar from '../../components/admin/orders/OrdersSearchBar';
import OrdersMobileCard from '../../components/admin/orders/OrdersMobileCard';
import OrdersTable from '../../components/admin/orders/OrdersTable';
import OrderDetailsModal from '../../components/admin/orders/OrderDetailsModal';
import { logger } from '../../utils/logger';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { showError } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      const ordersData = response.orders || response.data?.orders || response?.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      showError('failed to fetch orders');
      logger.error('error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const getFirstItem = (order) => order.items?.[0] || {};

  const getTotalItems = (order) => {
    return order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  };

  const getSellerName = (item) => {
    if (!item) return 'unknown';
    const seller = item.seller;
    if (typeof seller === 'string') {
      return 'unknown';
    } else if (seller && typeof seller === 'object') {
      return seller.name || seller.username || 'unknown';
    }
    return 'unknown';
  };

  const filteredOrders = orders.filter(order => {
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
      <OrdersHeader orderCount={orders.length} />

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <OrdersSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No orders found
          </div>
        ) : (
          <>
            <OrdersMobileCard
              orders={filteredOrders}
              activeDropdown={activeDropdown}
              onToggleDropdown={setActiveDropdown}
              onViewOrder={handleViewOrder}
              getFirstItem={getFirstItem}
              getTotalItems={getTotalItems}
              getSellerName={getSellerName}
              formatPrice={formatPrice}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
            />

            <OrdersTable
              orders={filteredOrders}
              activeDropdown={activeDropdown}
              onToggleDropdown={setActiveDropdown}
              onViewOrder={handleViewOrder}
              getFirstItem={getFirstItem}
              getTotalItems={getTotalItems}
              getSellerName={getSellerName}
              formatPrice={formatPrice}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
            />
          </>
        )}
      </div>

      <OrderDetailsModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        getSellerName={getSellerName}
        formatPrice={formatPrice}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
      />
    </div>
  );
};

export default Orders;