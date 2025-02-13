export interface WishlistItem {
  id: string;
  user_id: string;
  stock_symbol: string;
  target_price: number;
  created_at: string;
}

export interface AddWishlistItem {
  stock_symbol: string;
  target_price: number;
}