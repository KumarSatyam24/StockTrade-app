import React from 'react';
import { MoreVertical, TrendingUp, TrendingDown } from 'lucide-react';
import { LastTradedPrice } from '../market/LastTradedPrice';
import type { Portfolio } from '../../types';
import type { MarketTick } from '../../types/market';

interface PortfolioTableRowProps {
  holding: Portfolio;
  marketData?: MarketTick;
}

export function PortfolioTableRow({ holding, marketData }: PortfolioTableRowProps) {
  const currentPrice = marketData?.price || holding.current_price;
  const dayPL = (currentPrice - holding.previous_day_price) * holding.quantity;
  const dayChangePercent = ((currentPrice - holding.previous_day_price) / holding.previous_day_price) * 100;
  const netPL = (currentPrice - holding.average_price) * holding.quantity;
  
  const Icon = dayChangePercent >= 0 ? TrendingUp : TrendingDown;
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">{holding.stock_symbol}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
        {holding.quantity}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
        ₹{holding.average_price.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <LastTradedPrice 
          symbol={holding.stock_symbol}
          data={marketData}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <div className={`font-medium ${dayPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ₹{Math.abs(dayPL).toFixed(2)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <div className={`flex items-center justify-end font-medium ${dayChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <Icon className="h-4 w-4 mr-1" />
          {dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <div className={`font-medium ${netPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ₹{Math.abs(netPL).toFixed(2)}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
        <button className="p-1 hover:bg-gray-100 rounded">
          <MoreVertical className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}