import { createContext, useState, useEffect } from 'react';
import * as wishlistApi from '../api/wishlist';
import { useAuth } from '../hooks/useAuth';

// eslint-disable-next-line react-refresh/only-export-components
export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // fetch wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await wishlistApi.getWishlist();

      // backend returns { data: { products: [...] } }
      const wishlistItems = data.data?.products || data.data || [];

      // filter out null/deleted products
      const validItems = wishlistItems.filter(item => {
        return item && item._id && item.name && item.price !== undefined;
      });

      setWishlist(validItems);
    } catch (error) {
      console.error('error fetching wishlist:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const data = await wishlistApi.addToWishlist(productId);

      // after adding, fetch the updated list
      await fetchWishlist();
      return data;
    } catch (error) {
      console.error('error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const data = await wishlistApi.removeFromWishlist(productId);
      // after removing, fetch the updated list
      await fetchWishlist();
      return data;
    } catch (error) {
      console.error('error removing from wishlist:', error);
      throw error;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist?.some(item => {
      const itemProductId = item._id || item.product?._id || item.product;
      return itemProductId === productId;
    });
  };

  const value = {
    wishlist,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};