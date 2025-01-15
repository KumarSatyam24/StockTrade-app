import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Portfolio } from '../types';
import type { User } from '../types';

export function usePortfolio(user: User | null) {
  const [portfolio, setPortfolio] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadPortfolio() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('portfolios')
          .select('*')
          .eq('user_id', user.id);

        if (supabaseError) throw supabaseError;
        
        // Always set portfolio to an array, even if empty
        setPortfolio(data || []);
      } catch (err) {
        console.error('Error loading portfolio:', err);
        setError('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    }

    loadPortfolio();
  }, [user]);

  return { portfolio, loading, error };
}