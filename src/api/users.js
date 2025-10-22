import api from './axios';

// get own profile
export const getMyProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

// update own profile
export const updateMyProfile = async (userData) => {
  const response = await api.put('/users/me', userData);
  return response.data;
};

// update seller info / become seller
export const updateSellerInfo = async (sellerData) => {
  const response = await api.put('/users/me/seller', sellerData);
  return response.data;
};

// delete own account
export const deleteMyAccount = async () => {
  const response = await api.delete('/users/me');
  return response.data;
};

// get public user profile (seller view)
export const getUserProfile = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// get seller profile
export const getSellerProfile = async (id) => {
  const response = await api.get(`/users/seller/${id}`);
  return response.data;
};

// get user's products
export const getUserProducts = async (id) => {
  const response = await api.get(`/users/${id}/products`);
  return response.data;
};

// get reviews for user (as seller)
export const getUserReviews = async (id) => {
  const response = await api.get(`/users/${id}/reviews`);
  return response.data;
};
