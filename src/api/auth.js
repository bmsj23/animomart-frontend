import api from './axios';

// google oauth login
export const googleLogin = async (credential) => {
  const response = await api.post('/auth/google', { credential });
  return response.data;
};

// verify google token
export const verifyGoogleToken = async (token) => {
  const response = await api.post('/auth/google/verify', { token });
  return response.data;
};

// get current user profile
export const getCurrentUser = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

// logout
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};
