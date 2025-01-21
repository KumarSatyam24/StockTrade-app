import { useState, useEffect } from 'react';
import type { IndianStock } from '../lib/stocks/types';

function generateRandomPriceChange(currentPrice: number): number {
  const maxChange = currentPrice * 0.025; // 2.5% max change
  return (Math.random() - 0.5) * maxChange;
}

function generateRandomVolumeChange(baseVolume: number): number {
  const maxChange = baseVolume * 0.1; // 10% max change
  return Math.floor((Math.random() - 0.5) * maxChange);
}

export function useMarketUpdates(stocks: IndianStock[]): IndianStock[] {
  const [updatedStocks, setUpdatedStocks] = useState<IndianStock[]>(stocks);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdatedStocks(currentStocks => 
        currentStocks.map(stock => {
          const priceChange = generateRandomPriceChange(stock.current_price);
          const newPrice = stock.current_price + priceChange;
          
          const baseVolume = stock.volume || 100000;
          const volumeChange = generateRandomVolumeChange(baseVolume);
          const newVolume = Math.max(baseVolume + volumeChange, 1000);
          
          return {
            ...stock,
            current_price: newPrice,
            day_change: newPrice - stock.previous_close,
            day_change_percent: ((newPrice - stock.previous_close) / stock.previous_close) * 100,
            volume: newVolume
          };
        })
      );
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Update when initial stocks change
  useEffect(() => {
    setUpdatedStocks(stocks);
  }, [stocks]);

  return updatedStocks;
}