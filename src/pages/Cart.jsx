import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { Trash2 } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import CartHeader from '../components/cart/CartHeader';
import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';
import EmptyCart from '../components/cart/EmptyCart';
import { logger } from '../utils/logger';
import * as cartApi from '../api/cart';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, setCart, fetchCart, loading, updateItem, removeItem, invalidItems } = useCart();
  const { error: showError, success: showSuccess } = useToast();
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, productId: null, productName: '' });
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState({ show: false });
  const [selectedItems, setSelectedItems] = useState(() => {
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

  // When the cart changes (or finishes loading after a refresh), scroll to top
  useEffect(() => {
    // avoid scrolling while still loading
    if (loading) return;

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      // fallback
      logger.log(e);
      window.scrollTo(0, 0);
    }
  }, [loading, cart?.items?.length]);

  useEffect(() => {
    localStorage.setItem('cart-selected-items', JSON.stringify(Array.from(selectedItems)));
  }, [selectedItems]);

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

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    if (pendingUpdates.current[productId]) {
      clearTimeout(pendingUpdates.current[productId].timeout);
    }

    const currentCart = cart;

    setCart(prevCart => ({
      ...prevCart,
      items: prevCart.items.map(item =>
        item.product._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    }));

    pendingUpdates.current[productId] = {
      quantity: newQuantity,
      previousCart: currentCart,
      timeout: setTimeout(async () => {
        const storedData = pendingUpdates.current[productId];
        try {
          await updateItem(productId, storedData.quantity, true);
          delete pendingUpdates.current[productId];
        } catch (err) {
          setCart(storedData.previousCart);
          logger.error('Failed to update quantity:', err);
          showError(err.response?.data?.message || 'Failed to update cart');
          delete pendingUpdates.current[productId];
        }
      }, 300)
    };
  };

  const handleRemoveItem = async (productId) => {
    const previousCart = cart;
    setCart({
      ...cart,
      items: cart.items.filter(item => item.product._id !== productId)
    });

    setDeleteConfirm({ show: false, productId: null, productName: '' });

    try {
      await removeItem(productId);
    } catch (err) {
      setCart(previousCart);
      logger.error('Failed to remove item:', err);
      showError('Failed to remove item from cart');
    }
  };

  const confirmDelete = (productId, productName) => {
    setDeleteConfirm({ show: true, productId, productName });
  };

  const { addToWishlist } = useWishlist();

  const moveToWishlist = async (productId) => {
    if (!productId) return;
    try {
      const cartItem = cart?.items?.find((it) => it.product._id === productId);
      const productObj = cartItem?.product || null;
      const result = await addToWishlist(productId, productObj);

      // only remove from cart if successfully added (not already in wishlist)
      if (!result?.alreadyInWishlist) {
        await handleRemoveItem(productId);
      } else {
        // item already in wishlist, sooo just remove d prod from cart
        setDeleteConfirm({ show: false, productId: null, productName: '' });
        await handleRemoveItem(productId);
      }
    } catch (err) {
      logger.error('failed to move to wishlist:', err);
      showError(err.response?.data?.message || 'failed to move item to wishlist');
    }
  };

  const deleteSelected = async () => {
    if (!selectedItems || selectedItems.size === 0) return;
    const ids = Array.from(selectedItems);
    const previousCart = cart;
    setCart({ ...cart, items: cart.items.filter(item => !selectedItems.has(item.product._id)) });
    setSelectedItems(new Set());

    try {
      for (const id of ids) {
        try {
          await cartApi.removeFromCart(id);
        } catch (err) {
          logger.error(`Failed to remove item ${id}:`, err);
        }
      }

      await fetchCart();
    } catch (err) {
      setCart(previousCart);
      logger.error('Bulk delete error:', err);
    }
  };

  const handleRemoveInvalidItems = async () => {
    if (!invalidItems || invalidItems.length === 0) return;

    try {
      for (const item of invalidItems) {
        try {
          await removeItem(item.productId);
        } catch (err) {
          logger.error('failed to remove invalid item:', item.productId, err);
        }
      }
      showSuccess('Invalid items removed from cart');
      await fetchCart();
    } catch (err) {
      logger.error('failed to remove invalid items:', err);
      showError('Failed to remove invalid items');
    }
  };

  const moveSelectedToWishlist = async () => {
    if (!selectedItems || selectedItems.size === 0) return;
    const ids = Array.from(selectedItems);
    const previousCart = cart;
    setBulkDeleteConfirm({ show: false });

    setCart({ ...cart, items: cart.items.filter(item => !selectedItems.has(item.product._id)) });
    setSelectedItems(new Set());

    try {
      // add to wishlist (can be parallel)
      const results = await Promise.allSettled(ids.map(id => {
        const cartItem = previousCart.items.find(it => it.product._id === id);
        const productObj = cartItem?.product || null;
        return addToWishlist(id, productObj);
      }));

      // error check (excluding "already in wishlist")
      const errors = results.filter(r =>
        r.status === 'rejected' &&
        !r.reason?.response?.data?.message?.toLowerCase().includes('already in wishlist')
      );

      if (errors.length > 0) {
        throw errors[0].reason;
      }

      for (const id of ids) {
        try {
          await cartApi.removeFromCart(id);
        } catch (err) {
          logger.error(`Failed to remove item ${id} from cart:`, err);
        }
      }
      await fetchCart();
      showSuccess('Items moved to wishlist');
    } catch (err) {
      setCart(previousCart);
      logger.error('failed to move selected items to wishlist:', err);
      showError(err.response?.data?.message || 'failed to move selected items to wishlist');
    }
  };

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      if (!selectedItems.has(item.product._id)) return total;
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateShippingFee = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      if (!selectedItems.has(item.product._id)) return total;
      const shippingFee = item.product?.shippingFee ?? item.product?.shipping_fee ?? 0;
      return total + (shippingFee * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    localStorage.setItem('checkout-selected-items', JSON.stringify(Array.from(selectedItems)));
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const hasItems = cart && Array.isArray(cart.items) && cart.items.length > 0;

  const sortedCartItems = hasItems
    ? [...cart.items].sort((a, b) => {
        const timeA = a._id ? parseInt(a._id.substring(0, 8), 16) : 0;
        const timeB = b._id ? parseInt(b._id.substring(0, 8), 16) : 0;
        return timeB - timeA;
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {invalidItems && invalidItems.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Invalid Items Detected
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Your cart contains {invalidItems.length} invalid item{invalidItems.length !== 1 ? 's' : ''} (deleted or out of stock products).
                These items may cause checkout issues.
              </p>
              <button
                onClick={handleRemoveInvalidItems}
                className="mt-3 text-sm font-medium text-yellow-800 hover:text-yellow-900 underline hover:cursor-pointer"
              >
                Remove Invalid Items
              </button>
            </div>
          </div>
        </div>
      )}

      <CartHeader
        hasItems={hasItems}
        itemCount={cart?.items?.length || 0}
        allSelected={cart?.items && selectedItems.size === cart.items.length}
        selectedCount={selectedItems.size}
        onToggleSelectAll={toggleSelectAll}
        onBulkDelete={() => setBulkDeleteConfirm({ show: true })}
      />

      {hasItems ? (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8 items-start min-h-screen">
          <div className="space-y-4">
            {sortedCartItems.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                isSelected={selectedItems.has(item.product._id)}
                onToggleSelection={toggleItemSelection}
                onRemove={confirmDelete}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>

          <OrderSummary
            selectedCount={selectedItems.size}
            total={calculateTotal()}
            shippingFee={calculateShippingFee()}
            onCheckout={handleCheckout}
          />
        </div>
      ) : (
        <div className="min-h-screen" style={{ minHeight: '125vh' }}>
          <EmptyCart />
        </div>
      )}

      <Modal
        isOpen={bulkDeleteConfirm.show}
        onClose={() => setBulkDeleteConfirm({ show: false })}
        title="Remove Selected Items"
        description={`Are you sure you want to remove ${selectedItems.size > 1 ? 'all selected items' : 'this item'} from your cart?`}
        icon={<Trash2 className="w-5 h-5" />}
        iconBgColor="bg-red-100"
        iconColor="text-red-600"
        size="sm"
        actions={
          <>
            <button
              onClick={() => moveSelectedToWishlist()}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
            >
              Move to Wishlist
            </button>
            <button
              onClick={async () => {
                setBulkDeleteConfirm({ show: false });
                await deleteSelected();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors hover:cursor-pointer"
            >
              Remove
            </button>
          </>
        }
      />

      <Modal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, productId: null, productName: '' })}
        title="Remove Item from Cart"
        description={`Are you sure you want to remove ${deleteConfirm.productName} from your cart?`}
        icon={<Trash2 className="w-5 h-5" />}
        iconBgColor="bg-red-100"
        iconColor="text-red-600"
        size="sm"
        actions={
          <>
            <button
              onClick={() => moveToWishlist(deleteConfirm.productId)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors hover:cursor-pointer"
            >
              Move to Wishlist
            </button>
            <button
              onClick={() => handleRemoveItem(deleteConfirm.productId)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors hover:cursor-pointer"
            >
              Remove
            </button>
          </>
        }
      />
    </div>
  );
};

export default Cart;