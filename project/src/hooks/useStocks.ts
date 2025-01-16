import { useState, useEffect } from 'react';
import { getStocks, initializeStocksTable } from '../lib/stocks/stocksService';
import type { IndianStock } from '../lib/stocks/types';

export function useStocks() {
  const [stocks, setStocks] = useState<IndianStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStocks() {
      try {
        // Initialize stocks table if empty
        await initializeStocksTable();
        const data = await getStocks();
        setStocks(data);
      } catch (err) {
        setError('Failed to fetch stocks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadStocks();

    // Refresh every minute
    const interval = setInterval(loadStocks, 60000);
    return () => clearInterval(interval);
  }, []);

  return { stocks, loading, error };
}