import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Stock } from '../../types';

interface MarketOverviewProps {
  stocks: Stock[];
}

export function MarketOverview({ stocks }: MarketOverviewProps) {
  const totalGainers = stocks.filter(s => s.change > 0).length;
  const totalLosers = stocks.filter(s => s.change < 0).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Market Gainers</h3>
        <div className="mt-1 flex items-center">
          <ArrowUpRight className="h-5 w-5 text-green-500 mr-1" />
          <p className="text-2xl font-semibold text-green-600">{totalGainers}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Market Losers</h3>
        <div className="mt-1 flex items-center">
          <ArrowDownRight className="h-5 w-5 text-red-500 mr-1" />
          <p className="text-2xl font-semibold text-red-600">{totalLosers}</p>
        </div>
      </div>
    </div>
  );
}