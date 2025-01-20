import { supabase } from '../lib/supabase';
import type { User } from '../types';
import type { IndianStock } from '../lib/stocks/types';
import { ensureProfile } from './profileUtils';

interface TradeParams {
  user: User;
  stock: IndianStock;
  quantity: number;
  type: 'BUY' | 'SELL';
}

export async function executeTrade({ user, stock, quantity, type }: TradeParams) {
  // Ensure profile exists before proceeding
  await ensureProfile(user);

  // Validate inputs and convert to numbers
  const tradeQuantity = Number(quantity);
  if (tradeQuantity <= 0) {
    throw new Error('Quantity must be greater than 0');
  }

  const price = Number(stock.current_price);
  if (price <= 0) {
    throw new Error('Invalid stock price');
  }

  const total = tradeQuantity * price;
  if (total <= 0) {
    throw new Error('Invalid trade amount');
  }

  // Get current portfolio holding
  const { data: portfolioData, error: portfolioError } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', user.id)
    .eq('stock_symbol', stock.symbol)
    .single();

  if (portfolioError && portfolioError.code !== 'PGRST116') {
    throw portfolioError;
  }

  // Validate sell order with proper number comparison
  if (type === 'SELL') {
    if (!portfolioData) {
      throw new Error('Cannot sell stock you don\'t own');
    }
    const currentQuantity = Number(portfolioData.quantity);
    if (currentQuantity < tradeQuantity) {
      throw new Error('Insufficient shares to sell');
    }
  }

  // Record the transaction
  const { error: tradeError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      stock_symbol: stock.symbol,
      type,
      quantity: tradeQuantity,
      price,
      total
    });

  if (tradeError) throw tradeError;

  // Update portfolio
  if (portfolioData) {
    const currentQuantity = Number(portfolioData.quantity);
    const newQuantity = type === 'BUY' 
      ? currentQuantity + tradeQuantity
      : currentQuantity - tradeQuantity;

    if (newQuantity === 0) {
      // Delete the portfolio entry if quantity becomes zero
      const { error: deleteError } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioData.id);

      if (deleteError) throw deleteError;
    } else {
      // Update existing portfolio entry
      const currentAvgPrice = Number(portfolioData.average_price);
      const newAveragePrice = type === 'BUY'
        ? ((currentQuantity * currentAvgPrice) + (tradeQuantity * price)) / newQuantity
        : currentAvgPrice;

      const { error: updateError } = await supabase
        .from('portfolios')
        .update({ 
          quantity: newQuantity,
          average_price: newAveragePrice,
          current_price: price
        })
        .eq('id', portfolioData.id);

      if (updateError) throw updateError;
    }
  } else if (type === 'BUY') {
    // Create new portfolio entry for buy orders
    const { error: insertError } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        stock_symbol: stock.symbol,
        quantity: tradeQuantity,
        average_price: price,
        current_price: price,
        previous_day_price: price
      });

    if (insertError) throw insertError;
  }
}