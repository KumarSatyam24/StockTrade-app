# Deployment & Infrastructure Guide - StockTrade Platform

## Table of Contents
1. [Infrastructure Overview](#infrastructure-overview)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Production Deployment](#production-deployment)
5. [Database Management](#database-management)
6. [Monitoring & Logging](#monitoring--logging)
7. [Security Configuration](#security-configuration)
8. [Performance Optimization](#performance-optimization)
9. [Backup & Recovery](#backup--recovery)
10. [Troubleshooting Guide](#troubleshooting-guide)

## Infrastructure Overview

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                     Client Tier                             │
├─────────────────────────────────────────────────────────────┤
│ React SPA (Vite) → CDN/Static Hosting (Netlify/Vercel)    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Application Tier                           │
├─────────────────────────────────────────────────────────────┤
│ Supabase Backend Services                                   │
│ ├── Authentication (Google OAuth)                          │
│ ├── Real-time Subscriptions                               │
│ ├── REST API Gateway                                       │
│ └── Edge Functions (Future)                               │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Tier                                 │
├─────────────────────────────────────────────────────────────┤
│ PostgreSQL Database (Supabase Managed)                     │
│ ├── User Data (Profiles, Portfolios, Transactions)        │
│ ├── Market Data (Stocks, Price History)                   │
│ ├── Real-time Subscriptions                               │
│ └── Row Level Security (RLS)                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Summary
| Component | Technology | Environment |
|-----------|------------|-------------|
| **Frontend** | React 18 + TypeScript + Vite | Static Hosting |
| **Backend** | Supabase (BaaS) | Cloud Managed |
| **Database** | PostgreSQL | Supabase Managed |
| **Authentication** | Supabase Auth + OAuth | Cloud Managed |
| **Real-time** | Supabase Realtime | WebSocket |
| **File Storage** | Supabase Storage | Cloud Object Store |
| **CDN** | Netlify/Vercel CDN | Global Edge Network |

## Environment Setup

### Environment Variables Configuration

#### Development Environment (`.env.development`)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Configuration
VITE_APP_NAME=StockTrade Platform
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_DEBUG=true
VITE_ENABLE_MOCK_DATA=false

# External Services (Development)
VITE_ANALYTICS_ID=dev-analytics-id
```

#### Production Environment (`.env.production`)
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://prod-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key-here

# Application Configuration
VITE_APP_NAME=StockTrade Platform
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Feature Flags
VITE_ENABLE_DEBUG=false
VITE_ENABLE_MOCK_DATA=false

# External Services (Production)
VITE_ANALYTICS_ID=prod-analytics-id
VITE_SENTRY_DSN=https://your-sentry-dsn
```

### Environment Validation
```typescript
// src/lib/env.ts
const validateEnvironment = () => {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate URL format
  try {
    new URL(import.meta.env.VITE_SUPABASE_URL);
  } catch {
    throw new Error('Invalid VITE_SUPABASE_URL format');
  }
};

// Call during app initialization
validateEnvironment();
```

## Local Development

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm 8+ or yarn 1.22+
- Git
- Code editor (VS Code recommended)

### Development Setup
```bash
# Clone repository
git clone https://github.com/your-org/stocktrade-app.git
cd stocktrade-app

# Install dependencies
npm install

# Setup environment
cp .env.example .env.development
# Edit .env.development with your Supabase credentials

# Start development server
npm run dev
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "vite --mode development",
    "build": "vite build --mode production",
    "preview": "vite preview",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit"
  }
}
```

### Docker Development Environment
```dockerfile
# Dockerfile.dev
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose development port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    command: npm run dev -- --host 0.0.0.0
```

### Development Workflow
1. **Feature Development**
   ```bash
   # Create feature branch
   git checkout -b feature/new-feature
   
   # Make changes and test
   npm run test
   npm run lint
   
   # Commit changes
   git add .
   git commit -m "feat: add new feature"
   
   # Push and create PR
   git push origin feature/new-feature
   ```

2. **Testing Strategy**
   ```bash
   # Run all tests
   npm run test
   
   # Run tests with coverage
   npm run test:coverage
   
   # Run tests in watch mode
   npm run test:watch
   
   # Run specific test file
   npm run test -- StockCard.test.tsx
   ```

## Production Deployment

### Build Configuration

#### Vite Production Config
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'esbuild' : false,
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react']
        }
      }
    },
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  },
  
  // Production optimizations
  define: mode === 'production' ? {
    'console.log': '(() => {})',
    'console.warn': '(() => {})',
    'console.error': '(() => {})'
  } : {}
}));
```

### Deployment Platforms

#### 1. Netlify Deployment
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_SUPABASE_URL = "https://prod-project.supabase.co"
  VITE_SUPABASE_ANON_KEY = "prod-anon-key"

[context.deploy-preview.environment]
  VITE_SUPABASE_URL = "https://staging-project.supabase.co"
  VITE_SUPABASE_ANON_KEY = "staging-anon-key"
```

#### 2. Vercel Deployment
```json
// vercel.json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url-prod",
    "VITE_SUPABASE_ANON_KEY": "@supabase-key-prod"
  }
}
```

#### 3. Docker Production Deployment
```dockerfile
# Dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security for sensitive files
    location ~ /\. {
        deny all;
    }
}
```

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run type checking
        run: npm run type-check
        
      - name: Run linting
        run: npm run lint
        
      - name: Run tests
        run: npm run test:coverage
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
          
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './dist'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Database Management

### Supabase Configuration

#### Database Schema Management
```sql
-- Migration versioning
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Track migration application
INSERT INTO schema_migrations (version) VALUES ('20231201_initial_schema');
```

#### Backup Configuration
```sql
-- Enable Point-in-Time Recovery
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 3;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'test ! -f /backup/archive/%f && cp %p /backup/archive/%f';

-- Create backup script
CREATE OR REPLACE FUNCTION backup_database()
RETURNS VOID AS $$
BEGIN
  PERFORM pg_start_backup('daily_backup');
  -- Backup logic here
  PERFORM pg_stop_backup();
END;
$$ LANGUAGE plpgsql;

-- Schedule daily backups
SELECT cron.schedule('daily-backup', '0 2 * * *', 'SELECT backup_database();');
```

#### Performance Optimization
```sql
-- Create indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX CONCURRENTLY idx_transactions_user_id_date ON transactions(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_stocks_symbol ON stocks(symbol);
CREATE INDEX CONCURRENTLY idx_wishlists_user_symbol ON wishlists(user_id, stock_symbol);

-- Optimize for real-time subscriptions
CREATE INDEX CONCURRENTLY idx_portfolios_updated_at ON portfolios(updated_at);
CREATE INDEX CONCURRENTLY idx_stocks_updated_at ON stocks(updated_at);

-- Partial indexes for active records
CREATE INDEX CONCURRENTLY idx_active_portfolios ON portfolios(user_id) WHERE quantity > 0;
```

### Database Monitoring
```sql
-- Monitor query performance
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Monitoring & Logging

### Application Monitoring

#### Performance Monitoring Setup
```typescript
// src/lib/monitoring.ts
import { Analytics } from '@segment/analytics-node';

class ApplicationMonitor {
  private analytics: Analytics;
  
  constructor() {
    this.analytics = new Analytics({
      writeKey: import.meta.env.VITE_SEGMENT_WRITE_KEY!
    });
  }
  
  // Track user actions
  trackEvent(event: string, properties?: Record<string, any>) {
    if (import.meta.env.PROD) {
      this.analytics.track({
        userId: this.getCurrentUserId(),
        event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          app_version: import.meta.env.VITE_APP_VERSION
        }
      });
    }
  }
  
  // Track performance metrics
  trackPerformance(metric: string, value: number) {
    this.trackEvent('Performance Metric', {
      metric,
      value,
      url: window.location.pathname
    });
  }
  
  // Track errors
  trackError(error: Error, context?: Record<string, any>) {
    console.error('Application Error:', error);
    
    this.trackEvent('Application Error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context
    });
  }
  
  private getCurrentUserId(): string | undefined {
    // Get from auth context or local storage
    return localStorage.getItem('user_id') || undefined;
  }
}

export const monitor = new ApplicationMonitor();
```

#### Error Boundary Implementation
```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { monitor } from '../lib/monitoring';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    monitor.trackError(error, {
      component_stack: errorInfo.componentStack,
      error_boundary: true
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-800">
                  Something went wrong
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  We've been notified about this error and are working to fix it.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Logging Strategy
```typescript
// src/lib/logger.ts
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class Logger {
  private level: LogLevel;
  
  constructor() {
    this.level = import.meta.env.PROD ? LogLevel.ERROR : LogLevel.DEBUG;
  }
  
  error(message: string, ...args: any[]) {
    if (this.level >= LogLevel.ERROR) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
      monitor.trackError(new Error(message), { args });
    }
  }
  
  warn(message: string, ...args: any[]) {
    if (this.level >= LogLevel.WARN) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
  
  info(message: string, ...args: any[]) {
    if (this.level >= LogLevel.INFO) {
      console.info(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
  
  debug(message: string, ...args: any[]) {
    if (this.level >= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
```

## Security Configuration

### Content Security Policy
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-eval' https://accounts.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  frame-src https://accounts.google.com;
">
```

### Environment Security
```typescript
// src/lib/security.ts
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Validate environment in production
export const validateProductionEnvironment = () => {
  if (import.meta.env.PROD) {
    // Ensure HTTPS in production
    if (window.location.protocol !== 'https:') {
      window.location.replace(`https:${window.location.href.substring(window.location.protocol.length)}`);
    }
    
    // Validate Supabase URL is HTTPS
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl.startsWith('https://')) {
      throw new Error('Supabase URL must use HTTPS in production');
    }
  }
};
```

### API Security
```typescript
// src/lib/apiSecurity.ts
export const createSecureSupabaseClient = () => {
  const client = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce' // Enhanced security for OAuth
      },
      global: {
        headers: {
          'X-Client-Info': `stocktrade-web-${import.meta.env.VITE_APP_VERSION}`,
          ...securityHeaders
        }
      },
      db: {
        schema: 'public'
      }
    }
  );
  
  // Add request interceptor for additional security
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // Clear sensitive data from memory/storage
      clearSensitiveData();
    }
  });
  
  return client;
};

const clearSensitiveData = () => {
  // Clear any cached sensitive data
  localStorage.removeItem('portfolio_cache');
  sessionStorage.clear();
};
```

## Performance Optimization

### Bundle Optimization
```typescript
// vite.config.ts - Performance optimizations
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('@supabase')) return 'supabase-vendor';
            if (id.includes('lucide-react')) return 'icons-vendor';
            return 'vendor';
          }
          
          // Feature-based chunks
          if (id.includes('/pages/')) return 'pages';
          if (id.includes('/components/')) return 'components';
        }
      }
    },
    
    // Optimize chunk loading
    chunkSizeWarningLimit: 1000,
    
    // Enable compression
    reportCompressedSize: true
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['lucide-react'] // Tree-shakeable
  }
});
```

### Runtime Performance
```typescript
// src/lib/performance.ts
export class PerformanceOptimizer {
  // Debounce utility for search/filtering
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }
  
  // Throttle utility for scroll/resize events
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, delay);
      }
    };
  }
  
  // Measure component render time
  static measureRenderTime(componentName: string) {
    return function<T extends (...args: any[]) => any>(
      target: any,
      propertyName: string,
      descriptor: TypedPropertyDescriptor<T>
    ) {
      const method = descriptor.value!;
      descriptor.value = ((...args: any[]) => {
        const start = performance.now();
        const result = method.apply(this, args);
        const end = performance.now();
        
        monitor.trackPerformance(`${componentName}.${propertyName}`, end - start);
        
        return result;
      }) as any;
    };
  }
}

// Usage in components
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

### Caching Strategy
```typescript
// src/lib/cache.ts
export class CacheManager {
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  
  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Cache with automatic refresh
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl = this.DEFAULT_TTL
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) return cached;
    
    const data = await fetchFn();
    this.set(key, data, ttl);
    return data;
  }
}

export const cache = new CacheManager();
```

## Backup & Recovery

### Automated Backup Strategy
```bash
#!/bin/bash
# scripts/backup.sh

# Database backup
echo "Starting database backup..."
supabase db dump --db-url $DATABASE_URL --file "backup/db_$(date +%Y%m%d_%H%M%S).sql"

# File storage backup (if applicable)
echo "Backing up file storage..."
# Add file storage backup commands

# Upload to S3 or other cloud storage
echo "Uploading backup to cloud storage..."
# aws s3 cp backup/ s3://your-backup-bucket/stocktrade/$(date +%Y%m%d)/ --recursive

echo "Backup completed successfully"
```

### Recovery Procedures
```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: ./restore.sh <backup_file>"
    exit 1
fi

echo "Starting database restore from $BACKUP_FILE..."

# Restore database
supabase db reset --db-url $DATABASE_URL
psql $DATABASE_URL < $BACKUP_FILE

echo "Database restore completed"

# Verify data integrity
echo "Verifying data integrity..."
# Add verification queries

echo "Restore completed successfully"
```

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run build
```

#### 2. Authentication Issues
```typescript
// Debug auth issues
const debugAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  console.log('Session:', session);
  console.log('Error:', error);
  
  if (!session) {
    console.log('No active session - redirecting to login');
    // Handle redirect
  }
};
```

#### 3. Real-time Connection Issues
```typescript
// Monitor connection status
supabase.realtime.onOpen(() => {
  console.log('Realtime connection opened');
});

supabase.realtime.onClose(() => {
  console.log('Realtime connection closed');
});

supabase.realtime.onError((error) => {
  console.error('Realtime connection error:', error);
});
```

#### 4. Performance Issues
```typescript
// Debug performance issues
const performanceDebugger = {
  logComponentRender: (componentName: string) => {
    console.log(`[RENDER] ${componentName} at ${Date.now()}`);
  },
  
  measureApiCall: async (name: string, apiCall: () => Promise<any>) => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const end = performance.now();
      console.log(`[API] ${name} completed in ${end - start}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`[API] ${name} failed after ${end - start}ms:`, error);
      throw error;
    }
  }
};
```

### Monitoring & Alerts
```typescript
// src/lib/alerts.ts
export class AlertManager {
  private static instance: AlertManager;
  
  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }
  
  // Monitor application health
  monitorHealth() {
    // Check API connectivity
    this.checkApiHealth();
    
    // Monitor error rates
    this.monitorErrorRates();
    
    // Check performance metrics
    this.checkPerformanceMetrics();
  }
  
  private async checkApiHealth() {
    try {
      const { error } = await supabase.from('stocks').select('count', { count: 'exact', head: true });
      if (error) throw error;
    } catch (error) {
      this.sendAlert('API Health Check Failed', error);
    }
  }
  
  private sendAlert(message: string, error?: any) {
    // Send to monitoring service
    console.error(`ALERT: ${message}`, error);
    
    // Could integrate with services like:
    // - Sentry
    // - PagerDuty
    // - Slack webhooks
  }
}
```

---

*This deployment and infrastructure guide provides comprehensive coverage of all aspects needed to successfully deploy and maintain the StockTrade Platform in production environments.*