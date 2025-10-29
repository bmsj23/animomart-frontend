import api from './axios';

// create new order
export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

// get user's orders (buyer & seller)
export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

// get single order details
export const getOrder = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// update order status (seller)
export const updateOrderStatus = async (id, status, note = '') => {
  const response = await api.put(`/orders/${id}/status`, { status, note });
  return response.data;
};

// cancel order
export const cancelOrder = async (id, reason) => {
  const response = await api.put(`/orders/${id}/cancel`, { reason });
  return response.data;
};

// get orders as buyer
export const getMyPurchases = async () => {
  const response = await api.get('/orders/purchases');
  return response.data;
};

// get orders as seller
export const getMySales = async () => {
  const response = await api.get('/orders/sales');
  return response.data;
};
