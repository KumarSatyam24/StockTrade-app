import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeTrade } from '../tradeUtils';
import { supabase } from '../../lib/supabase';
import type { User } from '../../types';
import type { IndianStock } from '../../lib/stocks/types';

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { balance: 10000 },
            error: null
          }))
        })),
        maybeSingle: vi.fn(() => ({
          data: null,
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }
}));

describe('Trade System', () => {
  let mockUser: User;
  let mockStock: IndianStock;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      created_at: new Date().toISOString()
    };

    mockStock = {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      sector: 'Technology',
      current_price: 150,
      previous_close: 148,
      day_change: 2,
      day_change_percent: 1.35
    };
  });

  describe('Buy Operations', () => {
    it('should successfully execute a buy trade', async () => {
      const quantity = 10;
      await executeTrade({
        user: mockUser,
        stock: mockStock,
        quantity,
        type: 'BUY'
      });

      expect(supabase.from).toHaveBeenCalledWith('user_funds');
      expect(supabase.from).toHaveBeenCalledWith('portfolios');
      expect(supabase.from).toHaveBeenCalledWith('transactions');
    });

    it('should throw error for insufficient funds', async () => {
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { balance: 100 }, // Low balance
              error: null
            }))
          }))
        })),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      }));

      await expect(executeTrade({
        user: mockUser,
        stock: mockStock,
        quantity: 100,
        type: 'BUY'
      })).rejects.toThrow('Insufficient funds');
    });

    it('should update existing position when buying more of same stock', async () => {
      // Mock existing position
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => ({
              data: {
                id: 'existing-position',
                quantity: 5,
                average_price: 145
              },
              error: null
            }))
          }))
        })),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      }));

      await executeTrade({
        user: mockUser,
        stock: mockStock,
        quantity: 5,
        type: 'BUY'
      });

      expect(supabase.from).toHaveBeenCalledWith('portfolios');
    });
  });

  describe('Sell Operations', () => {
    it('should successfully execute a sell trade', async () => {
      // Mock existing position
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => ({
              data: {
                id: 'existing-position',
                quantity: 10,
                average_price: 145
              },
              error: null
            }))
          }))
        })),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      }));

      await executeTrade({
        user: mockUser,
        stock: mockStock,
        quantity: 5,
        type: 'SELL'
      });

      expect(supabase.from).toHaveBeenCalledWith('portfolios');
      expect(supabase.from).toHaveBeenCalledWith('transactions');
    });

    it('should throw error when trying to sell without position', async () => {
      await expect(executeTrade({
        user: mockUser,
        stock: mockStock,
        quantity: 5,
        type: 'SELL'
      })).rejects.toThrow('No shares available to sell');
    });

    it('should throw error when trying to sell more than owned', async () => {
      // Mock smaller existing position
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => ({
              data: {
                id: 'existing-position',
                quantity: 3,
                average_price: 145
              },
              error: null
            }))
          }))
        })),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      }));

      await expect(executeTrade({
        user: mockUser,
        stock: mockStock,
        quantity: 5,
        type: 'SELL'
      })).rejects.toThrow('Insufficient shares to sell');
    });

    it('should delete position when selling all shares', async () => {
      // Mock existing position with exact quantity
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => ({
              data: {
                id: 'existing-position',
                quantity: 5,
                average_price: 145
              },
              error: null
            }))
          }))
        })),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      }));

      await executeTrade({
        user: mockUser,
        stock: mockStock,
        quantity: 5,
        type: 'SELL'
      });

      expect(supabase.from).toHaveBeenCalledWith('portfolios');
    });
  });

  describe('Input Validation', () => {
    it('should throw error for invalid quantity', async () => {
      await expect(executeTrade({
        user: mockUser,
        stock: mockStock,
        quantity: 0,
        type: 'BUY'
      })).rejects.toThrow('Invalid quantity');

      await expect(executeTrade({
        user: mockUser,
        stock: mockStock,
        quantity: -1,
        type: 'BUY'
      })).rejects.toThrow('Invalid quantity');
    });

    it('should throw error for invalid stock price', async () => {
      const invalidStock = { ...mockStock, current_price: 0 };
      await expect(executeTrade({
        user: mockUser,
        stock: invalidStock,
        quantity: 1,
        type: 'BUY'
      })).rejects.toThrow('Invalid stock price');
    });

    it('should throw error if user is not authenticated', async () => {
      await expect(executeTrade({
        user: null as any,
        stock: mockStock,
        quantity: 1,
        type: 'BUY'
      })).rejects.toThrow('User not authenticated');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: new Error('Database error')
            }))
          }))
        })),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn()
      }));

      await expect(executeTrade({
        user: mockUser,
        stock: mockStock,
        quantity: 1,
        type: 'BUY'
      })).rejects.toThrow();
    });

    it('should handle transaction errors gracefully', async () => {
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { balance: 10000 },
              error: null
            }))
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: null,
              error: new Error('Transaction failed')
            }))
          }))
        })),
        update: vi.fn(),
        delete: vi.fn()
      }));

      await expect(executeTrade({
        user: mockUser,
        stock: mockStock,
        quantity: 1,
        type: 'BUY'
      })).rejects.toThrow();
    });
  });
});