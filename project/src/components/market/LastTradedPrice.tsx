import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MarketTick } from '../../types/market';

interface LastTradedPriceProps {
  symbol: string;
  data?: MarketTick;
  className?: string;
}

export function LastTradedPrice({ symbol, data, className = '' }: LastTradedPriceProps) {
  if (!data) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-5 w-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const isPositive = data.change >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div className={className}>
      <div className="font-medium">₹{data.price.toFixed(2)}</div>
      <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        <Icon className="h-4 w-4 mr-1" />
        <span>{isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%</span>
      </div>
      <div className="text-xs text-gray-500">
        Vol: {data.volume.toLocaleString()}
      </div>
    </div>
  );
}