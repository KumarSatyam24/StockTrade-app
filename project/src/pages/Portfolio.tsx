import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioUpdates } from '../hooks/usePortfolioUpdates';
import { PortfolioHeader } from '../components/Portfolio/PortfolioHeader';
import { PortfolioTable } from '../components/Portfolio/PortfolioTable';
import { Search } from 'lucide-react';

export function Portfolio() {
  const { user } = useAuth();
  const { portfolio: initialPortfolio, loading, error } = usePortfolio(user);
  const portfolio = usePortfolioUpdates(initialPortfolio);

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
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Your Portfolio ({portfolio.length})</h1>
        <p className="text-gray-500">You don't have any stocks in your portfolio yet.</p>
      </div>
    );
  }

  const totalInvestment = portfolio.reduce((sum, holding) => 
    sum + (holding.quantity * holding.average_price), 0
  );

  const currentValue = portfolio.reduce((sum, holding) => 
    sum + (holding.quantity * holding.current_price), 0
  );

  const totalProfitLoss = currentValue - totalInvestment;
  const dayProfitLoss = portfolio.reduce((sum, holding) => 
    sum + holding.profit_loss, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          Holdings ({portfolio.length})
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All stocks</option>
          </select>
        </div>
      </div>

      <PortfolioHeader
        totalInvestment={totalInvestment}
        currentValue={currentValue}
        dayProfitLoss={dayProfitLoss}
        totalProfitLoss={totalProfitLoss}
      />

      <PortfolioTable holdings={portfolio} />
    </div>
  );
}