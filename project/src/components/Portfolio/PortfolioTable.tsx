import React from 'react';
import { MoreVertical } from 'lucide-react';
import type { Portfolio } from '../../types';

interface PortfolioTableProps {
  holdings: Portfolio[];
}

export function PortfolioTable({ holdings }: PortfolioTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instrument</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty.</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg. cost</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">LTP</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cur. val</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">P&L</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net chg.</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Day chg.</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holdings.map((holding) => {
              // Ensure we have valid numbers with defaults
              const quantity = holding.quantity || 0;
              const averagePrice = holding.average_price || 0;
              const currentPrice = holding.current_price || 0;
              const profitLoss = holding.profit_loss || 0;
              
              // Calculate derived values
              const currentValue = quantity * currentPrice;
              const netChange = averagePrice !== 0 
                ? ((currentPrice - averagePrice) / averagePrice) * 100 
                : 0;
              const dayChange = Math.random() * 6 - 3; // Simulated day change

              return (
                <tr key={holding.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {holding.stock_symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {averagePrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {currentPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    {currentValue.toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitLoss.toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {netChange >= 0 ? '+' : ''}{netChange.toFixed(2)}%
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {dayChange >= 0 ? '+' : ''}{dayChange.toFixed(2)}%
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="h-4 w-4" />
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