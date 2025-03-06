import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StockOverviewCard } from './StockOverviewCard';
import type { IndianStock } from '../../lib/stocks/types';

interface MarketOverviewProps {
  stocks: IndianStock[];
}

export function MarketOverview({ stocks }: MarketOverviewProps) {
  const sortedStocks = [...stocks].sort((a, b) => b.day_change_percent - a.day_change_percent);
  const topGainers = sortedStocks.filter(s => s.day_change > 0).slice(0, 3);
  const topLosers = sortedStocks.filter(s => s.day_change < 0).reverse().slice(0, 3);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <ArrowUpRight className="h-5 w-5 text-green-500 mr-2" />
          <h3 className="text-lg font-medium">Top Gainers</h3>
        </div>
        <div className="space-y-3">
          {topGainers.map(stock => (
            <StockOverviewCard key={stock.symbol} stock={stock} type="gainer" />
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <ArrowDownRight className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="text-lg font-medium">Top Losers</h3>
        </div>
        <div className="space-y-3">
          {topLosers.map(stock => (
            <StockOverviewCard key={stock.symbol} stock={stock} type="loser" />
          ))}
        </div>
      </div>
    </div>
  );
}