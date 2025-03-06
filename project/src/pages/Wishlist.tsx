import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import { SearchBar } from '../components/dashboard/SearchBar';
import { WishlistTable } from '../components/wishlist/WishlistTable';
import { useStocks } from '../hooks/useStocks';
import { useMarketData } from '../hooks/useMarketData';
import { Search } from 'lucide-react';

export function Wishlist() {
  const { user } = useAuth();
  const { stocks } = useStocks();
  const { wishlist, loading, error, addItem, removeItem } = useWishlist(user);
  const [addError, setAddError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get market data for wishlist stocks
  const wishlistSymbols = wishlist.map(item => item.stock_symbol);
  const marketData = useMarketData(wishlistSymbols);

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

  // Filter wishlist based on search query
  const filteredWishlist = wishlist.filter(item =>
    item.stock_symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Merge stock data with market data
  const wishlistStocks = stocks
    .filter(stock => filteredWishlist.some(item => item.stock_symbol === stock.symbol))
    .map(stock => ({
      ...stock,
      target_price: wishlist.find(item => item.stock_symbol === stock.symbol)?.target_price || 0,
      current_price: marketData[stock.symbol]?.price || stock.current_price,
      day_change: marketData[stock.symbol]?.change || stock.day_change,
      day_change_percent: marketData[stock.symbol]?.changePercent || stock.day_change_percent,
      volume: marketData[stock.symbol]?.volume || stock.volume
    }));

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Wishlist</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track stocks you're interested in
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="max-w-xl">
        <SearchBar stocks={stocks} onSelect={(stock) => {
          setAddError(null);
          addItem({
            stock_symbol: stock.symbol,
            target_price: stock.current_price
          }).catch(err => {
            setAddError(err instanceof Error ? err.message : 'Failed to add stock');
          });
        }} />
        {addError && (
          <div className="mt-2 text-sm text-red-600">
            {addError}
          </div>
        )}
      </div>

      <WishlistTable 
        stocks={wishlistStocks}
        onRemove={removeItem}
      />
    </div>
  );
}