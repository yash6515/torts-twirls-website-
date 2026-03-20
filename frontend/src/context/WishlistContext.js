import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlist, toggleWishlist as apiToggleWishlist } from '../utils/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) { setWishlist([]); return; }
    try {
      const res = await getWishlist();
      setWishlist(res.data.wishlist);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) { toast.info('Please login to save items'); return; }
    try {
      const res = await apiToggleWishlist(productId);
      setWishlist(res.data.wishlist);
      const isNowInWishlist = res.data.wishlist.some(item => item._id === productId);
      toast.success(isNowInWishlist ? 'Added to wishlist' : 'Removed from wishlist', { autoClose: 1500 });
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  const isInWishlist = (productId) => wishlist.some(item => item._id === productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
