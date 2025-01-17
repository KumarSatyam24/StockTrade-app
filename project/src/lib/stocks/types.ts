export interface IndianStock {
  symbol: string;
  name: string;
  sector: string;
  current_price: number;
  previous_close: number;
  day_change: number;
  day_change_percent: number;
  volume?: number;
  market_cap?: number;
  pe_ratio?: number;
}

export interface StockQuote {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}