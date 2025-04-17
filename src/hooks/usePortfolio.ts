import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Portfolio } from '../types';
import type { User } from '../types';

export function usePortfolio(user: User | null) {
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id);

      if (supabaseError) throw supabaseError;
      
      setPortfolio(data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return { portfolio, loading, error, refetch: fetchPortfolio };
}