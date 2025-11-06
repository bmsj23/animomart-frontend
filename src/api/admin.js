import api from './axios';

// admin: get all users
export const getAllUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

// admin: suspend user
export const suspendUser = async (userId, data) => {
  const response = await api.patch(`/admin/users/${userId}/suspend`, data);
  return response.data;
};

// admin: activate user
export const activateUser = async (userId) => {
  const response = await api.patch(`/admin/users/${userId}/activate`);
  return response.data;
};

// admin: make user admin
export const makeAdmin = async (userId) => {
  const response = await api.patch(`/admin/users/${userId}/make-admin`);
  return response.data;
};

// admin: delete user
export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// admin: get all products
export const getAllProducts = async (params = {}) => {
  const response = await api.get('/admin/products', { params });
  return response.data;
};

// admin: delete product
export const adminDeleteProduct = async (id) => {
  const response = await api.delete(`/admin/products/${id}`);
  return response.data;
};

// admin: get all orders
export const getAllOrders = async (params = {}) => {
  const response = await api.get('/admin/orders', { params });
  return response.data;
};

// admin: override order status
export const adminUpdateOrder = async (id, data) => {
  const response = await api.put(`/orders/${id}/admin`, data);
  return response.data;
};

// admin: get all reports
export const getAllReports = async (params = {}) => {
  const response = await api.get('/admin/reports', { params });
  return response.data;
};

// admin: get single report
export const getReport = async (id) => {
  const response = await api.get(`/admin/reports/${id}`);
  return response.data;
};

// admin: update report status
export const updateReportStatus = async (id, status, adminNotes = '') => {
  const response = await api.put(`/admin/reports/${id}/status`, { status, adminNotes });
  return response.data;
};

// admin: resolve report
export const resolveReport = async (id, resolution) => {
  const response = await api.post(`/admin/reports/resolve/${id}`, { resolution });
  return response.data;
};

// admin: get marketplace statistics
export const getMarketplaceStats = async () => {
  const response = await api.get('/admin/statistics');
  return response.data;
};
