import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { IndianStock } from '../lib/stocks/types';

interface StockCardProps {
  stock: IndianStock;
  onClick?: () => void;
}

export function StockCard({ stock, onClick }: StockCardProps) {
  // Ensure we have valid numbers with defaults
  const currentPrice = stock.current_price || 0;
  const dayChange = stock.day_change || 0;
  const dayChangePercent = stock.day_change_percent || 0;

  const isPositive = dayChange >= 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
    >
      <div className="flex justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-lg font-semibold truncate">{stock.symbol}</h3>
          <p className="text-sm text-gray-600 truncate">{stock.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{stock.sector}</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-lg font-semibold whitespace-nowrap">₹{currentPrice.toFixed(2)}</p>
          <div className={`flex items-center justify-end ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            <span className="text-sm whitespace-nowrap">
              {dayChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {stock.volume && (
        <div className="mt-2 text-xs text-gray-500 truncate">
          Vol: {stock.volume.toLocaleString()}
        </div>
      )}
    </div>
  );
}