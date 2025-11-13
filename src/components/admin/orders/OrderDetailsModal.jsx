import { ShoppingCart, Package } from 'lucide-react';
import Modal from '../../common/Modal';

const OrderDetailsModal = ({
  isOpen,
  onClose,
  order,
  getSellerName,
  formatPrice,
  formatDate,
  getStatusColor,
}) => {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Order Details"
    >
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="w-5 h-5 text-amber-600" />
            <p className="font-semibold text-gray-900">Order ID</p>
          </div>
          <p className="font-mono text-sm text-gray-700">{order._id}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Buyer</p>
          <div className="flex items-center gap-3">
            {(order.buyer?.profilePicture || order.buyer?.picture) ? (
              <img
                src={(order.buyer?.profilePicture || order.buyer?.picture)?.replace(/=s\d+-c/, '=s200-c')}
                alt={order.buyer.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
              style={{ display: (order.buyer?.profilePicture || order.buyer?.picture) ? 'none' : 'flex' }}
            >
              <span className="text-lg font-semibold text-green-700">
                {order.buyer?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{order.buyer?.name || 'Unknown'}</p>
              <p className="text-sm text-gray-600">{order.buyer?.email}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 mb-2">Order Items</p>
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
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

        {order.deliveryMethod === 'shipping' && order.deliveryAddress && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">Delivery Address</p>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-900">{order.deliveryAddress.fullAddress}</p>
              <p className="text-sm text-gray-600 mt-1">
                Contact: {order.deliveryAddress.contactNumber}
              </p>
              {order.deliveryAddress.specialInstructions && (
                <p className="text-sm text-gray-600 mt-1">
                  Note: {order.deliveryAddress.specialInstructions}
                </p>
              )}
            </div>
          </div>
        )}

        {order.deliveryMethod === 'meetup' && order.meetupLocation && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">Meetup Location</p>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-900">{order.meetupLocation}</p>
              {order.deliveryAddress?.specialInstructions && (
                <p className="text-sm text-gray-600 mt-1">
                  Note: {order.deliveryAddress.specialInstructions}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 mb-2">Payment Method</p>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-900 capitalize">
              {order.paymentMethod?.replace(/_/g, ' ') || 'N/A'}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">Subtotal</p>
            <p className="text-gray-900">
              {formatPrice(
                order.subtotal ||
                order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) ||
                0
              )}
            </p>
          </div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">Shipping Fee</p>
            <p className="text-gray-900">{formatPrice(order.shippingFee || 0)}</p>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <p className="font-semibold text-gray-900">Total</p>
            <p className="font-bold text-lg text-gray-900">{formatPrice(order.totalAmount || 0)}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;