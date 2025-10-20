import { createContext, useState, useEffect } from 'react';
import * as cartApi from '../api/cart';
import { useAuth } from '../hooks/useAuth';

// eslint-disable-next-line react-refresh/only-export-components
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);
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
      const count = cart.items.reduce((total, item) => total + item.quantity, 0);
      setItemCount(count);
    } else {
      setItemCount(0);
    }
  }, [cart]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId, quantity = 1) => {
    try {
      const data = await cartApi.addToCart(productId, quantity);
      setCart(data);
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const updateItem = async (productId, quantity) => {
    try {
      const data = await cartApi.updateCartItem(productId, quantity);
      setCart(data);
      return data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  const removeItem = async (productId) => {
    try {
      const data = await cartApi.removeFromCart(productId);
      setCart(data);
      return data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCartItems = async () => {
    try {
      await cartApi.clearCart();
      setCart(null);
      setItemCount(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const value = {
    cart,
    loading,
    itemCount,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart: clearCartItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
