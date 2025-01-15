import React from 'react';
import type { Portfolio } from '../../types';

interface PortfolioSummaryProps {
  portfolio: Portfolio[];
}

export function PortfolioSummary({ portfolio }: PortfolioSummaryProps) {
  const totalValue = portfolio.reduce((sum, holding) => 
    sum + (holding.quantity * holding.current_price), 0
  );

  const totalProfitLoss = portfolio.reduce((sum, holding) => 
    sum + holding.profit_loss, 0
  );

  const profitLossPercentage = totalValue !== 0 
    ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 
    : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
        <p className="mt-1 text-2xl font-semibold">${totalValue.toFixed(2)}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total P/L</h3>
        <p className={`mt-1 text-2xl font-semibold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          ${totalProfitLoss.toFixed(2)} ({profitLossPercentage.toFixed(2)}%)
        </p>
      </div>
    </div>
  );
}