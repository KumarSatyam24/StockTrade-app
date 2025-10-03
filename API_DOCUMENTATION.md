# API Documentation - StockTrade Platform

## Overview
This document provides detailed API specifications for the StockTrade Platform, including endpoints, data models, and usage examples.

## Base Configuration
```typescript
// Supabase Client Configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

## Authentication APIs

### Sign In with Google
```typescript
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  return { data, error };
};
```

### Sign Out
```typescript
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};
```

### Get Current Session
```typescript
const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};
```

## Stock Data APIs

### Get All Stocks
```typescript
interface GetStocksResponse {
  symbol: string;
  name: string;
  sector: string;
  current_price: number;
  previous_close: number;
  day_change: number;
  day_change_percent: number;
  volume: number;
  market_cap?: number;
  pe_ratio?: number;
  dividend_yield?: number;
  fifty_two_week_high?: number;
  fifty_two_week_low?: number;
}

const getStocks = async (): Promise<GetStocksResponse[]> => {
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .order('symbol');
  
  if (error) throw error;
  return data || [];
};
```

### Get Stocks by Symbols
```typescript
const getStocksBySymbols = async (symbols: string[]): Promise<GetStocksResponse[]> => {
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .in('symbol', symbols)
    .order('symbol');
  
  if (error) throw error;
  return data || [];
};
```

### Search Stocks
```typescript
interface SearchStocksParams {
  query: string;
  limit?: number;
}

const searchStocks = async ({ query, limit = 10 }: SearchStocksParams) => {
  const { data, error } = await supabase
    .from('stocks')
    .select('symbol, name, sector, current_price')
    .or(`name.ilike.%${query}%,symbol.ilike.%${query}%,sector.ilike.%${query}%`)
    .limit(limit);
  
  if (error) throw error;
  return data || [];
};
```

## Portfolio APIs

### Get User Portfolio
```typescript
interface PortfolioItem {
  id: string;
  user_id: string;
  stock_symbol: string;
  quantity: number;
  average_price: number;
  current_price: number;
  previous_day_price: number;
  day_change: number;
  day_change_percent: number;
  profit_loss: number;
  profit_loss_percentage: number;
  last_price_update: string;
  created_at: string;
}

const getPortfolio = async (userId: string): Promise<PortfolioItem[]> => {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};
```

### Update Portfolio Position
```typescript
interface UpdatePortfolioParams {
  userId: string;
  stockSymbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
}

const updatePortfolio = async (params: UpdatePortfolioParams) => {
  const { data, error } = await supabase
    .from('portfolios')
    .upsert({
      user_id: params.userId,
      stock_symbol: params.stockSymbol,
      quantity: params.quantity,
      average_price: params.averagePrice,
      current_price: params.currentPrice,
      profit_loss: (params.currentPrice - params.averagePrice) * params.quantity,
      profit_loss_percentage: ((params.currentPrice - params.averagePrice) / params.averagePrice) * 100
    }, {
      onConflict: 'user_id,stock_symbol'
    });
  
  if (error) throw error;
  return data;
};
```

### Delete Portfolio Position
```typescript
const deletePortfolioPosition = async (userId: string, stockSymbol: string) => {
  const { error } = await supabase
    .from('portfolios')
    .delete()
    .eq('user_id', userId)
    .eq('stock_symbol', stockSymbol);
  
  if (error) throw error;
};
```

## Transaction APIs

### Record Transaction
```typescript
interface TransactionParams {
  userId: string;
  stockSymbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
}

const recordTransaction = async (params: TransactionParams) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: params.userId,
      stock_symbol: params.stockSymbol,
      type: params.type,
      quantity: params.quantity,
      price: params.price,
      total: params.total
    });
  
  if (error) throw error;
  return data;
};
```

### Get Transaction History
```typescript
interface GetTransactionsParams {
  userId: string;
  stockSymbol?: string;
  type?: 'BUY' | 'SELL';
  limit?: number;
  offset?: number;
}

const getTransactions = async (params: GetTransactionsParams) => {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', params.userId)
    .order('created_at', { ascending: false });
  
  if (params.stockSymbol) {
    query = query.eq('stock_symbol', params.stockSymbol);
  }
  
  if (params.type) {
    query = query.eq('type', params.type);
  }
  
  if (params.limit) {
    query = query.limit(params.limit);
  }
  
  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};
```

## Funds Management APIs

### Get User Balance
```typescript
const getUserBalance = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_funds')
    .select('balance')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data?.balance || 0;
};
```

### Update User Balance
```typescript
interface UpdateBalanceParams {
  userId: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
}

const updateUserBalance = async (params: UpdateBalanceParams) => {
  // Start a transaction
  const { data: currentBalance, error: balanceError } = await supabase
    .from('user_funds')
    .select('balance')
    .eq('user_id', params.userId)
    .single();
  
  if (balanceError) throw balanceError;
  
  const newBalance = params.type === 'DEPOSIT' 
    ? (currentBalance?.balance || 0) + params.amount
    : (currentBalance?.balance || 0) - params.amount;
  
  if (newBalance < 0) {
    throw new Error('Insufficient funds');
  }
  
  // Update balance
  const { error: updateError } = await supabase
    .from('user_funds')
    .upsert({
      user_id: params.userId,
      balance: newBalance
    }, {
      onConflict: 'user_id'
    });
  
  if (updateError) throw updateError;
  
  // Record fund transaction
  const { error: transactionError } = await supabase
    .from('fund_transactions')
    .insert({
      user_id: params.userId,
      type: params.type,
      amount: params.amount,
      status: 'COMPLETED'
    });
  
  if (transactionError) throw transactionError;
  
  return newBalance;
};
```

### Get Fund Transaction History
```typescript
const getFundTransactions = async (userId: string, limit: number = 50) => {
  const { data, error } = await supabase
    .from('fund_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
};
```

## Wishlist APIs

### Get User Wishlist
```typescript
const getWishlist = async (userId: string) => {
  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      id,
      stock_symbol,
      added_at,
      stocks (
        name,
        sector,
        current_price,
        day_change,
        day_change_percent
      )
    `)
    .eq('user_id', userId)
    .order('added_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};
```

### Add to Wishlist
```typescript
const addToWishlist = async (userId: string, stockSymbol: string) => {
  const { data, error } = await supabase
    .from('wishlists')
    .insert({
      user_id: userId,
      stock_symbol: stockSymbol
    });
  
  if (error) throw error;
  return data;
};
```

### Remove from Wishlist
```typescript
const removeFromWishlist = async (userId: string, stockSymbol: string) => {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('stock_symbol', stockSymbol);
  
  if (error) throw error;
};
```

## Real-time Subscriptions

### Market Data Subscription
```typescript
const subscribeToMarketData = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('market-data')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'stocks'
      },
      callback
    )
    .subscribe();
  
  return () => channel.unsubscribe();
};
```

### Portfolio Updates Subscription
```typescript
const subscribeToPortfolioUpdates = (userId: string, callback: (payload: any) => void) => {
  const channel = supabase
    .channel(`portfolio-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'portfolios',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
  
  return () => channel.unsubscribe();
};
```

### User Funds Subscription
```typescript
const subscribeToFundsUpdates = (userId: string, callback: (payload: any) => void) => {
  const channel = supabase
    .channel(`funds-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_funds',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
  
  return () => channel.unsubscribe();
};
```

## Database Functions (Stored Procedures)

### Execute Trade Function
```sql
CREATE OR REPLACE FUNCTION execute_trade(
  p_user_id UUID,
  p_symbol TEXT,
  p_type TEXT,
  p_quantity NUMERIC,
  p_price NUMERIC
)
RETURNS JSON AS $$
DECLARE
  v_total NUMERIC;
  v_current_balance NUMERIC;
  v_current_quantity NUMERIC;
  v_current_avg_price NUMERIC;
  v_new_quantity NUMERIC;
  v_new_avg_price NUMERIC;
BEGIN
  -- Calculate trade total
  v_total := p_quantity * p_price;
  
  -- Get current balance
  SELECT balance INTO v_current_balance
  FROM user_funds
  WHERE user_id = p_user_id;
  
  -- Get current portfolio position
  SELECT quantity, average_price
  INTO v_current_quantity, v_current_avg_price
  FROM portfolios
  WHERE user_id = p_user_id AND stock_symbol = p_symbol;
  
  -- Validate trade
  IF p_type = 'BUY' AND v_total > v_current_balance THEN
    RETURN json_build_object('error', 'Insufficient funds');
  END IF;
  
  IF p_type = 'SELL' AND p_quantity > COALESCE(v_current_quantity, 0) THEN
    RETURN json_build_object('error', 'Insufficient shares');
  END IF;
  
  -- Execute trade logic
  IF p_type = 'BUY' THEN
    -- Update balance
    UPDATE user_funds
    SET balance = balance - v_total
    WHERE user_id = p_user_id;
    
    -- Update portfolio
    IF v_current_quantity IS NULL THEN
      -- New position
      INSERT INTO portfolios (user_id, stock_symbol, quantity, average_price)
      VALUES (p_user_id, p_symbol, p_quantity, p_price);
    ELSE
      -- Add to existing position
      v_new_quantity := v_current_quantity + p_quantity;
      v_new_avg_price := ((v_current_quantity * v_current_avg_price) + (p_quantity * p_price)) / v_new_quantity;
      
      UPDATE portfolios
      SET quantity = v_new_quantity,
          average_price = v_new_avg_price
      WHERE user_id = p_user_id AND stock_symbol = p_symbol;
    END IF;
  ELSE
    -- SELL operation
    UPDATE user_funds
    SET balance = balance + v_total
    WHERE user_id = p_user_id;
    
    v_new_quantity := v_current_quantity - p_quantity;
    
    IF v_new_quantity = 0 THEN
      DELETE FROM portfolios
      WHERE user_id = p_user_id AND stock_symbol = p_symbol;
    ELSE
      UPDATE portfolios
      SET quantity = v_new_quantity
      WHERE user_id = p_user_id AND stock_symbol = p_symbol;
    END IF;
  END IF;
  
  -- Record transaction
  INSERT INTO transactions (user_id, stock_symbol, type, quantity, price, total)
  VALUES (p_user_id, p_symbol, p_type, p_quantity, p_price, v_total);
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;
```

### Get Portfolio Summary Function
```sql
CREATE OR REPLACE FUNCTION get_portfolio_summary(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_investment', COALESCE(SUM(quantity * average_price), 0),
    'current_value', COALESCE(SUM(quantity * current_price), 0),
    'total_profit_loss', COALESCE(SUM(profit_loss), 0),
    'total_profit_loss_percentage', 
      CASE 
        WHEN SUM(quantity * average_price) > 0 THEN
          (SUM(profit_loss) / SUM(quantity * average_price)) * 100
        ELSE 0
      END,
    'positions_count', COUNT(*)
  )
  INTO v_result
  FROM portfolios
  WHERE user_id = p_user_id;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
```

## Error Handling

### Common Error Responses
```typescript
interface APIError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Error handling example
const handleAPIError = (error: any): APIError => {
  if (error.code === 'PGRST301') {
    return { message: 'Resource not found' };
  }
  
  if (error.code === '23505') {
    return { message: 'Duplicate entry' };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    details: error.details,
    hint: error.hint,
    code: error.code
  };
};
```

### Trade Execution Errors
```typescript
enum TradeError {
  INSUFFICIENT_FUNDS = 'Insufficient funds for this trade',
  INSUFFICIENT_SHARES = 'Insufficient shares to sell',
  INVALID_QUANTITY = 'Quantity must be greater than 0',
  INVALID_PRICE = 'Price must be greater than 0',
  MARKET_CLOSED = 'Market is currently closed',
  STOCK_NOT_FOUND = 'Stock symbol not found'
}
```

## Rate Limiting & Best Practices

### API Rate Limits
- Real-time subscriptions: 10 events per second
- REST API calls: No explicit limit (Supabase managed)
- Polling intervals: Minimum 1 second recommended

### Performance Optimization
```typescript
// Batch operations for better performance
const batchUpdatePortfolio = async (updates: PortfolioUpdate[]) => {
  const { data, error } = await supabase
    .from('portfolios')
    .upsert(updates, { onConflict: 'user_id,stock_symbol' });
  
  if (error) throw error;
  return data;
};

// Use select specific fields to reduce payload
const getPortfolioSummary = async (userId: string) => {
  const { data, error } = await supabase
    .from('portfolios')
    .select('quantity, average_price, current_price, profit_loss')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};
```

### Caching Strategy
```typescript
// Client-side caching for frequently accessed data
const cache = new Map();

const getCachedStocks = async () => {
  const cacheKey = 'stocks';
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < 30000) {
    return cached.data;
  }
  
  const stocks = await getStocks();
  cache.set(cacheKey, {
    data: stocks,
    timestamp: Date.now()
  });
  
  return stocks;
};
```

## Testing the APIs

### Unit Test Examples
```typescript
// Mock Supabase for testing
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: mockPortfolioData,
          error: null
        })
      })
    })
  }
}));

// Test portfolio API
describe('Portfolio API', () => {
  it('should fetch user portfolio', async () => {
    const portfolio = await getPortfolio('user-id');
    expect(portfolio).toEqual(mockPortfolioData);
  });
});
```

### Integration Test Setup
```typescript
// Test with real Supabase instance
const testSupabase = createClient(
  process.env.VITE_SUPABASE_TEST_URL!,
  process.env.VITE_SUPABASE_TEST_KEY!
);

describe('Trade Integration', () => {
  beforeEach(async () => {
    // Setup test data
    await testSupabase.from('user_funds').upsert({
      user_id: testUserId,
      balance: 10000
    });
  });
  
  afterEach(async () => {
    // Cleanup test data
    await testSupabase.from('portfolios').delete().eq('user_id', testUserId);
  });
});
```

---

*This API documentation provides comprehensive guidance for integrating with the StockTrade Platform backend services. For additional support, refer to the Supabase documentation and the platform's technical documentation.*