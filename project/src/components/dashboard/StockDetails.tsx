import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
import type { Stock } from '../../types';

interface StockDetailsProps {
  stock: Stock;
}

export function StockDetails({ stock }: StockDetailsProps) {
  const isPositive = stock.change >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{stock.symbol}</h2>
          <p className="text-gray-500">{stock.name}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">${stock.price.toFixed(2)}</div>
          <div className={`flex items-center justify-end ${colorClass}`}>
            <Icon className="h-5 w-5 mr-1" />
            <span>{stock.changePercent.toFixed(2)}%</span>
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
            ${(stock.price - Math.abs(stock.change)).toFixed(2)} - ${(stock.price + Math.abs(stock.change)).toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <BarChart2 className="h-4 w-4 mr-1" />
            <span className="text-sm">Volume</span>
          </div>
          <div className="font-medium">
            {(Math.random() * 1000000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </div>
        </div>
      </div>

      <div className="h-[200px] bg-gray-50 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-500 mb-2">Price History</div>
        <div className="relative h-[150px]">
          {stock.historicalData?.map((point, index, array) => {
            const max = Math.max(...array.map(d => d.price));
            const min = Math.min(...array.map(d => d.price));
            const range = max - min;
            const height = ((point.price - min) / range) * 100;
            const width = 100 / array.length;
            
            return (
              <div
                key={point.date}
                className={`absolute bottom-0 ${isPositive ? 'bg-green-500' : 'bg-red-500'} opacity-75`}
                style={{
                  left: `${index * width}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}