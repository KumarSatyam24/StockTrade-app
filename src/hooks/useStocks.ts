import { useState, useEffect } from 'react';
import { getStocks } from '../services/stocks';
import type { IndianStock } from '../lib/stocks/types';

export function useStocks() {
  const [stocks, setStocks] = useState<IndianStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStocks() {
      try {
        setLoading(true);
        const data = await getStocks();
        console.log('[useStocks] Fetched stocks:', data.length); // Debug log
        setStocks(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch stocks:', err);
        setError('Failed to fetch stocks');
      } finally {
        setLoading(false);
      }
    }

    loadStocks();
  }, []);

  return { stocks, loading, error };
}