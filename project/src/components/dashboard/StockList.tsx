import React from 'react';
import { StockCard } from '../StockCard';
import type { Stock } from '../../types';

interface StockListProps {
  stocks: Stock[];
  onStockClick: (stock: Stock) => void;
}

export function StockList({ stocks, onStockClick }: StockListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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