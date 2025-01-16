import { useState, useEffect } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../lib/wishlist/wishlistService';
import type { User } from '../types';
import type { WishlistItem, AddWishlistItem } from '../lib/wishlist/types';

export function useWishlist(user: User | null) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadWishlist() {
      try {
        const data = await getWishlist(user.id);
        setWishlist(data);
      } catch (err) {
        console.error('Error loading wishlist:', err);
        setError('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    }

    loadWishlist();
  }, [user]);

  const addItem = async (item: AddWishlistItem) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Check if stock already exists in wishlist
      const exists = wishlist.some(w => w.stock_symbol === item.stock_symbol);
      if (exists) {
        throw new Error('Stock already in wishlist');
      }

      const newItem = await addToWishlist(user.id, item);
      setWishlist(prev => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to wishlist';
      throw new Error(message);
    }
  };

  const removeItem = async (symbol: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      await removeFromWishlist(user.id, symbol);
      setWishlist(prev => prev.filter(item => item.stock_symbol !== symbol));
    } catch (err) {
      throw new Error('Failed to remove from wishlist');
    }
  };

  return {
    wishlist,
    loading,
    error,
    addItem,
    removeItem
  };
}