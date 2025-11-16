import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, User, Star } from 'lucide-react';
import { getOrder, cancelOrder } from '../api/orders';
import { createReview } from '../api/reviews';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import ReviewForm from '../components/common/ReviewForm';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { logger } from '../utils/logger';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error, success } = useToast();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, reason: '' });
  const [reviewModal, setReviewModal] = useState({ isOpen: false, product: null });
  const [reviewedProducts, setReviewedProducts] = useState([]);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await getOrder(id);
      const orderData = response.data?.order || response.order || response.data || response;

      logger.log('fetched order:', orderData);
      logger.log('current user:', user);

      // verify that the order belongs to the current buyer
      const buyerId = typeof orderData.buyer === 'object' ? orderData.buyer?._id : orderData.buyer;
      const currentUserId = user?._id;

      logger.log('comparing buyerId:', buyerId, 'with userId:', currentUserId);

      if (buyerId && currentUserId && buyerId !== currentUserId) {
        logger.error('unauthorized access attempt to order:', id);
        error('You are not authorized to view this order');
        navigate('/profile?tab=purchases');
        return;
      }

      setOrder(orderData);

      if (orderData.items) {
        const reviewed = orderData.items
          .filter(item => item.hasReview || item.reviewed)
          .map(item => item.product?._id || item.product);
        setReviewedProducts(reviewed);
      }
    } catch (err) {
      logger.error('failed to fetch order:', err);
      error('Failed to load Order Details');
      navigate('/profile?tab=purchases');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      processing: 'text-purple-700 bg-purple-50 border-purple-200',
      ready: 'text-blue-700 bg-blue-50 border-blue-200',
      shipped: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      completed: 'text-green-700 bg-green-50 border-green-200',
      cancelled: 'text-red-700 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const formatPaymentMethod = (method) => {
    if (!method) return 'N/A';

    const methodMap = {
      cash_on_delivery: 'Cash On Delivery',
      cash_on_meetup: 'Cash On Meetup',
      gcash: 'GCash',
      maya: 'Maya',
      paymaya: 'PayMaya'
    };

    if (methodMap[method]) {
      return methodMap[method];
    }

    return method
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleCancelOrder = async () => {
    if (!cancelModal.reason.trim()) {
      error('Please provide a cancellation reason');
      return;
    }

    try {
      setCancelling(true);
      await cancelOrder(id, cancelModal.reason);
      success('Order cancelled successfully');
      setCancelModal({ isOpen: false, reason: '' });
      await fetchOrder();
    } catch (err) {
      logger.error('failed to cancel order:', err);
      error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const canCancelOrder = (status) => {
    return status === 'pending';
  };

  const canReviewProduct = (productId) => {
    return order?.status === 'completed' && !reviewedProducts.includes(productId);
  };

  const handleWriteReview = (product) => {
    setReviewModal({ isOpen: true, product });
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await createReview({
        ...reviewData,
        productId: reviewModal.product._id,
        orderId: order._id,
      });
      success('Review submitted successfully');
      setReviewedProducts(prev => [...prev, reviewModal.product._id]);
      setReviewModal({ isOpen: false, product: null });
    } catch (err) {
      logger.error('failed to submit review:', err);
      error(err.response?.data?.message || 'Failed to submit review');
    }
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
          onClick={() => navigate('/profile?tab=purchases')}
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
          <span className={`px-4 py-2 text-sm font-medium rounded-full capitalize border ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* left column - order items */}
        <div className="lg:col-span-2 space-y-6">
          {/* items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item, idx) => {
                const productId = item.product?._id || item.product;
                const isReviewed = reviewedProducts.includes(productId);
                const canReview = canReviewProduct(productId);

                return (
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
                      {canReview && (
                        <button
                          onClick={() => handleWriteReview(item.product)}
                          className="mt-3 flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium hover:cursor-pointer"
                        >
                          <Star className="w-4 h-4" />
                          Write Review
                        </button>
                      )}
                      {isReviewed && (
                        <span className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          Reviewed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            <div className="space-y-4">
              {(() => {
                const timeline = order.deliveryMethod === 'meetup'
                  ? ['pending', 'processing', 'ready', 'completed']
                  : ['pending', 'processing', 'shipped', 'completed'];

                const statusLabels = {
                  pending: 'Order Placed',
                  processing: 'Processing',
                  ready: 'Ready For Pickup',
                  shipped: 'Shipped',
                  completed: 'Completed'
                };

                const statusIndex = timeline.indexOf(order.status);

                return timeline.map((status, idx) => {
                  const isCompleted = idx <= statusIndex;
                  const isCancelled = order.status === 'cancelled';

                  return (
                    <div key={status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCancelled ? 'bg-red-100 border-2 border-red-500' :
                          isCompleted ? 'bg-green-500 border-2 border-green-500' :
                          'bg-gray-200 border-2 border-gray-300'
                        }`}>
                          {isCompleted && !isCancelled && (
                            <Package className="w-4 h-4 text-white" />
                          )}
                        </div>
                        {idx < timeline.length - 1 && (
                          <div className={`w-0.5 h-12 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <p className={`font-medium ${
                          isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {statusLabels[status]}
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* right column - seller, delivery and payment info */}
        <div className="space-y-6">
          {/* seller info */}
          {order.seller && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Seller Info</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-gray-900">{order.seller.name || order.seller.username}</p>
                </div>
                {order.seller.email && (
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{order.seller.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* delivery info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Delivery Info</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Method</p>
                <p className="font-medium text-gray-900 capitalize">{order.deliveryMethod}</p>
              </div>
              {order.deliveryMethod === 'shipping' && order.deliveryAddress && (
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">{order.deliveryAddress.fullAddress}</p>
                  {order.deliveryAddress.contactNumber && (
                    <p className="text-sm text-gray-600 mt-1">
                      Contact: {order.deliveryAddress.contactNumber}
                    </p>
                  )}
                </div>
              )}
              {order.deliveryMethod === 'meetup' && order.meetupLocation && (
                <div>
                  <p className="text-sm text-gray-600">Meetup Location</p>
                  <p className="font-medium text-gray-900">{order.meetupLocation}</p>
                </div>
              )}
            </div>
          </div>

          {/* payment info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Payment Info</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Method</p>
                <p className="font-medium text-gray-900">{formatPaymentMethod(order.paymentMethod)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* cancel order button */}
          {canCancelOrder(order.status) && (
            <button
              onClick={() => setCancelModal({ isOpen: true, reason: '' })}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors hover:cursor-pointer"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* cancel order modal */}
      <Modal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, reason: '' })}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel this order? Please provide a reason for cancellation.
          </p>
          <textarea
            value={cancelModal.reason}
            onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="Reason for cancellation..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setCancelModal({ isOpen: false, reason: '' })}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:cursor-pointer"
            >
              Nevermind
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
            </button>
          </div>
        </div>
      </Modal>

      {/* review modal */}
      <Modal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, product: null })}
        title="Write a Review"
      >
        {reviewModal.product && (
          <div>
            <div className="mb-4">
              <div className="flex gap-3 items-start">
                <img
                  src={reviewModal.product.images?.[0]}
                  alt={reviewModal.product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{reviewModal.product.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatCurrency(reviewModal.product.price || 0)}
                  </p>
                </div>
              </div>
            </div>
            <ReviewForm
              productId={reviewModal.product._id}
              orderId={order._id}
              onSubmit={handleReviewSubmit}
              onCancel={() => setReviewModal({ isOpen: false, product: null })}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderDetail;