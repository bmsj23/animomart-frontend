import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { useCart } from './useCart';
import { useToast } from './useToast';
import { createOrder } from '../api/orders';
import { getCartGrouped } from '../api/cart';
import { validateCartStock } from '../api/stock';
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
  const location = useLocation();

  // check for direct checkout from product detail
  const directCheckout = location.state?.directCheckout;
  const directProduct = location.state?.product;
  const directQuantity = location.state?.quantity || 1;

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
  const [groupedCartData, setGroupedCartData] = useState(null);

  // fetch grouped cart data from backend when not in direct checkout mode
  useEffect(() => {
    const fetchGroupedCart = async () => {
      if (directCheckout || !selectedItemIds.size) return;

      try {
        const data = await getCartGrouped();
        logger.log('grouped cart data from backend:', data);
        setGroupedCartData(data);
      } catch (err) {
        logger.error('failed to fetch grouped cart:', err);

        if (err.response?.status === 400 && err.response?.data?.message?.includes('invalid items')) {
          showError('Your cart contains invalid items. Please remove them before checking out.');
          setTimeout(() => {
            navigate('/cart');
          }, 1500);
        }
      }
    };

    fetchGroupedCart();
  }, [directCheckout, selectedItemIds.size, navigate, showError]);

  // load user info
  useEffect(() => {
    if (user) {
      const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
      setForm((f) => ({
        ...f,
        name: name || '',
        email: user.email || '',
        phone: user.contactNumber || user.phone || ''
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

    // skip redirect if direct checkout
    if (directCheckout && directProduct) return;

    if (!cartLoading && cart?.items && selectedItemIds.size > 0) {
      const hasSelectedItems = cart.items.some(item => selectedItemIds.has(item.product._id));
      if (!hasSelectedItems) {
        navigate('/cart');
      }
    }
  }, [cart, cartLoading, selectedItemIds, navigate, isProcessing, directCheckout, directProduct]);

  // filter to selected items OR use direct checkout item
  const selectedCartItems = directCheckout && directProduct
    ? [{
        product: directProduct,
        quantity: directQuantity,
        _id: directProduct._id
      }]
    : (cart?.items?.filter(item => selectedItemIds.has(item.product._id)) || []);

  // use backend grouped data when available, otherwise use frontend grouping for direct checkout
  let sellerGroups;
  let subtotal;

  if (directCheckout) {
    // direct checkout from product detail (the modal when user adds item to cart) use frontend grouping
    sellerGroups = groupItemsBySeller(selectedCartItems);
    subtotal = calculateSubtotal(selectedCartItems);
  } else if (groupedCartData?.sellers) {
    // cart checkout (use backend grouped data but ensure na we have full product info)
    // merge with selectedCartItems to get complete product data including shippingAvailable
    const productMap = new Map();
    selectedCartItems.forEach(item => {
      productMap.set(item.product._id, item.product);
    });

    sellerGroups = groupedCartData.sellers
      .map(group => ({
        ...group,
        items: group.items
          .filter(item => selectedItemIds.has(item.product?._id || item._id))
          .map(item => {
            const fullProduct = productMap.get(item.product?._id || item._id);
            return {
              ...item,
              product: fullProduct || item.product
            };
          })
      }))
      .filter(group => group.items.length > 0);

    subtotal = sellerGroups.reduce((total, group) =>
      total + group.items.reduce((sum, item) =>
        sum + (item.price * item.quantity), 0
      ), 0
    );
  } else {
    sellerGroups = groupItemsBySeller(selectedCartItems);
    subtotal = calculateSubtotal(selectedCartItems);
  }

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
      const stockValidation = await validateCartStock(selectedCartItems);

      if (!stockValidation.success || !stockValidation.data.valid) {

        const outOfStock = stockValidation.data?.invalidItems || [];
        if (outOfStock.length > 0) {
          const messages = outOfStock.map(item =>
            item.reason
              ? `${item.productName}: ${item.reason}`
              : `${item.productName}: only ${item.availableStock} available (you have ${item.requestedQuantity} in cart)`
          );
          showError(`Some items are out of stock:\n${messages.join('\n')}`);
          setIsProcessing(false);
          return;
        }
        showError(stockValidation.data?.message || 'Failed to validate stock availability');
        setIsProcessing(false);
        return;
      }

      if (stockValidation.data?.warnings && stockValidation.data.warnings.length > 0) {
        const warningMessages = stockValidation.data.warnings.map(w => w.message).join('\n');
        logger.log('Low stock warnings:', warningMessages);
      }

      const orderData = prepareOrderData(form, selectedCartItems);
      logger.log('creating order with data:', orderData);

      const result = await createOrder(orderData);
      logger.log('order creation result:', result);

      // cleanup localStorage and state BEFORE removing items
      // this prevents the redirect effect from triggering
      localStorage.removeItem('checkout-selected-items');
      localStorage.removeItem('cart-selected-items');
      setSelectedItemIds(new Set()); // clear selected items state

      // remove items from cart, skip if direct checkout (item already in cart with different quantity brochaco)
      if (!directCheckout) {
        // remove only the selected items from cart!!!!
        for (const item of selectedCartItems) {
          try {
            await removeItem(item.product._id);
          } catch (removeErr) {
            logger.error('failed to remove item from cart:', item.product._id, removeErr);
          }
        }
      }

      success('Order placed successfully!');

      // handle different response structures from backend
      const orderId = result?.order?._id || result?.data?._id || result?._id;
      logger.log('extracted order ID:', orderId);

      if (orderId) {
        navigate(`/checkout/success/${orderId}`);
      } else {
        logger.error('No orderId found in result:', result);
        // still navigate to profile since order was created
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