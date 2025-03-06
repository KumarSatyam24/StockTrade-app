import React from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import type { IndianStock } from '../../lib/stocks/types';

interface WishlistTableProps {
  stocks: (IndianStock & { target_price: number })[];
  onRemove: (symbol: string) => Promise<void>;
}

export function WishlistTable({ stocks, onRemove }: WishlistTableProps) {
  if (!stocks.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">Your wishlist is empty. Add stocks to track them.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Target Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Volume</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.map((stock) => {
              const isPositive = stock.day_change >= 0;
              const Icon = isPositive ? TrendingUp : TrendingDown;
              
              return (
                <tr key={stock.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{stock.symbol}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{stock.name}</div>
                    <div className="text-xs text-gray-500">{stock.sector}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{stock.current_price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{stock.target_price.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`flex items-center justify-end text-sm font-medium ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <Icon className="h-4 w-4 mr-1" />
                      {stock.day_change_percent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    {stock.volume?.toLocaleString() || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onRemove(stock.symbol)}
                      className="text-gray-400 hover:text-red-600 transition-colors duration-150"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}