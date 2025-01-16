import React, { useState } from 'react';
import { MarketOverview } from '../components/dashboard/MarketOverview';
import { StockTable } from '../components/dashboard/StockTable';
import { StockDetails } from '../components/dashboard/StockDetails';
import { SearchBar } from '../components/dashboard/SearchBar';
import { TradeModal } from '../components/TradeModal';
import { useStocks } from '../hooks/useStocks';
import type { IndianStock } from '../lib/stocks/types';

export function Dashboard() {
  const { stocks, loading, error } = useStocks();
  const [selectedStock, setSelectedStock] = useState<IndianStock | null>(null);
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

  const handleStockClick = (stock: IndianStock) => {
    setSelectedStock(stock);
  };

  const handleTradeClick = (stock: IndianStock) => {
    setSelectedStock(stock);
    setIsTradeModalOpen(true);
  };

  const handleTradeSuccess = () => {
    setIsTradeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Market Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Search or click on a stock to view details
          </p>
        </div>
      </div>

      <div className="max-w-xl">
        <SearchBar stocks={stocks} onSelect={handleStockClick} />
      </div>
      
      <MarketOverview stocks={stocks} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StockTable 
            stocks={stocks}
            onStockClick={handleStockClick}
          />
        </div>
        <div>
          {selectedStock ? (
            <div className="space-y-4">
              <StockDetails stock={selectedStock} />
              <button
                onClick={() => handleTradeClick(selectedStock)}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Trade {selectedStock.symbol}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Select a stock to view details
            </div>
          )}
        </div>
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