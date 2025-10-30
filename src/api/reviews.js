import api from './axios';

// get reviews authored by the current user
export const getMyReviews = async () => {
  const response = await api.get('/reviews/my');
  return response.data;
};

// get reviews for a specific user (alias)
export const getUserReviews = async (userId) => {
  const response = await api.get(`/users/${userId}/reviews`);
  return response.data;
};
