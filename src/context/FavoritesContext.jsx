import { createContext, useState, useEffect } from 'react';
import * as favoritesApi from '../api/favorites';
import { useAuth } from '../hooks/useAuth';

// eslint-disable-next-line react-refresh/only-export-components
export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // fetch favorites when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoritesApi.getFavorites();

      // backend returns { data: { products: [...] } }
      const favoritesList = data.data?.products || data.data || [];

      setFavorites(favoritesList);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (productId) => {
    try {
      const data = await favoritesApi.addToFavorites(productId);

      // after adding, fetch the updated list
      await fetchFavorites();
      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  };

  const removeFromFavorites = async (productId) => {
    try {
      const data = await favoritesApi.removeFromFavorites(productId);
      // After removing, fetch the updated list
      await fetchFavorites();
      return data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  };

  const isFavorited = (productId) => {
    return favorites?.some(fav => {
      const favProductId = fav._id || fav.product?._id || fav.product;
      return favProductId === productId;
    });
  };

  const value = {
    favorites,
    loading,
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorited,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};