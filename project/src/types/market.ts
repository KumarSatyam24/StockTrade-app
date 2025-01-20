export interface MarketTick {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface MarketData {
  [symbol: string]: MarketTick;
}

export interface MarketUpdate {
  symbol: string;
  currentPrice: number;
  previousPrice: number;
  timestamp: string;
}