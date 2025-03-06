import React from 'react';
import { StockCard } from '../StockCard';
import type { IndianStock } from '../../lib/stocks/types';

interface StockListProps {
  stocks: IndianStock[];
  onStockClick: (stock: IndianStock) => void;
}

export function StockList({ stocks, onStockClick }: StockListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stocks.map((stock) => (
        <StockCard
          key={stock.symbol}
          stock={stock}
          onClick={() => onStockClick(stock)}
        />
      ))}
    </div>
  );
}