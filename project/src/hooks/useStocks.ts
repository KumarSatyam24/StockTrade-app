import { useState, useEffect } from 'react';
import type { Stock } from '../types';
import { MOCK_STOCKS } from '../utils/mockData';
import { useStockUpdates } from './useStockUpdates';

export function useStocks() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialStocks, setInitialStocks] = useState<Stock[]>([]);

  useEffect(() => {
    try {
      // Simulate API delay for more realistic behavior
      const loadStocks = async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setInitialStocks(MOCK_STOCKS);
        setLoading(false);
      };
      loadStocks();
    } catch (err) {
      setError('Failed to fetch stocks');
      setLoading(false);
    }
  }, []);

  const stocks = useStockUpdates(initialStocks);

  return { stocks, loading, error };
}