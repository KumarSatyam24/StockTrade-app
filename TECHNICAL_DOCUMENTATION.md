# StockTrade Platform - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Feature Analysis](#feature-analysis)
5. [Database Schema](#database-schema)
6. [API Design](#api-design)
7. [Frontend Architecture](#frontend-architecture)
8. [Security Implementation](#security-implementation)
9. [Real-time Features](#real-time-features)
10. [Testing Strategy](#testing-strategy)
11. [Development Environment](#development-environment)
12. [Deployment](#deployment)
13. [Performance Considerations](#performance-considerations)
14. [Code Quality & Standards](#code-quality--standards)

## Project Overview

The StockTrade Platform is a full-stack web application designed for real-time stock trading and portfolio management. It provides users with comprehensive tools to monitor market data, execute trades, manage portfolios, and track financial performance.

### Key Capabilities
- Real-time stock price monitoring
- Portfolio management and analytics
- Trade execution with balance validation
- Funds management system
- Wishlist functionality
- Comprehensive transaction history
- PDF report generation
- Mobile-responsive design

## Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase       │    │   External      │
│   (React SPA)   │◄──►│   Backend        │◄──►│   Services      │
│                 │    │                  │    │                 │
│ • Components    │    │ • Database       │    │ • Market Data   │
│ • Contexts      │    │ • Auth           │    │ • PDF Gen       │
│ • Hooks         │    │ • Real-time      │    │                 │
│ • Services      │    │ • Storage        │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Architecture
```
App.tsx (Root)
├── AuthProvider (Context)
├── NotificationProvider (Context)
├── MarketProvider (Context)
└── Router
    ├── Layout (Protected Routes)
    │   ├── Dashboard
    │   ├── Portfolio
    │   ├── Wishlist
    │   ├── Funds
    │   └── Settings
    └── Login (Public Route)
```

## Technology Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI Framework |
| **TypeScript** | 5.2.2 | Type Safety |
| **Vite** | 6.3.1 | Build Tool & Dev Server |
| **Tailwind CSS** | 3.4.1 | Styling Framework |
| **React Router Dom** | 6.22.2 | Client-side Routing |
| **Lucide React** | 0.344.0 | Icon Library |
| **Zod** | 3.22.4 | Schema Validation |

### Backend Technologies
| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | Primary Database |
| **Row Level Security (RLS)** | Data Security |
| **Supabase Auth** | Authentication |
| **Supabase Realtime** | Real-time Updates |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code Linting |
| **Vitest** | Unit Testing |
| **Testing Library** | Component Testing |
| **MSW** | API Mocking |
| **Cypress** | E2E Testing |
| **Docker** | Containerization |

## Feature Analysis

### 1. Real-time Market Data
**Implementation:**
- `MarketContext` provides global market data state
- Polling mechanism (3-second intervals) for data updates
- Supabase real-time subscriptions for instant updates
- Optimistic UI updates for better user experience

**Key Files:**
- `src/contexts/MarketContext.tsx`
- `src/hooks/useMarketData.ts`
- `src/services/stocks.ts`

### 2. Portfolio Management
**Capabilities:**
- Real-time portfolio valuation
- Profit/Loss calculation with percentage tracking
- Average price calculation for multiple purchases
- Position sizing and risk management
- Performance analytics

**Implementation:**
- `usePortfolio` hook for data fetching
- `usePortfolioUpdates` hook for real-time updates
- Computed fields for P&L calculations
- Integration with market data for current valuations

### 3. Trade Execution System
**Features:**
- Buy/Sell order execution
- Balance validation before trade execution
- Automatic portfolio updates post-trade
- Transaction recording for audit trail
- Error handling and user feedback

**Validation Logic:**
```typescript
// Balance validation for buy orders
if (type === 'BUY' && totalValue > userBalance) {
  throw new Error('Insufficient funds');
}

// Position validation for sell orders
if (type === 'SELL' && quantity > currentHolding.quantity) {
  throw new Error('Insufficient shares');
}
```

### 4. Funds Management
**Capabilities:**
- Deposit/Withdrawal operations
- Transaction history tracking
- PDF statement generation
- Balance reconciliation
- Real-time balance updates

### 5. Search & Discovery
**Implementation:**
- Fuzzy search across company names, symbols, and sectors
- Real-time filtering with debouncing
- Keyboard navigation support
- Search result highlighting

### 6. Wishlist Functionality
**Features:**
- Personal stock tracking
- Quick access to favorite stocks
- Price alerts (planned feature)
- Easy trade execution from wishlist

## Database Schema

### Core Tables

#### 1. Profiles Table
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

#### 2. Portfolios Table
```sql
CREATE TABLE portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  stock_symbol text NOT NULL,
  quantity numeric NOT NULL CHECK (quantity >= 0),
  average_price numeric NOT NULL,
  current_price numeric,
  previous_day_price numeric,
  day_change numeric,
  day_change_percent numeric,
  profit_loss numeric,
  profit_loss_percentage numeric,
  last_price_update timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stock_symbol)
);
```

#### 3. Transactions Table
```sql
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  stock_symbol text NOT NULL,
  type text NOT NULL CHECK (type IN ('BUY', 'SELL')),
  quantity numeric NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price > 0),
  total numeric NOT NULL CHECK (total > 0),
  created_at timestamptz DEFAULT now()
);
```

#### 4. Stocks Table
```sql
CREATE TABLE stocks (
  symbol text PRIMARY KEY,
  name text NOT NULL,
  sector text,
  current_price numeric NOT NULL,
  previous_close numeric,
  day_change numeric,
  day_change_percent numeric,
  volume bigint,
  market_cap numeric,
  pe_ratio numeric,
  dividend_yield numeric,
  fifty_two_week_high numeric,
  fifty_two_week_low numeric,
  updated_at timestamptz DEFAULT now()
);
```

#### 5. User Funds Table
```sql
CREATE TABLE user_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
```

#### 6. Fund Transactions Table
```sql
CREATE TABLE fund_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL')),
  amount numeric NOT NULL CHECK (amount > 0),
  status text DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
  created_at timestamptz DEFAULT now()
);
```

#### 7. Wishlists Table
```sql
CREATE TABLE wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  stock_symbol text NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, stock_symbol)
);
```

### Database Relationships
```
profiles (1) ──── (M) portfolios
profiles (1) ──── (M) transactions
profiles (1) ──── (1) user_funds
profiles (1) ──── (M) fund_transactions
profiles (1) ──── (M) wishlists
stocks (1) ──── (M) portfolios
stocks (1) ──── (M) transactions
stocks (1) ──── (M) wishlists
```

## API Design

### Authentication Endpoints
```typescript
// Supabase Auth Integration
supabase.auth.signInWithOAuth({ provider: 'google' })
supabase.auth.signOut()
supabase.auth.getSession()
supabase.auth.onAuthStateChange()
```

### Stock Data APIs
```typescript
// Get all stocks
const getStocks = () => supabase.from('stocks').select('*').order('symbol')

// Get stocks by symbols
const getStocksBySymbols = (symbols: string[]) => 
  supabase.from('stocks').select('*').in('symbol', symbols)

// Get stock price history
const getPriceHistory = (symbol: string, period: string) =>
  supabase.from('price_history').select('*')
    .eq('symbol', symbol)
    .gte('timestamp', period)
```

### Portfolio APIs
```typescript
// Get user portfolio
const getPortfolio = (userId: string) =>
  supabase.from('portfolios').select('*').eq('user_id', userId)

// Update portfolio after trade
const updatePortfolio = (userId: string, symbol: string, data: PortfolioUpdate) =>
  supabase.from('portfolios').upsert({ user_id: userId, stock_symbol: symbol, ...data })
```

### Trading APIs
```typescript
// Execute trade
const executeTrade = async (trade: TradeRequest) => {
  const { data, error } = await supabase.rpc('execute_trade', {
    p_user_id: trade.userId,
    p_symbol: trade.symbol,
    p_type: trade.type,
    p_quantity: trade.quantity,
    p_price: trade.price
  })
}
```

## Frontend Architecture

### State Management Strategy

#### 1. React Context Architecture
```typescript
// Global state structure
interface AppState {
  auth: AuthState;      // User authentication
  market: MarketState;  // Real-time market data
  notifications: NotificationState; // User notifications
}

// Context providers hierarchy
<AuthProvider>
  <NotificationProvider>
    <MarketProvider>
      <App />
    </MarketProvider>
  </NotificationProvider>
</AuthProvider>
```

#### 2. Custom Hooks Pattern
```typescript
// Data fetching hooks
useStocks()           // All stock data
usePortfolio(user)    // User portfolio
useMarketData()       // Real-time market data
useWishlist(user)     // User wishlist

// Business logic hooks
usePortfolioUpdates() // Real-time portfolio updates
useTradeExecution()   // Trade execution logic
```

### Component Structure

#### 1. Layout Components
- `Layout.tsx` - Main application shell
- `Navigation` - App navigation
- `Sidebar` - Context-aware sidebar

#### 2. Feature Components
- `Dashboard/` - Market overview and trading
- `Portfolio/` - Portfolio management
- `Wishlist/` - Stock watchlist
- `Funds/` - Funds management

#### 3. UI Components
- `StockCard` - Individual stock display
- `TradeModal` - Trade execution interface
- `PriceHistoryChart` - Price visualization
- `Notification` - User feedback system

### Routing Architecture
```typescript
// Protected routes structure
<Routes>
  <Route path="/login" element={<Login />} />
  <Route element={<RequireAuth><Layout /></RequireAuth>}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/portfolio" element={<Portfolio />} />
    <Route path="/wishlist" element={<Wishlist />} />
    <Route path="/funds" element={<Funds />} />
    <Route path="/settings" element={<Settings />} />
  </Route>
</Routes>
```

## Security Implementation

### 1. Row Level Security (RLS)
```sql
-- Portfolio access policy
CREATE POLICY "Users can read own portfolio"
ON portfolios FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Transaction access policy  
CREATE POLICY "Users can read own transactions"
ON transactions FOR SELECT TO authenticated
USING (auth.uid() = user_id);
```

### 2. Authentication Security
- OAuth integration with Google
- JWT token management
- Automatic token refresh
- Session persistence with security
- PKCE flow for enhanced security

### 3. Data Validation
```typescript
// Zod schemas for runtime validation
const TradeSchema = z.object({
  symbol: z.string().min(1),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.number().min(1),
  price: z.number().min(0.01)
});
```

### 4. Environment Security
```typescript
// Environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}
```

## Real-time Features

### 1. Market Data Updates
```typescript
// Real-time subscription setup
const channel = supabase
  .channel('market-data')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'stocks'
  }, (payload) => {
    // Update market data state
    updateMarketData(payload.new);
  })
  .subscribe();
```

### 2. Portfolio Updates
```typescript
// Portfolio real-time updates
const portfolioChannel = supabase
  .channel(`portfolio-${userId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'portfolios',
    filter: `user_id=eq.${userId}`
  }, handlePortfolioUpdate)
  .subscribe();
```

### 3. Polling Fallback Strategy
```typescript
// Fallback polling for reliability
const POLLING_INTERVAL = 3000;
const pollInterval = setInterval(() => {
  fetchLatestData();
}, POLLING_INTERVAL);
```

## Testing Strategy

### 1. Unit Testing
- **Framework:** Vitest + Testing Library
- **Coverage:** Components, hooks, utilities
- **Mocking:** MSW for API calls

```typescript
// Example test structure
describe('TradeModal', () => {
  it('should validate insufficient funds', async () => {
    render(<TradeModal stock={mockStock} userBalance={100} />);
    
    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '10' }
    });
    
    expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument();
  });
});
```

### 2. Integration Testing
- API integration tests
- Database operation tests
- Authentication flow tests

### 3. E2E Testing
- **Framework:** Cypress
- **Scenarios:** Critical user journeys
- **Coverage:** Login → Trade → Portfolio update

### 4. Test Coverage Configuration
```typescript
// Vitest coverage config
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: ['node_modules/', 'dist/', '**/*.d.ts', 'test/']
}
```

## Development Environment

### 1. Local Setup
```bash
# Clone and install
git clone <repository-url>
cd stock-trading-platform
npm install

# Environment configuration
cp .env.example .env
# Add Supabase credentials

# Start development server
npm run dev
```

### 2. Docker Development
```dockerfile
# Development container
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev", "--", "--host"]
```

### 3. Available Scripts
```json
{
  "dev": "vite",                    // Development server
  "build": "tsc && vite build",     // Production build
  "test": "vitest",                 // Run tests
  "test:coverage": "vitest run --coverage",
  "test:e2e": "cypress run",        // E2E tests
  "lint": "eslint . --ext ts,tsx"   // Code linting
}
```

## Deployment

### 1. Production Build
```bash
# Build for production
npm run build

# Build outputs to dist/
# Static assets optimized
# TypeScript compiled
```

### 2. Environment Variables
```env
# Required for production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Deployment Platforms
- **Netlify** - Static hosting (current)
- **Vercel** - Alternative static hosting
- **Docker** - Containerized deployment

### 4. CI/CD Pipeline
```yaml
# GitHub Actions example
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - name: Deploy to Netlify
        # Deployment step
```

## Performance Considerations

### 1. Code Splitting
```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Portfolio = lazy(() => import('./pages/Portfolio'));

// Component lazy loading
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
  </Routes>
</Suspense>
```

### 2. State Management Optimization
- Context splitting to minimize re-renders
- Memoization for expensive calculations
- Debounced search functionality

### 3. Data Fetching Optimization
```typescript
// Optimized portfolio updates
const usePortfolioUpdates = (portfolio: Portfolio[]) => {
  return useMemo(() => {
    return portfolio.map(holding => ({
      ...holding,
      current_value: holding.quantity * holding.current_price,
      profit_loss: (holding.current_price - holding.average_price) * holding.quantity
    }));
  }, [portfolio, marketData]);
};
```

### 4. Bundle Optimization
- Tree shaking for unused code
- Asset optimization with Vite
- Lucide React icons optimized imports

## Code Quality & Standards

### 1. TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true
  }
}
```

### 2. ESLint Configuration
- React hooks rules
- TypeScript strict rules
- Import/export standards
- Accessibility rules

### 3. Code Organization
```
src/
├── components/     # Reusable UI components
│   ├── ui/        # Generic UI components
│   ├── dashboard/ # Feature-specific components
│   └── __tests__/ # Component tests
├── contexts/      # React Context providers
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries
├── pages/         # Route components
├── services/      # API services
├── types/         # TypeScript definitions
└── utils/         # Helper functions
```

### 4. Naming Conventions
- Components: PascalCase (`StockCard.tsx`)
- Hooks: camelCase starting with 'use' (`usePortfolio.ts`)
- Types: PascalCase (`Portfolio`, `TradeRequest`)
- Constants: SCREAMING_SNAKE_CASE (`POLLING_INTERVAL`)

### 5. Documentation Standards
- JSDoc comments for complex functions
- README files for major features
- Type definitions as documentation
- Inline comments for business logic

## Future Enhancements

### Planned Features
1. **Advanced Charting**
   - Technical indicators
   - Multiple timeframes
   - Drawing tools

2. **Options Trading**
   - Options chain display
   - Greeks calculation
   - Strategy builder

3. **Social Features**
   - Discussion forums
   - Trade sharing
   - Leaderboards

4. **Advanced Analytics**
   - Performance benchmarking
   - Risk analysis
   - Tax reporting

5. **Mobile App**
   - React Native implementation
   - Push notifications
   - Offline capability

### Technical Improvements
1. **Performance**
   - Virtual scrolling for large lists
   - Service worker for caching
   - CDN integration

2. **Architecture**
   - Micro-frontend architecture
   - GraphQL integration
   - Event-driven architecture

3. **Testing**
   - Visual regression testing
   - Performance testing
   - Automated accessibility testing

---

*This technical documentation provides a comprehensive overview of the StockTrade Platform's architecture, implementation details, and development practices. For specific implementation questions, refer to the source code and inline documentation.*