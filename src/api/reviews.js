import api from './axios';

// get reviews for a product
export const getProductReviews = async (productId, params = {}) => {
  const { page = 1, limit = 20, rating } = params;
  const queryParams = new URLSearchParams({ page, limit });
  if (rating) queryParams.append('rating', rating);

  const response = await api.get(`/reviews/product/${productId}?${queryParams}`);
  return response.data;
};

// create a review
export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

// add seller response to review
export const addSellerResponse = async (reviewId, responseText) => {
  const response = await api.post(`/reviews/${reviewId}/response`, { responseText });
  return response.data;
};

// mark review as helpful
export const markReviewHelpful = async (reviewId) => {
  const response = await api.post(`/reviews/${reviewId}/helpful`);
  return response.data;
};

// update review (edit)
export const updateReview = async (reviewId, reviewData) => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

// delete review
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

// get reviews authored by the current user
export const getMyReviews = async (params = {}) => {
  const response = await api.get('/reviews/my', { params });
  return response.data;
};

// get reviews for a specific user (alias)
export const getUserReviews = async (userId) => {
  const response = await api.get(`/users/${userId}/reviews`);
  return response.data;
};