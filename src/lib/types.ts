export interface StockPrice {
  symbol: string;
  current_price: number;
}

export interface PriceMap {
  [symbol: string]: number;
}