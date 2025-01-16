export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sector?: string;
  historicalData?: {
    date: string;
    price: number;
  }[];
}

export interface Portfolio {
  id: string;
  user_id: string;
  stock_symbol: string;
  quantity: number;
  average_price: number;
  current_price: number;
  profit_loss: number;
  profit_loss_percentage: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  stock_symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  stock_symbol: string;
  target_price: number;
  created_at: string;
}