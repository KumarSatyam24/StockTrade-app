import React, { useState } from 'react';
import { PortfolioTableRow } from './PortfolioTableRow';
import { TradeModal } from '../TradeModal';
import { useMarketData } from '../../hooks/useMarketData';
import type { Portfolio } from '../../types';
import type { IndianStock } from '../../lib/stocks/types';

interface PortfolioTableProps {
  holdings: Portfolio[];
  onTradeSuccess: () => void;
}

export function PortfolioTable({ holdings, onTradeSuccess }: PortfolioTableProps) {
  const symbols = holdings.map(h => h.stock_symbol);
  const marketData = useMarketData(symbols);
  const [selectedStock, setSelectedStock] = useState<IndianStock | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [defaultTradeType, setDefaultTradeType] = useState<'BUY' | 'SELL'>('BUY');

  if (!holdings.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No stocks in portfolio
      </div>
    );
  }

  const handleTradeClick = (stock: IndianStock, type: 'BUY' | 'SELL') => {
    setSelectedStock(stock);
    setDefaultTradeType(type);
    setShowTradeModal(true);
  };

  const handleTradeSuccess = () => {
    setShowTradeModal(false);
    onTradeSuccess();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="relative">
          {/* Fixed Header */}
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky top-0 z-10 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">Stock</th>
                <th className="sticky top-0 z-10 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase bg-gray-50">Qty</th>
                <th className="sticky top-0 z-10 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase bg-gray-50">Avg</th>
                <th className="sticky top-0 z-10 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase bg-gray-50">LTP</th>
                <th className="sticky top-0 z-10 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase bg-gray-50">Day's P/L</th>
                <th className="sticky top-0 z-10 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase bg-gray-50">Day %</th>
                <th className="sticky top-0 z-10 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase bg-gray-50">Net P/L</th>
                <th className="sticky top-0 z-10 w-8 bg-gray-50"></th>
              </tr>
            </thead>
          </table>

          {/* Scrollable Body */}
          <div className="max-h-[calc(100vh-300px)]">
            <table className="min-w-full">
              <tbody className="bg-white divide-y divide-gray-200">
                {holdings.map((holding) => (
                  <PortfolioTableRow
                    key={holding.id}
                    holding={holding}
                    marketData={marketData[holding.stock_symbol]}
                    onTradeClick={(type) => {
                      handleTradeClick({
                        symbol: holding.stock_symbol,
                        name: holding.stock_symbol,
                        sector: '',
                        current_price: holding.current_price,
                        previous_close: holding.previous_day_price,
                        day_change: holding.current_price - holding.previous_day_price,
                        day_change_percent: ((holding.current_price - holding.previous_day_price) / holding.previous_day_price) * 100
                      }, type);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedStock && (
        <TradeModal
          stock={selectedStock}
          isOpen={showTradeModal}
          onClose={() => setShowTradeModal(false)}
          onSuccess={handleTradeSuccess}
          defaultType={defaultTradeType}
        />
      )}
    </>
  );
}