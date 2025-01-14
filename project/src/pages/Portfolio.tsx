import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePortfolio } from '../hooks/usePortfolio';
import { StockChart } from '../components/StockChart';

export function Portfolio() {
  const { user } = useAuth();
  const { portfolio, loading, error } = usePortfolio(user);

  if (loading) {
    return <div>Loading portfolio...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  // Safely calculate totals with default values
  const totalValue = portfolio?.reduce((sum, holding) => 
    sum + ((holding?.quantity || 0) * (holding?.current_price || 0)), 0
  ) || 0;

  const totalProfitLoss = portfolio?.reduce((sum, holding) => 
    sum + (holding?.profit_loss || 0), 0
  ) || 0;

  const totalProfitLossPercentage = totalValue !== 0 
    ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Your Portfolio</h1>

      {/* Portfolio Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
          <p className="mt-1 text-2xl font-semibold">${totalValue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total P/L</h3>
          <p className={`mt-1 text-2xl font-semibold ${totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${totalProfitLoss.toFixed(2)} ({totalProfitLossPercentage.toFixed(2)}%)
          </p>
        </div>
      </div>

      {!portfolio || portfolio.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have any stocks in your portfolio yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {portfolio.map((holding) => (
            <div key={holding.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{holding.stock_symbol}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {holding.quantity} shares @ ${(holding.average_price || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium">
                      ${((holding.quantity || 0) * (holding.current_price || 0)).toFixed(2)}
                    </p>
                    <p className={`text-sm ${(holding.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(holding.profit_loss || 0) >= 0 ? '+' : ''}${(holding.profit_loss || 0).toFixed(2)} 
                      ({(holding.profit_loss_percentage || 0).toFixed(2)}%)
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <StockChart 
                    stock={{
                      symbol: holding.stock_symbol,
                      name: '',
                      price: holding.current_price || 0,
                      change: 0,
                      changePercent: 0,
                      historicalData: [] // In a real app, fetch historical data
                    }}
                    height={200}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}