import React, { useState } from 'react';
import { FeaturedStock } from '../components/dashboard/FeaturedStock';
import { StockList } from '../components/dashboard/StockList';
import { TradeModal } from '../components/TradeModal';
import { useStocks } from '../hooks/useStocks';
import type { Stock } from '../types';

export function Dashboard() {
  const { stocks, loading, error } = useStocks();
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading stocks...</div>
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

  const handleStockClick = (stock: Stock) => {
    setSelectedStock(stock);
    setIsTradeModalOpen(true);
  };

  const handleTradeSuccess = () => {
    setIsTradeModalOpen(false);
    setSelectedStock(null);
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

      {stocks.length > 0 && <FeaturedStock stock={stocks[0]} />}

      <StockList 
        stocks={stocks} 
        onStockClick={handleStockClick} 
      />

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