import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, TrendingUp, TrendingDown, ShoppingCart, DollarSign } from 'lucide-react';
import type { Portfolio } from '../../types';
import type { MarketTick } from '../../types/market';

interface PortfolioTableRowProps {
  holding: Portfolio;
  marketData?: MarketTick;
  onTradeClick: (type: 'BUY' | 'SELL') => void;
}

export function PortfolioTableRow({ holding, marketData, onTradeClick }: PortfolioTableRowProps) {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  
  const currentPrice = marketData?.price || holding.current_price;
  const dayPL = (currentPrice - holding.previous_day_price) * holding.quantity;
  const dayChangePercent = ((currentPrice - holding.previous_day_price) / holding.previous_day_price) * 100;
  const netPL = (currentPrice - holding.average_price) * holding.quantity;
  
  const Icon = dayChangePercent >= 0 ? TrendingUp : TrendingDown;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
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
        <div className="font-medium">₹{currentPrice.toFixed(2)}</div>
        <div className={`text-sm ${dayChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {dayChangePercent >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%
        </div>
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
      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 relative" ref={actionsRef}>
        <button 
          className={`p-2 rounded-full transition-colors duration-150 ${showActions ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
          onClick={() => setShowActions(!showActions)}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        
        {showActions && (
          <div className="absolute right-0 top-full mt-1 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1">
              <button
                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                onClick={() => {
                  onTradeClick('BUY');
                  setShowActions(false);
                }}
              >
                <ShoppingCart className="h-4 w-4 mr-3 text-blue-600" />
                <span>Buy more {holding.stock_symbol}</span>
              </button>
              <button
                className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 transition-colors duration-150"
                onClick={() => {
                  onTradeClick('SELL');
                  setShowActions(false);
                }}
              >
                <DollarSign className="h-4 w-4 mr-3 text-green-600" />
                <span>Sell {holding.stock_symbol}</span>
              </button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}