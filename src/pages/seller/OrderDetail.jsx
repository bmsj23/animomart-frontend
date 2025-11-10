import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, CreditCard, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { getOrder, updateOrderStatus, cancelOrder } from '../../api/orders';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { logger } from '../../utils/logger';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, reason: '' });

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await getOrder(id);
      const orderData = response.data?.order || response.order || response.data || response;
      setOrder(orderData);
    } catch (err) {
      logger.error('failed to fetch order:', err);
      error('Failed to load Order Details');
      navigate('/seller/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await updateOrderStatus(id, newStatus);
      success(`Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
      fetchOrder();
    } catch (err) {
      logger.error('failed to update order status:', err);
      error(err.response?.data?.message || 'Failed to Update Order Status');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModal.reason.trim()) {
      error('Please Provide A Cancellation Reason');
      return;
    }

    try {
      setUpdating(true);
      await cancelOrder(id, cancelModal.reason);
      success('Order Cancelled');
      setCancelModal({ isOpen: false, reason: '' });
      fetchOrder();
    } catch (err) {
      logger.error('failed to cancel order:', err);
      error(err.response?.data?.message || 'Failed To Cancel Order');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    const flow = {
      pending: 'confirmed',
      confirmed: 'processing',
      processing: 'ready',
      ready: 'completed'
    };
    return flow[currentStatus];
  };

  const getStatusAction = (status) => {
    const actions = {
      pending: 'Confirm Order',
      confirmed: 'Start Processing',
      processing: 'Mark as Ready',
      ready: 'Mark as Completed'
    };
    return actions[status];
  };

  const canUpdateStatus = (status) => {
    return ['pending', 'confirmed', 'processing', 'ready'].includes(status);
  };

  const canCancelOrder = (status) => {
    return ['pending', 'confirmed', 'processing'].includes(status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/seller/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 hover:cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Orders</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.orderNumber || order._id.slice(-8)}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <span className={`px-4 py-2 text-sm font-medium rounded-full capitalize ${getStatusBadge(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* left column - order details */}
        <div className="lg:col-span-2 space-y-6">
          {/* items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <img
                    src={item.product?.images?.[0]}
                    alt={item.product?.name}
                    className="w-20 h-20 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-2">
                      {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* status timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {['pending', 'confirmed', 'processing', 'ready', 'completed'].map((status, idx) => {
                const statusIndex = ['pending', 'confirmed', 'processing', 'ready', 'completed'].indexOf(order.status);
                const currentIndex = idx;
                const isCompleted = currentIndex <= statusIndex;
                const isCancelled = order.status === 'cancelled';

                return (
                  <div key={status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted && !isCancelled ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {isCompleted && !isCancelled ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                      </div>
                      {idx < 4 && <div className={`w-0.5 h-12 ${isCompleted && !isCancelled ? 'bg-green-600' : 'bg-gray-200'}`} />}
                    </div>
                    <div className="flex-1 pb-8">
                      <p className={`font-medium ${isCompleted && !isCancelled ? 'text-gray-900 capitalize' : 'text-gray-500 capitalize'}`}>
                        {status}
                      </p>
                    </div>
                  </div>
                );
              })}

              {order.status === 'cancelled' && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center">
                      <XCircle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-red-600">Cancelled</p>
                    {order.cancellationReason && (
                      <p className="text-sm text-gray-600 mt-1">
                        Reason: {order.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* right column - buyer & delivery info */}
        <div className="space-y-6">
          {/* buyer information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Buyer Information
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{order.buyer?.name || 'n/a'}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{order.buyer?.email || 'n/a'}</p>
              </div>
            </div>
          </div>

          {/* delivery information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {order.deliveryMethod === 'shipping' ? <Truck className="w-5 h-5" /> : <Package className="w-5 h-5" />}
              Delivery Information
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Method</p>
                <p className="font-medium text-gray-900 capitalize">{order.deliveryMethod || 'pickup'}</p>
              </div>
              {order.deliveryMethod === 'shipping' && order.deliveryAddress && (
                <>
                  <div>
                    <p className="text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">{order.deliveryAddress.fullAddress}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Contact</p>
                    <p className="font-medium text-gray-900">{order.deliveryAddress.contactNumber}</p>
                  </div>
                  {order.deliveryAddress.specialInstructions && (
                    <div>
                      <p className="text-gray-600">Special Instructions</p>
                      <p className="font-medium text-gray-900">{order.deliveryAddress.specialInstructions}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* payment information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Information
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">Method</p>
                <p className="font-medium text-gray-900">
                  {order.paymentMethod?.replace('_', ' ') || 'n/a'}
                </p>
              </div>
            </div>
          </div>

          {/* actions */}
          {canUpdateStatus(order.status) && (
            <button
              onClick={() => handleStatusUpdate(getNextStatus(order.status))}
              disabled={updating}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              {updating ? 'Updating...' : getStatusAction(order.status)}
            </button>
          )}

          {canCancelOrder(order.status) && (
            <button
              onClick={() => setCancelModal({ isOpen: true, reason: '' })}
              disabled={updating}
              className="w-full px-4 py-3 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* cancel modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, reason: '' })}
        title="Cancel Order"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Please provide a reason for cancelling this order:
          </p>
          <textarea
            value={cancelModal.reason}
            onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g. out of stock, unable to fulfill order..."
          />
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={() => setCancelModal({ isOpen: false, reason: '' })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 hover:cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={!cancelModal.reason.trim() || updating}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              {updating ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const getStatusBadge = (status) => {
  const badges = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return badges[status] || 'bg-gray-100 text-gray-800';
};

export default OrderDetail;