import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrder } from '../api/orders';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { CheckCircle, Package, MapPin, CreditCard, Calendar, User, ShoppingBag } from 'lucide-react';
import { logger } from '../utils/logger';

const CheckoutSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        logger.log('Fetching order with ID:', orderId);
        const data = await getOrder(orderId);
        logger.log('Order fetched successfully:', data);
        // handle different response structures
        const orderData = data.order || data.data || data;
        logger.log('Setting order:', orderData);
        setOrder(orderData);
      } catch (err) {
        logger.error('Failed to fetch order:', err);
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <Link to="/cart" className="text-green-600 hover:underline">
          Return to Cart
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-gray-600 mb-4">Order Not Found</div>
        <Link to="/browse" className="text-green-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* success header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
      </div>

      {/* order status */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex gap-3">
          <Package className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-blue-900">Order Status: {order.status}</p>
            <p className="text-sm text-blue-700 mt-1">
              You will receive updates about your order via email. You can also track your order in your profile.
            </p>
          </div>
        </div>
      </div>

      {/* order details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-500 mt-1">Order #{order.orderNumber}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* order items */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Items Ordered</h3>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <img
                  src={item.productImage || '/api/placeholder/80/80'}
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded border border-gray-200"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.productName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">
                      Sold by: {item.seller?.name || 'unknown seller'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* delivery information */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Delivery Information</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {order.deliveryMethod === 'shipping' ? (
                <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              ) : (
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {order.deliveryMethod === 'shipping' ? 'Shipping Delivery' : 'Meetup'}
                </p>
                {order.deliveryMethod === 'shipping' && order.deliveryAddress ? (
                  <>
                    <p className="text-sm text-gray-600 mt-1">
                      {order.deliveryAddress.fullAddress}
                    </p>
                    <p className="text-sm text-gray-600">
                      Contact: {order.deliveryAddress.contactNumber}
                    </p>
                    {order.deliveryAddress.specialInstructions && (
                      <p className="text-sm text-gray-500 mt-1">
                        Note: {order.deliveryAddress.specialInstructions}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    Meetup location will be coordinated with seller
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Payment Method</p>
                <p className="text-sm text-gray-600 mt-1">
                  {order.paymentMethod === 'cash_on_delivery'}
                  {order.paymentMethod === 'cash_on_meetup'}
                  {order.paymentMethod === 'gcash'}
                  {order.paymentMethod === 'paymaya'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Status: <span className="text-amber-600 font-medium">{order.paymentStatus}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* order summary */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(order.totalAmount - (order.shippingFee || 0))}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping Fee</span>
              <span>{order.shippingFee > 0 ? formatCurrency(order.shippingFee) : 'Free'}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-green-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/profile?tab=purchases"
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <ShoppingBag className="w-5 h-5" />
          View My Purchases
        </Link>
        <button
          onClick={() => navigate('/browse')}
          className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default CheckoutSuccess;