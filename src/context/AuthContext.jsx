import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authApi from '../api/auth';
import { logger } from '../utils/logger';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // check if token is expired
        if (decoded.exp > currentTime) {
          // set user from localStorage first for immediate UI
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);

          // then fetch fresh data from backend to ensure data  is up to date
          try {
            const response = await authApi.getCurrentUser();
            const freshUserData = response.data?.user || response.user || response.data || response;
            if (freshUserData) {
              setUser(freshUserData);
              localStorage.setItem('user', JSON.stringify(freshUserData));
            }
          } catch (error) {
            logger.error('Failed to fetch fresh user data:', error);
            // continue with cached data if fetch fails
          }
        } else {
          logout();
        }
      } catch (error) {
        logger.error('Invalid token:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credential) => {
    try {
      const response = await authApi.googleLogin(credential);

      // backend returns: { success: true, data: { user, accessToken }, message }
      // soo we need response.data.user and response.data.accessToken
      const { user: userData, accessToken } = response.data;

      // check if user is from DLSL
      if (!userData.email.endsWith('@dlsl.edu.ph')) {
        throw new Error('Only @dlsl.edu.ph email addresses are allowed');
      }

      const normalizedUser = {
        ...userData,
        profilePicture: userData.profilePicture || userData.picture
      };

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
      setIsAuthenticated(true);
      return response.data;
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      logger.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {

    const normalizedUser = {
      ...userData,
      profilePicture: userData.profilePicture || userData.picture
    };
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
    isSeller: user?.isSeller || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};