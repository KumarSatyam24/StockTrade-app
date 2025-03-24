import React from 'react';
import type { IndianStock } from '../../lib/stocks/types';

interface StockOverviewCardProps {
  stock: IndianStock;
  type: 'gainer' | 'loser';
}

export function StockOverviewCard({ stock, type }: StockOverviewCardProps) {
  const isGainer = type === 'gainer';
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{stock.symbol}</div>
        <div className="text-sm text-gray-500">{stock.name}</div>
      </div>
      <div className="text-right">
        <div className="font-medium">₹{stock.current_price.toFixed(2)}</div>
        <div className={`text-sm ${isGainer ? 'text-green-600' : 'text-red-600'}`}>
          {isGainer && '+'}
          {stock.day_change_percent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}