import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from '../utils/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const [cartLoading, setCartLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCart({ items: [] }); return; }
    try {
      setCartLoading(true);
      const res = await getCart();
      setCart(res.data.cart);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setCartLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, size = 'queen', color = '') => {
    if (!isAuthenticated) { toast.info('Please login to add items to cart'); return false; }
    try {
      const res = await apiAddToCart({ productId, quantity, size, color });
      setCart(res.data.cart);
      toast.success('Added to cart!', { autoClose: 2000 });
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const res = await apiUpdateCartItem(itemId, { quantity });
      setCart(res.data.cart);
    } catch (err) {
      toast.error('Failed to update cart');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await apiRemoveFromCart(itemId);
      setCart(res.data.cart);
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await apiClearCart();
      setCart({ items: [] });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const cartTotal = cart?.items?.reduce((sum, item) => {
    const price = item.product?.discountPrice || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartLoading, cartCount, cartTotal, addToCart, updateCartItem, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
