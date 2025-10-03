# Feature Documentation - StockTrade Platform

## Table of Contents
1. [Dashboard & Market Overview](#dashboard--market-overview)
2. [Portfolio Management](#portfolio-management)
3. [Trading System](#trading-system)
4. [Funds Management](#funds-management)
5. [Wishlist Functionality](#wishlist-functionality)
6. [Search & Discovery](#search--discovery)
7. [Real-time Updates](#real-time-updates)
8. [Authentication & Security](#authentication--security)
9. [Notification System](#notification-system)
10. [Reporting & Analytics](#reporting--analytics)

## Dashboard & Market Overview

### Purpose
The Dashboard serves as the central hub for users to monitor market conditions, discover stocks, and initiate trades. It provides a comprehensive view of market data with real-time updates.

### Key Features

#### 1. Market Overview Cards
```typescript
// Market summary statistics
interface MarketOverviewData {
  totalStocks: number;
  gainers: number;
  losers: number;
  unchangedStocks: number;
  topGainer: StockData;
  topLoser: StockData;
}
```

**Features:**
- Real-time market statistics
- Top gainers and losers identification
- Market sentiment indicators
- Quick market health assessment

#### 2. Stock Discovery Interface
- **Grid View**: Visual card-based layout for stock browsing
- **Table View**: Detailed tabular data for comprehensive analysis
- **Toggle Switching**: Seamless view mode transitions

#### 3. Stock Selection & Details
```typescript
interface StockDetailsProps {
  stock: IndianStock;
  onTradeClick: (stock: IndianStock) => void;
}
```

**Components:**
- `StockDetails`: Comprehensive stock information panel
- Real-time price updates
- Historical performance metrics
- Quick trade access

### User Experience Flow
1. **Landing**: User arrives at dashboard with market overview
2. **Discovery**: Browse stocks using grid/table views
3. **Selection**: Click stock to view detailed information
4. **Action**: Execute trades or add to wishlist

### Technical Implementation

#### State Management
```typescript
const Dashboard = () => {
  const [selectedStock, setSelectedStock] = useState<IndianStock | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { stocks, loading, error } = useStocks();
  const { marketData } = useMarket();
};
```

#### Real-time Data Integration
```typescript
// Merge real-time data with base stock data
const enrichedStocks = stocks.map(stock => ({
  ...stock,
  current_price: marketData[stock.symbol]?.price || stock.current_price,
  day_change: marketData[stock.symbol]?.change || stock.day_change,
  day_change_percent: marketData[stock.symbol]?.changePercent || stock.day_change_percent
}));
```

## Portfolio Management

### Overview
The Portfolio Management system provides comprehensive tools for tracking investments, analyzing performance, and managing positions across multiple stocks.

### Core Features

#### 1. Portfolio Holdings Display
```typescript
interface PortfolioHolding {
  id: string;
  user_id: string;
  stock_symbol: string;
  quantity: number;
  average_price: number;
  current_price: number;
  profit_loss: number;
  profit_loss_percentage: number;
  day_change: number;
  day_change_percent: number;
}
```

#### 2. Performance Analytics
- **Total Investment**: Sum of all positions at average cost
- **Current Value**: Real-time portfolio valuation
- **Profit/Loss**: Absolute and percentage gains/losses
- **Day Performance**: Daily portfolio change tracking

#### 3. Position Management
```typescript
// Portfolio summary calculations
const portfolioSummary = {
  totalInvestment: holdings.reduce((sum, h) => sum + (h.quantity * h.average_price), 0),
  currentValue: holdings.reduce((sum, h) => sum + (h.quantity * h.current_price), 0),
  totalProfitLoss: holdings.reduce((sum, h) => sum + h.profit_loss, 0),
  dayChange: holdings.reduce((sum, h) => sum + (h.quantity * h.day_change), 0)
};
```

### Features in Detail

#### Portfolio Header Component
```typescript
interface PortfolioHeaderProps {
  totalInvestment: number;
  currentValue: number;
  totalProfitLoss: number;
  dayChange?: number;
}
```

**Displays:**
- Total portfolio value with color-coded P&L
- Investment vs current value comparison
- Overall portfolio performance metrics
- Day-over-day change tracking

#### Portfolio Table Component
```typescript
interface PortfolioTableProps {
  holdings: PortfolioHolding[];
  onTradeSuccess: () => void;
}
```

**Features:**
- Sortable columns (symbol, quantity, value, P&L)
- Individual stock performance tracking
- Quick trade access from holdings
- Position-specific actions (sell, add more)

#### Real-time Updates Integration
```typescript
const usePortfolioUpdates = (initialPortfolio: Portfolio[]) => {
  const { marketData } = useMarket();
  
  return useMemo(() => {
    return initialPortfolio.map(holding => ({
      ...holding,
      current_price: marketData[holding.stock_symbol]?.price || holding.current_price,
      profit_loss: (marketData[holding.stock_symbol]?.price || holding.current_price - holding.average_price) * holding.quantity
    }));
  }, [initialPortfolio, marketData]);
};
```

### Performance Calculations

#### Average Price Calculation (Multiple Purchases)
```typescript
const calculateNewAveragePrice = (
  currentQuantity: number,
  currentAvgPrice: number,
  newQuantity: number,
  newPrice: number
): number => {
  const totalCost = (currentQuantity * currentAvgPrice) + (newQuantity * newPrice);
  const totalQuantity = currentQuantity + newQuantity;
  return totalCost / totalQuantity;
};
```

#### Profit/Loss Calculation
```typescript
const calculateProfitLoss = (
  quantity: number,
  averagePrice: number,
  currentPrice: number
) => ({
  absolutePL: (currentPrice - averagePrice) * quantity,
  percentagePL: ((currentPrice - averagePrice) / averagePrice) * 100
});
```

## Trading System

### Architecture Overview
The trading system handles buy/sell operations with comprehensive validation, balance management, and transaction recording.

### Core Components

#### 1. Trade Modal Interface
```typescript
interface TradeModalProps {
  stock: IndianStock;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: 'BUY' | 'SELL';
}
```

#### 2. Trade Validation System
```typescript
interface TradeValidation {
  hasSufficientFunds: boolean;
  hasSufficientShares: boolean;
  isValidQuantity: boolean;
  isValidPrice: boolean;
  errorMessage?: string;
}
```

### Trading Flow

#### Buy Order Process
1. **Input Validation**
   - Quantity > 0
   - Valid numeric inputs
   - Market hours validation (future enhancement)

2. **Balance Check**
   ```typescript
   const validateBuyOrder = (quantity: number, price: number, balance: number) => {
     const totalCost = quantity * price;
     if (totalCost > balance) {
       throw new Error('Insufficient funds');
     }
     return true;
   };
   ```

3. **Execution**
   - Deduct funds from user balance
   - Update/create portfolio position
   - Record transaction
   - Send confirmation

#### Sell Order Process
1. **Position Validation**
   ```typescript
   const validateSellOrder = (quantity: number, currentHolding: number) => {
     if (quantity > currentHolding) {
       throw new Error('Insufficient shares');
     }
     return true;
   };
   ```

2. **Execution**
   - Add funds to user balance
   - Update/remove portfolio position
   - Record transaction
   - Send confirmation

### Trade Execution Engine
```typescript
interface TradeRequest {
  user: User;
  stock: IndianStock;
  quantity: number;
  type: 'BUY' | 'SELL';
}

const executeTrade = async (trade: TradeRequest) => {
  // Pre-trade validation
  await validateTrade(trade);
  
  // Execute in transaction
  const result = await supabase.rpc('execute_trade', {
    p_user_id: trade.user.id,
    p_symbol: trade.stock.symbol,
    p_type: trade.type,
    p_quantity: trade.quantity,
    p_price: trade.stock.current_price
  });
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result.data;
};
```

### Error Handling & Recovery
```typescript
enum TradeError {
  INSUFFICIENT_FUNDS = 'Insufficient funds for purchase',
  INSUFFICIENT_SHARES = 'Not enough shares to sell',
  INVALID_QUANTITY = 'Quantity must be positive',
  MARKET_CLOSED = 'Trading not available',
  SYSTEM_ERROR = 'System temporarily unavailable'
}

const handleTradeError = (error: TradeError) => {
  switch (error) {
    case TradeError.INSUFFICIENT_FUNDS:
      // Redirect to funds management
      navigate('/funds');
      break;
    case TradeError.INSUFFICIENT_SHARES:
      // Show current holdings
      showPortfolioModal();
      break;
    // ... other error handlers
  }
};
```

## Funds Management

### System Overview
The funds management system handles deposits, withdrawals, and balance tracking with complete transaction audit trails.

### Core Features

#### 1. Balance Management
```typescript
interface UserFunds {
  id: string;
  user_id: string;
  balance: number;
  updated_at: string;
}
```

#### 2. Transaction Processing
```typescript
interface FundTransaction {
  id: string;
  user_id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: string;
}
```

### Fund Operations

#### Deposit Process
```typescript
const processDeposit = async (userId: string, amount: number) => {
  // Validate amount
  if (amount <= 0) {
    throw new Error('Invalid deposit amount');
  }
  
  // Record transaction
  const transaction = await recordFundTransaction({
    userId,
    type: 'DEPOSIT',
    amount,
    status: 'PENDING'
  });
  
  // Process payment (integration point for payment gateway)
  const paymentResult = await processPayment(amount);
  
  if (paymentResult.success) {
    // Update balance
    await updateUserBalance(userId, amount, 'ADD');
    
    // Update transaction status
    await updateTransactionStatus(transaction.id, 'COMPLETED');
  } else {
    await updateTransactionStatus(transaction.id, 'FAILED');
    throw new Error('Payment processing failed');
  }
};
```

#### Withdrawal Process
```typescript
const processWithdrawal = async (userId: string, amount: number) => {
  // Check sufficient balance
  const currentBalance = await getUserBalance(userId);
  if (amount > currentBalance) {
    throw new Error('Insufficient balance');
  }
  
  // Record transaction
  const transaction = await recordFundTransaction({
    userId,
    type: 'WITHDRAWAL',
    amount,
    status: 'PENDING'
  });
  
  try {
    // Update balance
    await updateUserBalance(userId, amount, 'SUBTRACT');
    
    // Process bank transfer (future enhancement)
    // await processBankTransfer(amount, userBankDetails);
    
    await updateTransactionStatus(transaction.id, 'COMPLETED');
  } catch (error) {
    await updateTransactionStatus(transaction.id, 'FAILED');
    throw error;
  }
};
```

### PDF Statement Generation
```typescript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const generateStatement = (transactions: FundTransaction[], userInfo: UserInfo) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Fund Statement', 20, 20);
  
  // User info
  doc.setFontSize(12);
  doc.text(`Account: ${userInfo.email}`, 20, 40);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
  
  // Transaction table
  const tableData = transactions.map(t => [
    t.created_at,
    t.type,
    `₹${t.amount.toFixed(2)}`,
    t.status
  ]);
  
  (doc as any).autoTable({
    head: [['Date', 'Type', 'Amount', 'Status']],
    body: tableData,
    startY: 70
  });
  
  return doc;
};
```

## Wishlist Functionality

### Overview
The wishlist feature allows users to track stocks of interest for future trading decisions and portfolio planning.

### Core Features

#### 1. Wishlist Management
```typescript
interface WishlistItem {
  id: string;
  user_id: string;
  stock_symbol: string;
  added_at: string;
  stock: {
    name: string;
    sector: string;
    current_price: number;
    day_change: number;
    day_change_percent: number;
  };
}
```

#### 2. Quick Actions
- Add/Remove stocks from wishlist
- Quick trade execution from wishlist
- Price monitoring and alerts (planned)
- Performance tracking

### Implementation Details

#### Add to Wishlist
```typescript
const addToWishlist = async (stockSymbol: string) => {
  try {
    const { error } = await supabase
      .from('wishlists')
      .insert({
        user_id: user.id,
        stock_symbol: stockSymbol
      });
    
    if (error) throw error;
    showNotification('success', `${stockSymbol} added to wishlist`);
  } catch (error) {
    if (error.code === '23505') { // Duplicate key
      showNotification('info', 'Stock already in wishlist');
    } else {
      showNotification('error', 'Failed to add to wishlist');
    }
  }
};
```

#### Wishlist Display Component
```typescript
const WishlistTable = ({ items, onRemove, onTrade }: WishlistTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="border-b border-gray-200">
            <th>Symbol</th>
            <th>Company</th>
            <th>Sector</th>
            <th>Price</th>
            <th>Change</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <WishlistRow
              key={item.id}
              item={item}
              onRemove={onRemove}
              onTrade={onTrade}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Future Enhancements
- Price alerts and notifications
- Watchlist performance analytics
- Social sharing of wishlists
- Automated trading triggers

## Search & Discovery

### Search Architecture
The search system provides intelligent stock discovery with multiple search criteria and real-time filtering.

### Search Implementation
```typescript
interface SearchBarProps {
  stocks: IndianStock[];
  onSelect: (stock: IndianStock) => void;
  placeholder?: string;
}

const SearchBar = ({ stocks, onSelect, placeholder }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const filteredStocks = useMemo(() => {
    if (!query.trim()) return [];
    
    return stocks
      .filter(stock =>
        stock.name.toLowerCase().includes(query.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.sector?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10); // Limit results
  }, [stocks, query]);
  
  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="search-input"
      />
      {isOpen && filteredStocks.length > 0 && (
        <SearchResults stocks={filteredStocks} onSelect={onSelect} />
      )}
    </div>
  );
};
```

### Search Features
- **Multi-field Search**: Company name, symbol, sector
- **Real-time Filtering**: Instant results as user types
- **Keyboard Navigation**: Arrow keys and Enter support
- **Result Highlighting**: Matched text emphasis
- **Quick Selection**: Click or keyboard selection

### Advanced Search (Future Enhancement)
```typescript
interface AdvancedSearchFilters {
  priceRange: [number, number];
  sectors: string[];
  marketCap: 'small' | 'mid' | 'large';
  performance: 'gainer' | 'loser' | 'neutral';
  volume: 'high' | 'medium' | 'low';
}
```

## Real-time Updates

### Real-time Architecture
The platform uses Supabase Real-time for instant data updates across all connected clients.

### Implementation Strategy

#### 1. Market Data Subscriptions
```typescript
const useMarketData = () => {
  const [marketData, setMarketData] = useState<MarketData>({});
  
  useEffect(() => {
    // Subscribe to stock price updates
    const channel = supabase
      .channel('market-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'stocks'
      }, (payload) => {
        setMarketData(prev => ({
          ...prev,
          [payload.new.symbol]: {
            price: payload.new.current_price,
            change: payload.new.day_change,
            changePercent: payload.new.day_change_percent,
            timestamp: new Date().toISOString()
          }
        }));
      })
      .subscribe();
    
    return () => channel.unsubscribe();
  }, []);
  
  return { marketData };
};
```

#### 2. Portfolio Updates
```typescript
const usePortfolioRealtime = (userId: string) => {
  const [updates, setUpdates] = useState<PortfolioUpdate[]>([]);
  
  useEffect(() => {
    const channel = supabase
      .channel(`portfolio-${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'portfolios',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        setUpdates(prev => [...prev, {
          type: payload.eventType,
          data: payload.new || payload.old,
          timestamp: new Date().toISOString()
        }]);
      })
      .subscribe();
    
    return () => channel.unsubscribe();
  }, [userId]);
  
  return updates;
};
```

#### 3. Polling Fallback Strategy
```typescript
const usePollingFallback = (fetchFunction: () => Promise<void>, interval = 5000) => {
  useEffect(() => {
    const pollInterval = setInterval(fetchFunction, interval);
    return () => clearInterval(pollInterval);
  }, [fetchFunction, interval]);
};
```

### Real-time Features
- **Live Price Updates**: Stock prices update instantly
- **Portfolio Valuation**: Real-time P&L calculations
- **Trade Confirmations**: Instant trade status updates
- **Balance Updates**: Immediate balance changes
- **Notification System**: Real-time alerts and messages

### Performance Considerations
- **Debounced Updates**: Prevent excessive re-renders
- **Selective Subscriptions**: Subscribe only to relevant data
- **Connection Management**: Automatic reconnection handling
- **Bandwidth Optimization**: Efficient data payload design

## Authentication & Security

### Authentication System
The platform uses Supabase Auth with OAuth integration for secure user authentication.

### Implementation Details

#### 1. Auth Context Provider
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 2. Protected Routes
```typescript
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};
```

### Security Features

#### 1. Row Level Security (RLS)
```sql
-- Portfolio security
CREATE POLICY "Users can only access own portfolio"
ON portfolios FOR ALL TO authenticated
USING (auth.uid() = user_id);

-- Transaction security
CREATE POLICY "Users can only access own transactions"
ON transactions FOR ALL TO authenticated
USING (auth.uid() = user_id);
```

#### 2. Data Validation
```typescript
// Runtime validation with Zod
const TradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.number().min(1, 'Quantity must be positive'),
  price: z.number().min(0.01, 'Price must be positive')
});

const validateTrade = (data: unknown) => {
  return TradeSchema.parse(data);
};
```

#### 3. Session Management
```typescript
const useSecureSession = () => {
  const [sessionValid, setSessionValid] = useState(true);
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setSessionValid(false);
        return;
      }
      
      // Check if session is about to expire (within 5 minutes)
      const expiresAt = new Date(session.expires_at! * 1000);
      const now = new Date();
      const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60);
      
      if (minutesUntilExpiry < 5) {
        // Refresh session
        await supabase.auth.refreshSession();
      }
    };
    
    // Check session every minute
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);
  
  return { sessionValid };
};
```

## Notification System

### Overview
The notification system provides user feedback for all actions, errors, and important updates throughout the platform.

### Implementation
```typescript
interface NotificationContextType {
  notifications: Notification[];
  showNotification: (type: NotificationType, message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
  timestamp: Date;
}
```

### Notification Provider
```typescript
const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const showNotification = useCallback((
    type: NotificationType,
    message: string,
    duration = 5000
  ) => {
    const notification: Notification = {
      id: generateId(),
      type,
      message,
      duration,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification
    setTimeout(() => {
      removeNotification(notification.id);
    }, duration);
  }, []);
  
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  return (
    <NotificationContext.Provider value={{
      notifications,
      showNotification,
      removeNotification
    }}>
      {children}
      <NotificationContainer notifications={notifications} />
    </NotificationContext.Provider>
  );
};
```

### Notification Types & Usage

#### Success Notifications
- Trade execution confirmations
- Successful fund operations
- Account updates

#### Error Notifications
- Trade failures (insufficient funds, etc.)
- Network connectivity issues
- Validation errors

#### Warning Notifications
- Account balance low
- Market volatility alerts
- Session expiry warnings

#### Info Notifications
- Market status updates
- Feature announcements
- General information

### Notification Component
```typescript
const NotificationItem = ({ notification, onRemove }: NotificationItemProps) => {
  const getNotificationStyles = (type: NotificationType) => {
    const baseStyles = "p-4 rounded-lg shadow-lg flex items-center justify-between";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border border-yellow-200 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50 border border-blue-200 text-blue-800`;
    }
  };
  
  return (
    <div className={getNotificationStyles(notification.type)}>
      <div className="flex items-center">
        <NotificationIcon type={notification.type} />
        <span className="ml-3">{notification.message}</span>
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
```

## Reporting & Analytics

### Overview
The platform provides comprehensive reporting and analytics features for portfolio performance, trade history, and financial statements.

### Report Types

#### 1. Portfolio Performance Report
```typescript
interface PortfolioReport {
  summary: {
    totalInvestment: number;
    currentValue: number;
    totalProfitLoss: number;
    profitLossPercentage: number;
    dayChange: number;
    dayChangePercentage: number;
  };
  holdings: PortfolioHolding[];
  performance: {
    bestPerformer: string;
    worstPerformer: string;
    sectorAllocation: SectorAllocation[];
  };
  generatedAt: string;
}
```

#### 2. Transaction History Report
```typescript
interface TransactionReport {
  transactions: Transaction[];
  summary: {
    totalTrades: number;
    buyTrades: number;
    sellTrades: number;
    totalVolume: number;
    averageTradeSize: number;
  };
  period: {
    from: string;
    to: string;
  };
}
```

### PDF Generation
```typescript
const generatePortfolioReport = (data: PortfolioReport) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Portfolio Report', 20, 20);
  
  // Summary section
  doc.setFontSize(14);
  doc.text('Portfolio Summary', 20, 40);
  
  const summaryData = [
    ['Total Investment', `₹${data.summary.totalInvestment.toLocaleString()}`],
    ['Current Value', `₹${data.summary.currentValue.toLocaleString()}`],
    ['Total P&L', `₹${data.summary.totalProfitLoss.toLocaleString()}`],
    ['P&L %', `${data.summary.profitLossPercentage.toFixed(2)}%`]
  ];
  
  (doc as any).autoTable({
    body: summaryData,
    startY: 50,
    theme: 'grid'
  });
  
  // Holdings table
  const holdingsData = data.holdings.map(h => [
    h.stock_symbol,
    h.quantity.toString(),
    `₹${h.average_price.toFixed(2)}`,
    `₹${h.current_price.toFixed(2)}`,
    `₹${h.profit_loss.toFixed(2)}`
  ]);
  
  (doc as any).autoTable({
    head: [['Symbol', 'Qty', 'Avg Price', 'Current Price', 'P&L']],
    body: holdingsData,
    startY: doc.lastAutoTable.finalY + 20
  });
  
  return doc;
};
```

### Analytics Features

#### 1. Performance Tracking
- Portfolio value over time
- Individual stock performance
- Sector-wise allocation
- Risk-return analysis

#### 2. Trade Analytics
- Trade frequency analysis
- Average trade size
- Success rate tracking
- Cost basis analysis

#### 3. Market Insights
- Top gainers/losers
- Sector performance
- Market trends
- Volatility indicators

### Future Enhancements
- Interactive charts and graphs
- Benchmark comparisons
- Tax optimization reports
- Risk assessment tools
- Performance attribution analysis

---

*This feature documentation provides comprehensive coverage of all platform capabilities, implementation details, and user experience flows. Each feature is designed with scalability, security, and user experience in mind.*