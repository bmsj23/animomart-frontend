import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatCurrency';
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, setCart, fetchCart, loading, updateItem, removeItem } = useCart();
  const { error: showError } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, productId: null, productName: '' });
  const [selectedItems, setSelectedItems] = useState(new Set());
  const pendingUpdates = useRef({});

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Select all items when cart loads
  useEffect(() => {
    if (cart?.items && cart.items.length > 0) {
      setSelectedItems(new Set(cart.items.map(item => item.product._id)));
    }
  }, [cart?.items]);

  const toggleItemSelection = (productId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // const toggleSelectAll = () => {
  //   if (selectedItems.size === cart?.items?.length) {
  //     setSelectedItems(new Set());
  //   } else {
  //     setSelectedItems(new Set(cart.items.map(item => item.product._id)));
  //   }
  // };

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
      // Only include selected items in total
      if (!selectedItems.has(item.product._id)) return total;
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
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Left: Cart Items */}
          <div>
            {/* Cart Items List */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white/60 rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 hover:shadow-xl transition-shadow relative overflow-hidden"
                  style={{ borderRadius: '28px' }}
                >
                  {/* Checkbox positioned in card top-left (not on image) */}
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.product._id)}
                    onChange={() => toggleItemSelection(item.product._id)}
                    className="absolute top-6 left-8 z-10 w-4 h-4 accent-green-600 border-gray-300 rounded cursor-pointer"
                    aria-label="Select item"
                  />

                  {/* Close button top-right */}
                  <button
                    onClick={() => confirmDelete(item.product._id, item.product?.name)}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 p-1 rounded-full"
                    aria-label="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* Left area: checkbox + image + offer + return policy */}
                    <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="flex items-start md:items-center gap-3 w-full md:w-auto">
                        {/* (checkbox removed from beside the image; using absolute checkbox at top-left) */}

                        {/* Product image (with checkbox above it) */}
                        <div className="flex-shrink-0 relative pt-3">
                          <img
                            src={item.product?.images?.[0] || '/EmptyCart.png'}
                            alt={item.product?.name}
                            className="w-40 h-32 md:w-48 md:h-40 object-cover rounded-md bg-white"
                          />
                        </div>

                        {/* Text block to the right of image (condition on top, no size) */}
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-800 font-medium truncate">
                              {item.product?.name || 'Recife Logo Chromefree Sneakers'}
                            </div>

                            <div className="mt-1 text-xs text-gray-500">
                              {item.product?.condition || 'N/A'}
                            </div>
                        </div>
                      </div>
                    </div>

                    {/* Right area: qty selector & price */}
                    <div className="flex flex-col items-end justify-between ml-auto">
                      <div className="flex items-center gap-4">
                        {/* Quantity selector (select) */}
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-sm text-gray-600">Qty:</span>
                          <select
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.product._id, Number(e.target.value))}
                            className="px-3 py-1 border border-gray-200 rounded-md bg-white text-sm cursor-pointer"
                          >
                            {Array.from({ length: Math.max(5, item.product?.stock || 5) }).map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </label>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-800">{formatCurrency(item.product?.price || 0)}</div>
                        </div>
                      </div>

                      {/* offer and return removed per user request */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* Right: Order Summary (beside items on desktop) */}
        <div className="w-full md:self-start">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:sticky md:top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({selectedItems.size} selected items)</span>
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
              disabled={selectedItems.size === 0}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium mb-3 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        </div>
      ) : (
        // show only empty message when no items
        <div className="py-12 flex flex-col items-center justify-center gap-4 text-gray-600 animate-fade-in">
          <img src="/EmptyCart.png" alt="Empty cart" className="w-56 h-56 md:w-80 md:h-80 object-contain animate-slide-in" />
          <div className="text-2xl md:text-3xl font-medium text-gray-700">Your cart is empty.</div>
          <button
            onClick={() => navigate('/')}
            className="mt-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer delay-200"
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
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => handleRemoveItem(deleteConfirm.productId)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
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