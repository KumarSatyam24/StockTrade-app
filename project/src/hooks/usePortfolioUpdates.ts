import { useState, useEffect } from 'react';
import type { Portfolio } from '../types';

function generateRandomPriceChange(currentPrice: number): number {
  const maxChange = currentPrice * 0.002; // 0.2% max change
  return (Math.random() - 0.5) * maxChange;
}

export function usePortfolioUpdates(initialPortfolio: Portfolio[]): Portfolio[] {
  const [portfolio, setPortfolio] = useState<Portfolio[]>(initialPortfolio);

  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolio(currentPortfolio => 
        currentPortfolio.map(holding => {
          const priceChange = generateRandomPriceChange(holding.current_price);
          const newPrice = holding.current_price + priceChange;
          const newProfitLoss = (newPrice - holding.average_price) * holding.quantity;
          
          return {
            ...holding,
            current_price: newPrice,
            profit_loss: newProfitLoss,
            profit_loss_percentage: ((newPrice - holding.average_price) / holding.average_price) * 100
          };
        })
      );
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Update when initialPortfolio changes
  useEffect(() => {
    setPortfolio(initialPortfolio);
  }, [initialPortfolio]);

  return portfolio;
}