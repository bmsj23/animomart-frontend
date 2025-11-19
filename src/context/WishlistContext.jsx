import { createContext, useState, useEffect } from 'react';
import * as wishlistApi from '../api/wishlist';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { logger } from '../utils/logger';

// eslint-disable-next-line react-refresh/only-export-components
export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  const MAX_WISHLIST_ITEMS = 20;

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
      logger.error('error fetching wishlist:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  // Optimistic add: if productObj is provided we insert it locally immediately
  // and attempt the API call in the background. If the API fails we revert.
  const addToWishlist = async (productId, productObj = null) => {
    // check if already in wishlist first
    const alreadyExists = wishlist.some(
      (item) => (item._id || item.product?._id || item.product) === productId
    );

    if (alreadyExists) {
      showSuccess('This item is already in your wishlist');
      return { alreadyInWishlist: true };
    }

    if (wishlist.length >= MAX_WISHLIST_ITEMS) {
      showError('Your wishlist is full. Maximum of 20 items reached.');
      return { wishlistFull: true };
    }

    // If a product object is provided, optimistically add it to UI
    if (productObj) {
      setWishlist((prev) => [productObj, ...prev]);

      try {
        const response = await wishlistApi.addToWishlist(productId);
        return response;
      } catch (error) {
        // check if error is "already in wishlist"
        const errorMessage = error.response?.data?.message || error.message || '';
        if (errorMessage.toLowerCase().includes('already in wishlist')) {
          showSuccess('This item is already in your wishlist');
          // don't revert - item is actually in wishlist
          return { alreadyInWishlist: true };
        }

        if (errorMessage.toLowerCase().includes('wishlist is full') ||
            errorMessage.toLowerCase().includes('maximum') ||
            errorMessage.toLowerCase().includes('limit reached')) {
          showError('Your wishlist is full. Maximum of 20 items reached.');
          setWishlist((prev) => prev.filter((i) => (i._id || i.product?._id || i.product) !== productId));
          return { wishlistFull: true };
        }

        // revert optimistic add for other errors
        setWishlist((prev) => prev.filter((i) => (i._id || i.product?._id || i.product) !== productId));
        logger.error('error adding to wishlist:', error);
        throw error;
      }
    }

    // No productObj provided: call API and append returned product if available
    try {
      const response = await wishlistApi.addToWishlist(productId);
      const added = response?.product || response?.data || response;
      if (added && (added._id || added.product)) {
        setWishlist((prev) => {
          const exists = prev.some(
            (item) => (item._id || item.product?._id || item.product) === (added._id || productId)
          );
          if (exists) return prev;
          return [added, ...prev];
        });
      }
      return response;
    } catch (error) {
      // check if error is "already in wishlist"
      const errorMessage = error.response?.data?.message || error.message || '';
      if (errorMessage.toLowerCase().includes('already in wishlist')) {
        showSuccess('This item is already in your wishlist');
        return { alreadyInWishlist: true };
      }

      if (errorMessage.toLowerCase().includes('wishlist is full') ||
          errorMessage.toLowerCase().includes('maximum') ||
          errorMessage.toLowerCase().includes('limit reached')) {
        showError('Your wishlist is full. Maximum of 20 items reached.');
        return { wishlistFull: true };
      }

      logger.error('error adding to wishlist:', error);
      throw error;
    }
  };

  // Optimistic remove: update UI immediately and revert if API fails
  const removeFromWishlist = async (productId) => {
    // store previous state for rollback
    let previous = [];
    setWishlist((prev) => {
      previous = prev;
      return prev.filter((item) => (item._id || item.product?._id || item.product) !== productId);
    });

    try {
      const data = await wishlistApi.removeFromWishlist(productId);
      return data;
    } catch (error) {
      logger.error('error removing from wishlist:', error);
      // rollback
      setWishlist(previous);
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