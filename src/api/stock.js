import api from './axios';

// validate cart stock availability (server-side)
// calls backend /cart/validate endpoint for real-time stock validation
export const validateCartStock = async (items) => {
  try {
    // transform cart items to backend format
    const requestItems = items.map(item => ({
      productId: item.product._id || item.product,
      quantity: item.quantity
    }));

    const response = await api.post('/cart/validate', { items: requestItems });

    // backend returns: { success: true, data: { valid, message, invalidItems, warnings } }
    return {
      success: true,
      data: response.data.data || response.data
    };
  } catch (error) {
    console.error('stock validation failed:', error);

    // if backend is down or endpoint fails, perform client-side fallback validation
    const invalidItems = [];

    for (const item of items) {
      if (item.product && item.product.stock !== undefined) {
        if (item.quantity > item.product.stock) {
          invalidItems.push({
            productId: item.product._id,
            productName: item.product.name,
            requestedQuantity: item.quantity,
            availableStock: item.product.stock,
            reason: `Only ${item.product.stock} item(s) available`
          });
        }
      }
    }

    return {
      success: true,
      data: {
        valid: invalidItems.length === 0,
        invalidItems,
        message: invalidItems.length > 0
          ? 'Some items have insufficient stock'
          : 'All items are in stock'
      }
    };
  }
};

export default {
  validateCartStock,
};