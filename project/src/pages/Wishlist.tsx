import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import { SearchStocks } from '../components/SearchStocks';
import { StockCard } from '../components/StockCard';
import { Trash2 } from 'lucide-react';
import { useStocks } from '../hooks/useStocks';
import type { Stock } from '../types';

export function Wishlist() {
  const { user } = useAuth();
  const { stocks } = useStocks();
  const { wishlist, loading, error, addToWishlist, removeFromWishlist } = useWishlist(user);
  const [addError, setAddError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading wishlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  const handleAddToWishlist = async (stock: Stock) => {
    try {
      setAddError(null);
      await addToWishlist(stock.symbol, stock.price);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add stock');
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
        <SearchStocks stocks={stocks} onSelect={handleAddToWishlist} />
        {addError && (
          <div className="mt-2 text-sm text-red-600">
            {addError}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wishlist.map((item) => (
          <div key={item.id} className="relative">
            <StockCard
              stock={{
                symbol: item.stock_symbol,
                name: "Loading...",
                price: item.target_price,
                change: 0,
                changePercent: 0
              }}
            />
            <button
              onClick={() => removeFromWishlist(item.stock_symbol)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}