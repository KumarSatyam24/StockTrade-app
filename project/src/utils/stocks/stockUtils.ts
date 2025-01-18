import type { Stock } from '../../types';

export function generatePriceChange(currentPrice: number): number {
  const maxChange = currentPrice * 0.002;
  return (Math.random() - 0.5) * maxChange;
}

export function generateStockUpdate(stock: Stock): Stock {
  const priceChange = generatePriceChange(stock.price);
  const newPrice = stock.price + priceChange;
  
  const newHistoricalData = [
    ...(stock.historicalData || []).slice(-29),
    {
      date: new Date().toISOString().split('T')[0],
      price: newPrice
    }
  ];

  return {
    ...stock,
    price: newPrice,
    change: stock.change + priceChange,
    changePercent: ((stock.change + priceChange) / newPrice) * 100,
    historicalData: newHistoricalData
  };
}