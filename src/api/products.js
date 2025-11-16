import api from './axios';

// get all products with optional filters
export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

// search products
export const searchProducts = async (query, params = {}) => {
  const response = await api.get('/products/search', {
    params: { q: query, ...params }
  });
  return response.data;
};

// get products by category
export const getProductsByCategory = async (category) => {
  const response = await api.get(`/products/category/${category}`);
  return response.data;
};

// get single product
export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// increment product view count
export const incrementProductView = async (id) => {
  try {
    const response = await api.post(`/products/${id}/view`);
    return response.data;
  } catch (err) {
    console.error('failed to track view:', err);
    return null;
  }
};

// create new product (seller)
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// update product (seller)
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// delete product (seller)
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// get my product listings (seller)
export const getMyListings = async (params = {}) => {
  const response = await api.get('/products/my/listings', { params });
  return response.data;
};

// update product status (active/paused/sold)
export const updateProductStatus = async (id, status) => {
  const response = await api.patch(`/products/${id}/status`, { status });
  return response.data;
};

// get product reviews
export const getProductReviews = async (id) => {
  const response = await api.get(`/products/${id}/reviews`);
  return response.data;
};

// create product review
export const createProductReview = async (id, reviewData) => {
  const response = await api.post(`/products/${id}/reviews`, reviewData);
  return response.data;
};

// get similar products (vector embeddings)
export const getSimilarProducts = async (id, params = {}) => {
  const response = await api.get(`/products/${id}/similar`, { params });
  return response.data;
};

// semantic search (vector embeddings)
export const semanticSearch = async (query, params = {}) => {
  const response = await api.get('/search/semantic', {
    params: { q: query, ...params }
  });
  return response.data;
};

// hybrid search (keyword + vector embeddings)
export const hybridSearch = async (query, params = {}) => {
  const response = await api.get('/search/hybrid', {
    params: { q: query, ...params }
  });
  return response.data;
};