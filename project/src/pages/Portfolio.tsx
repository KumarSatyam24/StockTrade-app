import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../hooks/usePortfolio';
import { PortfolioSummary } from '../components/Portfolio/PortfolioSummary';

export function Portfolio() {
  const { user } = useAuth();
  const { portfolio, loading, error } = usePortfolio(user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading portfolio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!portfolio || portfolio.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Your Portfolio</h1>
        <p className="text-gray-500">You don't have any stocks in your portfolio yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Your Portfolio</h1>
      <PortfolioSummary portfolio={portfolio} />
      
      <div className="space-y-4">
        {portfolio.map((holding) => {
          // Ensure all required values have defaults
          const quantity = holding.quantity || 0;
          const averagePrice = holding.average_price || 0;
          const currentPrice = holding.current_price || 0;
          const profitLoss = holding.profit_loss || 0;
          const profitLossPercentage = holding.profit_loss_percentage || 0;

          return (
            <div key={holding.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{holding.stock_symbol}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {quantity} shares @ ${averagePrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium">
                      ${(quantity * currentPrice).toFixed(2)}
                    </p>
                    <p className={`text-sm ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} 
                      ({profitLossPercentage.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}