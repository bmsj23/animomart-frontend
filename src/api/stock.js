import api from './axios';

export const validateCartStock = async (items) => {
  const response = await api.post('/cart/validate', { items });
  return response.data;
};

export default {
  validateCartStock,
};