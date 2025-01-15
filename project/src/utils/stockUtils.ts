import type { Stock } from '../types';

// Generate a random price change within a reasonable range
function generatePriceChange(currentPrice: number): number {
  const maxChange = currentPrice * 0.002; // Max 0.2% change per update
  return (Math.random() - 0.5) * maxChange;
}

// Update a single stock with new price and calculations
export function generateStockUpdate(stock: Stock): Stock {
  const priceChange = generatePriceChange(stock.price);
  const newPrice = stock.price + priceChange;
  
  // Update historical data
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