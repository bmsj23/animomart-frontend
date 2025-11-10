import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useCart } from './useCart';
import { useToast } from './useToast';
import { createOrder } from '../api/orders';
import {
  groupItemsBySeller,
  calculateSubtotal,
  validateCheckoutForm,
  prepareOrderData
} from '../utils/checkoutHelpers';
import { logger } from '../utils/logger';

const useCheckout = () => {
  const { user } = useAuth();
  const { cart, loading: cartLoading, removeItem } = useCart();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal: '',
    specialInstructions: '',
    deliveryMethod: 'shipping',
    meetupLocation: '',
    paymentMethod: 'cash_on_delivery'
  });

  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  // load user info
  useEffect(() => {
    if (user) {
      const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      setForm((f) => ({
        ...f,
        name: name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // load selected items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('checkout-selected-items');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        setSelectedItemIds(new Set(ids));
      } catch (e) {
        logger.error('Failed to parse selected items:', e);
      }
    }
  }, []);

  // redirect if no selected items
  useEffect(() => {
    if (isProcessing) return;
    if (!cartLoading && cart?.items && selectedItemIds.size > 0) {
      const hasSelectedItems = cart.items.some(item => selectedItemIds.has(item.product._id));
      if (!hasSelectedItems) {
        navigate('/cart');
      }
    }
  }, [cart, cartLoading, selectedItemIds, navigate, isProcessing]);

  // filter to selected items
  const selectedCartItems = cart?.items?.filter(item =>
    selectedItemIds.has(item.product._id)
  ) || [];

  // calculations
  const sellerGroups = groupItemsBySeller(selectedCartItems);
  const subtotal = calculateSubtotal(selectedCartItems);
  const shippingFee = form.deliveryMethod === 'shipping' ? 50 : 0;
  const total = subtotal + shippingFee;

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmitOrder = async () => {
    // validation
    const validation = validateCheckoutForm(form, form.deliveryMethod, selectedCartItems);
    if (!validation.valid) {
      showError(validation.message);
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = prepareOrderData(form, selectedCartItems);
      const result = await createOrder(orderData);

      // cleanup localStorage and state BEFORE removing items
      // this prevents the redirect effect from triggering
      localStorage.removeItem('checkout-selected-items');
      localStorage.removeItem('cart-selected-items');
      setSelectedItemIds(new Set()); // clear selected items state

      // remove only the selected items from cart!!!!
      for (const item of selectedCartItems) {
        await removeItem(item.product._id);
      }

      success('Order placed successfully!');

      // handle different response structures from backend
      const orderId = result?.order?._id || result?.data?._id || result?._id;

      if (orderId) {
        navigate(`/checkout/success/${orderId}`);
      } else {
        logger.error('No orderId found in result:', result);
        showError('Order created but unable to retrieve order details');
        navigate('/profile?tab=purchases');
      }

    } catch (err) {
      logger.error('Order error:', err);
      showError(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    form,
    setForm,
    handleChange,
    selectedCartItems,
    sellerGroups,
    subtotal,
    shippingFee,
    total,
    isProcessing,
    handleSubmitOrder,
    cartLoading
  };
};

export default useCheckout;