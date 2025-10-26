import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatCurrency';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, setCart, fetchCart, loading, updateItem, removeItem } = useCart();
  const { error: showError } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, productId: null, productName: '' });
  const pendingUpdates = useRef({});

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    // cancel any pending timeout for this product
    if (pendingUpdates.current[productId]) {
      clearTimeout(pendingUpdates.current[productId].timeout);
    }

    // store current cart state for POTENTIAL rollback
    const currentCart = cart;

    // optimistic ui update using functional setState to avoid race conditions...
    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(item =>
        item.product._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    }));

    // here, we debounce API calls (wait 300ms after last click)
    pendingUpdates.current[productId] = {
      quantity: newQuantity,
      previousCart: currentCart,
      timeout: setTimeout(async () => {
        const storedData = pendingUpdates.current[productId];
        try {
          // skip state update in context since we already updated optimistically
          await updateItem(productId, storedData.quantity, true);
          // silent success
          delete pendingUpdates.current[productId];
        } catch (err) {
          // revert to the state before this specific update started
          setCart(storedData.previousCart);
          console.error('Failed to update quantity:', err);
          showError(err.response?.data?.message || 'Failed to update cart');
          delete pendingUpdates.current[productId];
        }
      }, 300)
    };
  };

  const handleRemoveItem = async (productId) => {
    // optimistic ui update
    const previousCart = cart;
    setCart({
      ...cart,
      items: cart.items.filter(item => item.product._id !== productId)
    });

    // close modal immediately
    setDeleteConfirm({ show: false, productId: null, productName: '' });

    try {
      await removeItem(productId);
      // silent success
    } catch (err) {
      // revert on error
      setCart(previousCart);
      console.error('Failed to remove item:', err);
      showError('Failed to remove item from cart');
    }
  };

  const confirmDelete = (productId, productName) => {
    setDeleteConfirm({ show: true, productId, productName });
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const hasItems = cart && Array.isArray(cart.items) && cart.items.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      {hasItems ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Table Header */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded-2xl px-4 h-16 shadow-sm border border-gray-100 hidden md:block">
                <div className="flex items-center h-full text-gray-700 font-medium text-md">
                  <div className="flex items-center justify-start flex-[2] min-w-0 pl-6 h-full">
                    <span className="truncate">Product</span>
                  </div>
                  <div className="flex-1 text-right">
                    <span>Unit Price</span>
                  </div>
                  <div className="flex-1 text-right">
                    <span>Quantity</span>
                  </div>
                  <div className="flex-1 text-right">
                    <span>Total</span>
                  </div>
                  <div className="flex-1 text-right pr-6">
                    <span>Actions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Product Info */}
                    <div className="flex items-center gap-4 flex-[2] min-w-0">
                      <img
                        src={item.product?.images?.[0] || 'https://via.placeholder.com/100'}
                        alt={item.product?.name}
                        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.product?.name || 'Unknown Product'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.product?.condition || 'N/A'}
                        </p>
                        {item.product?.stock !== undefined && (
                          <p className="text-xs text-gray-400 mt-1">
                            {item.product.stock} in stock
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price, Quantity, Total // desktop */}
                    <div className="hidden md:flex md:flex-1 md:items-center md:justify-end text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.product?.price || 0)}
                      </p>
                    </div>

                    <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product?.stock || 0)}
                          className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
                      <p className="font-bold text-green-600">
                        {formatCurrency((item.product?.price || 0) * item.quantity)}
                      </p>
                    </div>

                    <div className="hidden md:flex md:flex-1 md:items-center md:justify-center">
                      <button
                        onClick={() => confirmDelete(item.product._id, item.product?.name)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Unit Price:</span>
                        <span className="font-medium">
                          {formatCurrency(item.product?.price || 0)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                            disabled={item.quantity >= (item.product?.stock || 0)}
                            className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency((item.product?.price || 0) * item.quantity)}
                        </span>
                      </div>

                      <button
                        onClick={() => confirmDelete(item.product._id, item.product?.name)}
                        className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 py-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove Item
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium mb-3"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      ) : (
        // show only empty message when no items
        <div className="py-12 flex flex-col items-center justify-center gap-4 text-gray-600">
          <ShoppingCart className="w-16 h-16 text-gray-400" />
          <div className="text-2xl font-medium text-gray-700">Your cart is empty.</div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Start Shopping
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, productId: null, productName: '' })}
        title="Remove Item from Cart"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to remove <span className="font-semibold text-gray-900">{deleteConfirm.productName}</span> from your cart?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setDeleteConfirm({ show: false, productId: null, productName: '' })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleRemoveItem(deleteConfirm.productId)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cart;