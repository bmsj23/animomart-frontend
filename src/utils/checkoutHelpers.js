// helper function to group cart items by seller
export const groupItemsBySeller = (cartItems) => {
  if (!cartItems || !cartItems.length) return [];

  const sellerGroups = {};

  cartItems.forEach(item => {
    // get seller info
    const sellerData = item.product?.seller;
    const sellerId = sellerData?._id || sellerData || item.seller?._id || item.seller || 'unknown';

    let sellerName = 'Unknown Seller';
    let sellerInfo = null;

    if (typeof sellerData === 'object' && sellerData !== null) {
      sellerInfo = sellerData;
      sellerName = sellerData.name || sellerData.username || 'Unknown Seller';
    } else if (typeof item.seller === 'object' && item.seller !== null) {
      sellerInfo = item.seller;
      sellerName = item.seller.name || item.seller.username || 'Unknown Seller';
    }

    if (!sellerGroups[sellerId]) {
      sellerGroups[sellerId] = {
        seller: sellerInfo,
        sellerName: sellerName,
        sellerId: sellerId,
        items: []
      };
    }
    sellerGroups[sellerId].items.push(item);
  });

  return Object.values(sellerGroups);
};

// calculate subtotal from cart items
export const calculateSubtotal = (cartItems) => {
  if (!cartItems || !cartItems.length) return 0;
  return cartItems.reduce((sum, item) =>
    sum + ((item.product?.price || 0) * (item.quantity || 1)), 0
  );
};

// validate checkout form
export const validateCheckoutForm = (form, deliveryMethod, selectedCartItems) => {
  if (!form.name || !form.email || !form.phone) {
    return { valid: false, message: 'Please fill in all required fields' };
  }

  if (deliveryMethod === 'shipping' && (!form.address || !form.city || !form.postal)) {
    return { valid: false, message: 'Please provide complete shipping address' };
  }

  if (deliveryMethod === 'meetup' && !form.meetupLocation) {
    return { valid: false, message: 'Please select a meetup location' };
  }

  if (!selectedCartItems || selectedCartItems.length === 0) {
    return { valid: false, message: 'No items selected for checkout' };
  }

  return { valid: true };
};

// order data for API submission
export const prepareOrderData = (form, selectedCartItems) => {
  // map frontend payment methods to backend accepted values
  const paymentMethodMap = {
    'cash_on_delivery': 'cash_on_delivery',
    'cash_on_meetup': 'cash_on_meetup',
    'mock_gcash': 'gcash',
    'mock_paymaya': 'maya'
  };

  const mappedPaymentMethod = paymentMethodMap[form.paymentMethod] || form.paymentMethod;

  const orderData = {
    items: selectedCartItems.map(item => ({
      product: item.product._id,
      quantity: item.quantity
    })),
    deliveryMethod: form.deliveryMethod,
    paymentMethod: mappedPaymentMethod
  };

  // add delivery address if delivery method is shipping
  if (form.deliveryMethod === 'shipping') {
    orderData.deliveryAddress = {
      fullAddress: `${form.address}, ${form.city}, ${form.postal}`,
      contactNumber: form.phone,
      specialInstructions: form.specialInstructions || ''
    };
  }

  return orderData;
};