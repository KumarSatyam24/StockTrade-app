import React from 'react';
import type { Portfolio } from '../../types';

interface PortfolioHeaderProps {
  totalInvestment: number;
  currentValue: number;
  dayProfitLoss: number;
  totalProfitLoss: number;
}

export function PortfolioHeader({ totalInvestment, currentValue, dayProfitLoss, totalProfitLoss }: PortfolioHeaderProps) {
  const dayPLPercentage = (dayProfitLoss / currentValue) * 100;
  const totalPLPercentage = (totalProfitLoss / totalInvestment) * 100;

  return (
    <div className="flex flex-wrap gap-8 mb-6">
      <div>
        <div className="text-sm text-gray-500">Total investment</div>
        <div className="text-xl font-semibold">₹{totalInvestment.toFixed(2)}</div>
      </div>
      <div>
        <div className="text-sm text-gray-500">Current value</div>
        <div className="text-xl font-semibold">₹{currentValue.toFixed(2)}</div>
      </div>
      <div>
        <div className="text-sm text-gray-500">Day's P&L</div>
        <div className={`text-xl font-semibold flex items-center ${dayProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ₹{Math.abs(dayProfitLoss).toFixed(2)}
          <span className="text-sm ml-1">({dayPLPercentage.toFixed(2)}%)</span>
        </div>
      </div>
      <div>
        <div className="text-sm text-gray-500">Total P&L</div>
        <div className={`text-xl font-semibold flex items-center ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ₹{Math.abs(totalProfitLoss).toFixed(2)}
          <span className="text-sm ml-1">({totalPLPercentage.toFixed(2)}%)</span>
        </div>
      </div>
    </div>
  );
}