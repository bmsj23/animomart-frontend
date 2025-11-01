import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/formatCurrency';
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import { addToWishlist } from '../api/wishlist';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, setCart, fetchCart, loading, updateItem, removeItem } = useCart();
  const { error: showError } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, productId: null, productName: '' });
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState({ show: false });
  const [selectedItems, setSelectedItems] = useState(() => {

    // restore selected items from localStorage on initial mount
    const saved = localStorage.getItem('cart-selected-items');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });
  const pendingUpdates = useRef({});

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // save selected items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cart-selected-items', JSON.stringify(Array.from(selectedItems)));
  }, [selectedItems]);

  // sync selected items with cart items (also remove selections for items no longer in cart)
  useEffect(() => {
    if (cart?.items) {
      const currentProductIds = new Set(cart.items.map(item => item.product._id));
      setSelectedItems(prev => {
        const filtered = new Set(Array.from(prev).filter(id => currentProductIds.has(id)));
        return filtered;
      });
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

  const toggleSelectAll = () => {
    if (!cart?.items) return;
    if (selectedItems.size === cart.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart.items.map(item => item.product._id)));
    }
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

  const moveToWishlist = async (productId) => {
    if (!productId) return;
    try {
      await addToWishlist(productId);
      // remove from cart after adding to wishlist
      await handleRemoveItem(productId);
    } catch (err) {
      console.error('failed to move to wishlist:', err);
      showError(err.response?.data?.message || 'failed to move item to wishlist');
    }
  };

  const deleteSelected = async () => {
    if (!selectedItems || selectedItems.size === 0) return;
    const ids = Array.from(selectedItems);
    const previousCart = cart;
    // optimistic remove from UI
    setCart({ ...cart, items: cart.items.filter(item => !selectedItems.has(item.product._id)) });
    setSelectedItems(new Set());
    try {
      await Promise.all(ids.map(id => removeItem(id)));
    } catch (err) {
      // revert on error
      setCart(previousCart);
      showError('Failed to delete selected items');
    }
  };

  const moveSelectedToWishlist = async () => {
    if (!selectedItems || selectedItems.size === 0) return;
    const ids = Array.from(selectedItems);
    const previousCart = cart;
    // optimistic remove from UI
    setCart({ ...cart, items: cart.items.filter(item => !selectedItems.has(item.product._id)) });
    setSelectedItems(new Set());
    // close modal
    setBulkDeleteConfirm({ show: false });
    try {
      // add to wishlist first
      await Promise.all(ids.map(id => addToWishlist(id)));
      // then remove from cart on server
      await Promise.all(ids.map(id => removeItem(id)));
    } catch (err) {
      // revert on error
      setCart(previousCart);
      console.error('failed to move selected items to wishlist:', err);
      showError(err.response?.data?.message || 'failed to move selected items to wishlist');
    }
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
      <div className="flex items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <div className="flex items-center gap-4 ml-103">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cart?.items && selectedItems.size === cart.items.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-green-600 border-gray-300 rounded"
              aria-label="Select all items"
            />
            <span className="text-md">Select All ({cart?.items?.length || 0})</span>
          </label>
          <button
            onClick={() => setBulkDeleteConfirm({ show: true })}
            disabled={selectedItems.size === 0}
            className="text-md text-black-600 hover:underline disabled cursor-pointer"
          >
            Remove
          </button>
        </div>
      </div>
      {hasItems ? (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8 items-start min-h-screen">
          {/* Left: Cart Items */}
          <div>
            {/* Cart Items List */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white/60 rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8 hover:shadow-xl transition-shadow relative overflow-hidden min-h-[20vh]"
                  style={{ borderRadius: '28px' }}
                >
                  {/* Checkbox positioned in card top-left (not on image) */}
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.product._id)}
                    onChange={() => toggleItemSelection(item.product._id)}
                    className="absolute top-9 left-8 z-10 w-4 h-4 accent-green-600 border-gray-300 rounded cursor-pointer"
                    aria-label="Select item"
                  />

                  {/* Close button top-right */}
                  <button
                    onClick={() => confirmDelete(item.product._id, item.product?.name)}
                    className="absolute top-7 right-6 text-gray-600 hover:text-gray-800 p-1 rounded-full"
                    aria-label="Remove item"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Per-item subtotal on the right side of the card (single line) */}
                  <div className="absolute top-72 right-9 text-right">
                    <div className="font-semibold text-md text-black-400">
                      Subtotal: <span className="font-bold text-black-900 text-lg">{formatCurrency(((item.product?.price || 0) * (item.quantity || 1)))}</span>
                    </div>
                  </div>

                  {/* Grid layout: image (left) | text (right). Quantity placed in a second row under the image on md+ so it's under price but aligned beneath the image.
                      On mobile (grid-cols-1) items stack: image, text, then quantity (so qty is under price there as well). */}
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-6 w-full items-start">
                    {/* Left column: image + desktop-only qty (stacked) */}
                    <div className="shrink-0 relative">
                      <img
                        src={item.product?.images?.[0] || '/EmptyCart.png'}
                        alt={item.product?.name}
                        className="mt-7 w-44 h-48 md:w-56 md:h-64 object-cover rounded-md bg-white"
                      />
                    </div>

                    {/* Text block: name, condition, price (and mobile qty below price) */}
                    <div className="min-w-0">
                      <div className="mt-6 text-base md:text-lg text-black font-semibold truncate">
                        {item.product?.name || 'Recife Logo Chromefree Sneakers'}
                      </div>

                      <div className="text-md text-gray-500">
                        {item.product?.condition || 'N/A'}
                      </div>

                      <div className="mt-2 text-base md:text-md font-semibold text-black-900">
                        {formatCurrency(item.product?.price || 0)}
                      </div>

                      {/* Quantity: keep in DOM under price, but position under image visually on md+ */}
                      <div className="mt-3 md:mt-29 md:col-start-1 md:row-start-2">
                        <div className="text-md font-semibold text-black mb-1">Quantity</div>

                        <div className="inline-flex items-center border border-gray-200 rounded-md overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="px-3 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <div className="px-4 py-1 text-sm font-semibold text-gray-900">{item.quantity}</div>

                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.product._id, Math.min(item.product?.stock || 99, item.quantity + 1))}
                            disabled={item.product?.stock ? item.quantity >= item.product.stock : false}
                            className="px-3 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* end grid */}
                  </div>
                </div>
              ))}
            </div>
          </div>

        {/* Right: Order Summary (beside items on desktop) */}
        <div className="w-full h-fit sticky top-24">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span className="text-black">{selectedItems.size} Selected Item(s)</span>
                  <span className="text-black">{formatCurrency(calculateTotal())}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span className="text-black">Subtotal</span>
                  <span className="font-semibold text-black">{formatCurrency(calculateTotal())}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span className="text-black">Shipping</span>
                  <span className="text-black">Free</span>
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
        isOpen={bulkDeleteConfirm.show}
        onClose={() => setBulkDeleteConfirm({ show: false })}
        title="Remove Selected Items"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to remove all {selectedItems.size > 1 ? 'items' : 'item'} from your cart?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={async () => {
                setBulkDeleteConfirm({ show: false });
                await deleteSelected();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              Remove
            </button>
            <button
              onClick={() => moveSelectedToWishlist()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Add to Wishlist
            </button>
          </div>
        </div>
      </Modal>
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
              onClick={() => handleRemoveItem(deleteConfirm.productId)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              Remove
            </button>
            <button
              onClick={() => moveToWishlist(deleteConfirm.productId)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Move to Wishlist
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cart;