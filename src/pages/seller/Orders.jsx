import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronRight, Calendar } from 'lucide-react';
import { getMySales } from '../../api/orders';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { logger } from '../../utils/logger';

const getEmptyStateContent = (statusFilter) => {
  const states = {
    shipped: {
      image: '/assets/Shipped.PNG',
      title: 'No Shipped Orders',
      description: 'Orders marked as shipped will appear here'
    },
    completed: {
      image: '/assets/NoProducts.png',
      title: 'No Completed Orders',
      description: 'Completed orders will appear here'
    },
    cancelled: {
      image: '/assets/NoProducts.png',
      title: 'No Cancelled Orders',
      description: 'Cancelled orders will appear here'
    },
    pending: {
      image: '/assets/NoProducts.png',
      title: 'No Pending Orders',
      description: 'Pending orders will appear here'
    },
    confirmed: {
      image: '/assets/NoProducts.png',
      title: 'No Confirmed Orders',
      description: 'Confirmed orders will appear here'
    },
    processing: {
      image: '/assets/NoProducts.png',
      title: 'No Processing Orders',
      description: 'Orders being processed will appear here'
    },
    ready: {
      image: '/assets/NoProducts.png',
      title: 'No Ready Orders',
      description: 'Orders ready for pickup/delivery will appear here'
    },
    all: {
      image: '/assets/NoProducts.png',
      title: 'No Orders Found',
      description: 'You have no orders yet'
    }
  };
  return states[statusFilter] || states.all;
};

const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const { error } = useToast();

  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await getMySales(params);
      const data = response.data || response;

      setOrders(data.orders || []);
      setPagination(data.pagination || null);
    } catch (err) {
      logger.error('failed to fetch orders:', err);
      error('Failed To Load Orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage, ...(statusFilter !== 'all' && { status: statusFilter }) });
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setSearchParams({ page: 1, ...(status !== 'all' && { status }) });
  };

  const filteredOrders = orders.filter(order => {
    const orderId = order.orderNumber || order._id.slice(-8);
    const buyerName = order.buyer?.name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return orderId.includes(query) || buyerName.includes(query);
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      shipped: 'bg-cyan-100 text-cyan-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sales Orders</h1>
        <p className="mt-1 text-sm text-gray-600">Manage Your Incoming Orders</p>
      </div>

      {/* filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Buyer Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* status filter */}
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'pending', 'confirmed', 'processing', 'ready', 'shipped', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors hover:cursor-pointer ${
                  statusFilter === status
                    ? 'bg-green-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* orders list */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="flex items-center justify-center py-6">
              <img
                src={searchQuery ? '/assets/NoProducts.png' : getEmptyStateContent(statusFilter).image}
                alt="No orders"
                className="w-65 h-48 md:w-56 md:h-56 object-contain mx-auto mb-0 animate-slide-in"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No Orders Found' : getEmptyStateContent(statusFilter).title}
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search' : getEmptyStateContent(statusFilter).description}
            </p>
          </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Link
                key={order._id}
                to={`/seller/orders/${order._id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 hover:cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber || order._id.slice(-8)}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.createdAt)}
                      </div>
                      <span>•</span>
                      <span>{order.buyer?.name || 'Unknown Buyer'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.items?.length || 0} Item(s)
                    </p>
                  </div>
                </div>

                {/* order items preview */}
                <div className="flex items-center gap-3 py-3 border-t">
                  <div className="flex -space-x-2">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <img
                        key={idx}
                        src={item.product?.images?.[0]}
                        alt=""
                        className="w-10 h-10 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {order.items?.[0]?.product?.name}
                      {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>

          {/* pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing Page {pagination.currentPage} of {pagination.totalPages}
                {' '}({pagination.totalOrders || 0} Total Orders)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;