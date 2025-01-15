import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, WishlistItem } from '../types';

export function useWishlist(user: User | null) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadWishlist() {
      try {
        const { data, error: fetchError } = await supabase
          .from('wishlist')
          .select('*')
          .eq('user_id', user.id);

        if (fetchError) throw fetchError;
        setWishlist(data || []);
      } catch (err) {
        console.error('Error loading wishlist:', err);
        setError('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    }

    loadWishlist();
  }, [user]);

  const addToWishlist = async (symbol: string, targetPrice: number) => {
    if (!user) return;

    try {
      // Check if stock already exists in wishlist
      const exists = wishlist.some(item => item.stock_symbol === symbol);
      if (exists) {
        throw new Error('Stock already in wishlist');
      }

      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          stock_symbol: symbol,
          target_price: targetPrice
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setWishlist(prev => [...prev, data]);
      }
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to wishlist';
      throw new Error(message);
    }
  };

  const removeFromWishlist = async (symbol: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('stock_symbol', symbol);

      if (error) throw error;
      setWishlist(prev => prev.filter(item => item.stock_symbol !== symbol));
    } catch (err) {
      throw new Error('Failed to remove from wishlist');
    }
  };

  return {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist
  };
}