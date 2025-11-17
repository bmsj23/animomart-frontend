import { createContext, useState, useEffect } from 'react';
import * as cartApi from '../api/cart';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../utils/logger';

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [invalidItems, setInvalidItems] = useState([]);
  const { isAuthenticated } = useAuth();

  // fetch cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
      setItemCount(0);
    }
  }, [isAuthenticated]);

  // update item count whenever cart changes
  useEffect(() => {
    if (cart?.items) {
      const count = cart.items.length;
      setItemCount(count);
    } else {
      setItemCount(0);
    }
  }, [cart]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart();

      // filter out items with null/deleted products
      if (data?.items) {
        const validItems = [];
        const invalidItemsList = [];

        data.items.forEach(item => {
          const isValid = item && item.product && item.product._id && item.product.name && item.product.price !== undefined;
          if (isValid) {
            validItems.push(item);
          } else {
            invalidItemsList.push({
              _id: item._id,
              productId: item.product?._id || 'unknown',
              name: item.product?.name || 'unknown product',
              reason: !item.product ? 'product deleted' : 'missing product data'
            });
          }
        });

        setCart({
          ...data,
          items: validItems
        });
        setInvalidItems(invalidItemsList);
      } else {
        setCart(data);
        setInvalidItems([]);
      }
    } catch (error) {
      logger.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId, quantity = 1) => {
    try {
      const data = await cartApi.addToCart({ productId, quantity });

      // filter out items with null/deleted products
      if (data?.items) {
        const validItems = data.items.filter(item => {
          return item && item.product && item.product._id && item.product.name && item.product.price !== undefined;
        });

        setCart({
          ...data,
          items: validItems
        });
      } else {
        setCart(data);
      }

      return data;
    } catch (error) {
      logger.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateItem = async (productId, quantity, skipStateUpdate = false) => {
    try {
      const data = await cartApi.updateCartItem(productId, quantity);
      if (!skipStateUpdate) {
        // filter out items with null/deleted products
        if (data?.items) {
          const validItems = data.items.filter(item => {
            return item && item.product && item.product._id && item.product.name && item.product.price !== undefined;
          });

          setCart({
            ...data,
            items: validItems
          });
        } else {
          setCart(data);
        }
      }
      return data;
    } catch (error) {
      logger.error('Error updating cart item:', error);
      throw error;
    }
  };

  const removeItem = async (productId) => {
    try {
      const data = await cartApi.removeFromCart(productId);

      // filter out items with null/deleted products
      if (data?.items) {
        const validItems = data.items.filter(item => {
          return item && item.product && item.product._id && item.product.name && item.product.price !== undefined;
        });

        setCart({
          ...data,
          items: validItems
        });
      } else {
        setCart(data);
      }

      return data;
    } catch (error) {
      logger.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCartItems = async () => {
    try {
      await cartApi.clearCart();
      setCart(null);
      setItemCount(0);
    } catch (error) {
      logger.error('Error clearing cart:', error);
      throw error;
    }
  };

  const value = {
    cart,
    setCart,
    loading,
    itemCount,
    invalidItems,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart: clearCartItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};