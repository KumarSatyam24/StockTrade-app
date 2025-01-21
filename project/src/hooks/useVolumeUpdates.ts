import { useState, useEffect } from 'react';
import type { IndianStock } from '../lib/stocks/types';

function generateRandomVolumeChange(baseVolume: number): number {
  // Generate a random change within ±10% of base volume
  const maxChange = baseVolume * 0.1;
  return Math.floor((Math.random() - 0.5) * maxChange);
}

export function useVolumeUpdates(stocks: IndianStock[]): IndianStock[] {
  const [updatedStocks, setUpdatedStocks] = useState<IndianStock[]>(stocks);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdatedStocks(currentStocks => 
        currentStocks.map(stock => {
          const baseVolume = stock.volume || 100000; // Default base volume if none exists
          const volumeChange = generateRandomVolumeChange(baseVolume);
          const newVolume = Math.max(baseVolume + volumeChange, 1000); // Ensure volume never goes below 1000
          
          return {
            ...stock,
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