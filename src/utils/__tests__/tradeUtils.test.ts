import { describe, it, expect, vi } from 'vitest';
import { executeTrade } from '../tradeUtils';
import { supabase } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { balance: 1000 },
            error: null
          }))
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

describe('executeTrade', () => {
  const mockUser = { 
    id: 'test-user', 
    email: 'test@example.com',
    created_at: new Date().toISOString()
  };
  
  const mockStock = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    current_price: 150,
    previous_close: 148,
    day_change: 2,
    day_change_percent: 1.35
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error if user is not authenticated', async () => {
    await expect(executeTrade({
      user: null as any,
      stock: mockStock,
      quantity: 1,
      type: 'BUY'
    })).rejects.toThrow('User not authenticated');
  });

  it('should throw error for invalid quantity', async () => {
    await expect(executeTrade({
      user: mockUser,
      stock: mockStock,
      quantity: 0,
      type: 'BUY'
    })).rejects.toThrow('Invalid quantity');
  });

  it('should throw error for insufficient funds on buy', async () => {
    vi.mocked(supabase.from).mockImplementation(() => ({
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
});