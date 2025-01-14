import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SearchStocks } from '../components/SearchStocks';
import { StockCard } from '../components/StockCard';
import { supabase } from '../lib/supabase';
import type { Stock, WishlistItem } from '../types';

export function Wishlist() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const handleAddToWishlist = async (stock: Stock) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: user.id,
        stock_symbol: stock.symbol,
        target_price: stock.price
      })
      .select()
      .single();

    if (!error && data) {
      setWishlist([...wishlist, data]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Wishlist</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track stocks you're interested in
          </p>
        </div>
      </div>

      <div className="max-w-xl">
        <SearchStocks onSelect={handleAddToWishlist} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((item) => (
          <StockCard
            key={item.id}
            stock={{
              symbol: item.stock_symbol,
              name: "Loading...", // In a real app, fetch stock details
              price: 0,
              change: 0,
              changePercent: 0
            }}
          />
        ))}
      </div>
    </div>
  );
}