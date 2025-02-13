import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
import type { IndianStock } from '../../lib/stocks/types';

interface StockDetailsProps {
  stock: IndianStock;
}

export function StockDetails({ stock }: StockDetailsProps) {
  // Ensure we have valid numbers with defaults
  const currentPrice = stock.current_price || 0;
  const previousClose = stock.previous_close || 0;
  const dayChange = stock.day_change || 0;
  const dayChangePercent = stock.day_change_percent || 0;
  const volume = stock.volume || 0;
  const marketCap = stock.market_cap || 0;
  const peRatio = stock.pe_ratio || 0;

  const isPositive = dayChange >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

  // Calculate day's range
  const lowPrice = previousClose - Math.abs(dayChange);
  const highPrice = previousClose + Math.abs(dayChange);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{stock.symbol}</h2>
          <p className="text-gray-500">{stock.name}</p>
          <p className="text-sm text-gray-400 mt-1">{stock.sector}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">₹{currentPrice.toFixed(2)}</div>
          <div className={`flex items-center justify-end ${colorClass}`}>
            <Icon className="h-5 w-5 mr-1" />
            <span>{dayChangePercent.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <DollarSign className="h-4 w-4 mr-1" />
            <span className="text-sm">Day Range</span>
          </div>
          <div className="font-medium">
            ₹{lowPrice.toFixed(2)} - ₹{highPrice.toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <BarChart2 className="h-4 w-4 mr-1" />
            <span className="text-sm">Volume</span>
          </div>
          <div className="font-medium">
            {volume.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Market Cap</div>
            <div className="font-medium">₹{(marketCap / 10000000).toFixed(2)} Cr</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">P/E Ratio</div>
            <div className="font-medium">{peRatio.toFixed(2)}</div>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-2">Price Change</div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ 
                width: `${Math.min(Math.abs(dayChangePercent), 100)}%`,
                transition: 'width 0.3s ease-in-out' 
              }}
            />
          </div>
          <div className="mt-1 text-sm text-right">
            <span className={colorClass}>
              ₹{Math.abs(dayChange).toFixed(2)} ({Math.abs(dayChangePercent).toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}