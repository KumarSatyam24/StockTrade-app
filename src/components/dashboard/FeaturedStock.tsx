import React from 'react';
import { StockChart } from '../charts/StockChart';
import type { Stock } from '../../types';

interface FeaturedStockProps {
  stock: Stock;
}

export function FeaturedStock({ stock }: FeaturedStockProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-medium mb-4">
        {stock.symbol} - {stock.name}
      </h2>
      <StockChart stock={stock} />
    </div>
  );
}