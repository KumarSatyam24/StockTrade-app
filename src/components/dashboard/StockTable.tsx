import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { IndianStock } from '../../lib/stocks/types';

interface StockTableProps {
  stocks: IndianStock[];
  onStockClick: (stock: IndianStock) => void;
}

export function StockTable({ stocks, onStockClick }: StockTableProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.map((stock) => {
              // Ensure we have valid numbers with defaults
              const currentPrice = stock.current_price || 0;
              const dayChange = stock.day_change || 0;
              const dayChangePercent = stock.day_change_percent || 0;
              const volume = stock.volume || 0;

              return (
                <tr 
                  key={stock.symbol}
                  onClick={() => onStockClick(stock)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stock.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ₹{currentPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className={`flex items-center justify-end ${dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {dayChange >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {dayChangePercent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {volume.toLocaleString()}
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