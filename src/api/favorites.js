import api from './axios';

// get user's favorites
export const getFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data;
};

// add product to favorites
export const addToFavorites = async (productId) => {
  const response = await api.post('/favorites', { productId });
  return response.data;
};

// remove product from favorites
export const removeFromFavorites = async (productId) => {
  const response = await api.delete(`/favorites/${productId}`);
  return response.data;
};

// check if product is favorited
export const checkFavorite = async (productId) => {
  const response = await api.get(`/favorites/check/${productId}`);
  return response.data;
};

// alias for backwards compatibility
export const isFavorited = checkFavorite;