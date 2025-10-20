import api from './axios';

// get user's cart
export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

// add item to cart
export const addToCart = async (productId, quantity = 1) => {
  const response = await api.post('/cart/items', { productId, quantity });
  return response.data;
};

// update cart item quantity
export const updateCartItem = async (productId, quantity) => {
  const response = await api.put(`/cart/items/${productId}`, { quantity });
  return response.data;
};

// remove item from cart
export const removeFromCart = async (productId) => {
  const response = await api.delete(`/cart/items/${productId}`);
  return response.data;
};

// clear entire cart
export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};
