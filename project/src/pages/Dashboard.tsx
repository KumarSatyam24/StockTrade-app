import React, { useState } from 'react';
import { StockCard } from '../components/StockCard';
import { StockChart } from '../components/StockChart';
import { TradeModal } from '../components/TradeModal';
import { useStocks } from '../hooks/useStocks';

export function Dashboard() {
  const { stocks, loading, error } = useStocks();
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  if (loading) {
    return <div>Loading stocks...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  const handleStockClick = (stock: Stock) => {
    setSelectedStock(stock);
    setIsTradeModalOpen(true);
  };

  const handleTradeSuccess = () => {
    // In a real app, we would refresh the data here
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Market Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Click on a stock to start trading
          </p>
        </div>
      </div>

      {/* Featured Stock Chart */}
      {stocks.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">{stocks[0].symbol} - {stocks[0].name}</h2>
          <StockChart stock={stocks[0]} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stocks.map((stock) => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onClick={() => handleStockClick(stock)}
          />
        ))}
      </div>

      {selectedStock && (
        <TradeModal
          stock={selectedStock}
          isOpen={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          onSuccess={handleTradeSuccess}
        />
      )}
    </div>
  );
}