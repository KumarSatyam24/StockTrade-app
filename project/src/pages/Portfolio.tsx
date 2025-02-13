import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../hooks/usePortfolio';
import { usePortfolioUpdates } from '../hooks/usePortfolioUpdates';
import { PortfolioHeader } from '../components/Portfolio/PortfolioHeader';
import { PortfolioTable } from '../components/Portfolio/PortfolioTable';
import { Search } from 'lucide-react';

export function Portfolio() {
  const { user } = useAuth();
  const { portfolio: initialPortfolio, loading, error, refetch } = usePortfolio(user);
  const portfolio = usePortfolioUpdates(initialPortfolio);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter portfolio based on search query
  const filteredPortfolio = portfolio.filter(holding =>
    holding.stock_symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalInvestment = filteredPortfolio.reduce((sum, holding) => 
    sum + (holding.quantity * holding.average_price), 0
  );

  const currentValue = filteredPortfolio.reduce((sum, holding) => 
    sum + (holding.quantity * holding.current_price), 0
  );

  const totalProfitLoss = currentValue - totalInvestment;

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
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <PortfolioHeader
        totalInvestment={totalInvestment}
        currentValue={currentValue}
        totalProfitLoss={totalProfitLoss}
      />

      <PortfolioTable holdings={filteredPortfolio} onTradeSuccess={refetch} />
    </div>
  );
}