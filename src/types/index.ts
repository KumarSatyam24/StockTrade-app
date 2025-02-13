export interface Portfolio {
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