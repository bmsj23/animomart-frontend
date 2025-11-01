import api from './axios';

// get user's wishlist
export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

// add product to wishlist
export const addToWishlist = async (productId) => {
  const response = await api.post('/wishlist', { productId });
  return response.data;
};

// remove product from wishlist
export const removeFromWishlist = async (productId) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

// check if product is in wishlist
export const checkWishlist = async (productId) => {
  const response = await api.get(`/wishlist/check/${productId}`);
  return response.data;
};

// alias for backwards compatibility
export const isInWishlist = checkWishlist;