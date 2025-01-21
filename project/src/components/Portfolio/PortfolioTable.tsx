import React from 'react';
import { PortfolioTableRow } from './PortfolioTableRow';
import { useMarketData } from '../../hooks/useMarketData';
import type { Portfolio } from '../../types';

interface PortfolioTableProps {
  holdings: Portfolio[];
}

export function PortfolioTable({ holdings }: PortfolioTableProps) {
  const symbols = holdings.map(h => h.stock_symbol);
  const marketData = useMarketData(symbols);

  if (!holdings.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No stocks in portfolio
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Avg</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">LTP</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Day's P/L</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Day %</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net P/L</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holdings.map((holding) => (
              <PortfolioTableRow
                key={holding.id}
                holding={holding}
                marketData={marketData[holding.stock_symbol]}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}