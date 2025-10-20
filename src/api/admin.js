import api from './axios';

// admin: get all users
export const getAllUsers = async (params = {}) => {
  const response = await api.get('/users', { params });
  return response.data;
};

// admin: suspend user
export const suspendUser = async (id, reason) => {
  const response = await api.put(`/users/${id}/suspend`, { reason });
  return response.data;
};

// admin: activate user
export const activateUser = async (id) => {
  const response = await api.put(`/users/${id}/activate`);
  return response.data;
};

// admin: delete user
export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// admin: get all products
export const getAllProducts = async (params = {}) => {
  const response = await api.get('/products/admin/all', { params });
  return response.data;
};

// admin: delete product
export const adminDeleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}/admin`);
  return response.data;
};

// admin: get all orders
export const getAllOrders = async (params = {}) => {
  const response = await api.get('/orders/admin/all', { params });
  return response.data;
};

// admin: override order status
export const adminUpdateOrder = async (id, data) => {
  const response = await api.put(`/orders/${id}/admin`, data);
  return response.data;
};

// admin: get all reports
export const getAllReports = async (params = {}) => {
  const response = await api.get('/reports', { params });
  return response.data;
};

// admin: get single report
export const getReport = async (id) => {
  const response = await api.get(`/reports/${id}`);
  return response.data;
};

// admin: update report status
export const updateReportStatus = async (id, status, adminNotes = '') => {
  const response = await api.put(`/reports/${id}/status`, { status, adminNotes });
  return response.data;
};

// admin: resolve report
export const resolveReport = async (id, resolution) => {
  const response = await api.post(`/reports/${id}/resolve`, { resolution });
  return response.data;
};

// admin: get marketplace statistics
export const getMarketplaceStats = async () => {
  const response = await api.get('/admin/statistics');
  return response.data;
};
