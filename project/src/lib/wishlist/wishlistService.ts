import { supabase } from '../supabase';
import type { WishlistItem, AddWishlistItem } from './types';

export async function getWishlist(userId: string): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addToWishlist(userId: string, item: AddWishlistItem): Promise<WishlistItem> {
  const { data, error } = await supabase
    .from('wishlist')
    .insert({
      user_id: userId,
      stock_symbol: item.stock_symbol,
      target_price: item.target_price
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromWishlist(userId: string, symbol: string): Promise<void> {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('user_id', userId)
    .eq('stock_symbol', symbol);

  if (error) throw error;
}