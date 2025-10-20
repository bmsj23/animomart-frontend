import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as authApi from '../api/auth';

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

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    // development bypass - auto-login for testing
    if (import.meta.env.DEV && !token) {
      const mockUser = {
        _id: 'dev-user-123',
        email: 'testuser@dlsl.edu.ph',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        profilePicture: '',
      };
      setUser(mockUser);
      setIsAuthenticated(true);
      setLoading(false);
      console.log('Development mode: Auto-authenticated as Test User');
      return;
    }

    if (token && userData) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // check if token is expired
        if (decoded.exp > currentTime) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Invalid token:', error);
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credential) => {
    try {
      const data = await authApi.googleLogin(credential);

      // check if email is from DLSL domain
      const decoded = jwtDecode(credential);
      if (!decoded.email.endsWith('@dlsl.edu.ph')) {
        throw new Error('Only @dlsl.edu.ph email addresses are allowed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
