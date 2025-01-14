import { supabase } from '../lib/supabase';
import type { User, Stock } from '../types';
import { ensureProfile } from './profileUtils';

interface TradeParams {
  user: User;
  stock: Stock;
  quantity: number;
  type: 'BUY' | 'SELL';
}

export async function executeTrade({ user, stock, quantity, type }: TradeParams) {
  // Ensure profile exists before proceeding
  await ensureProfile(user);

  const total = quantity * stock.price;

  // Start by getting the current portfolio holding
  const { data: portfolioData } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', user.id)
    .eq('stock_symbol', stock.symbol);

  const portfolio = portfolioData?.[0];

  // Record the transaction
  const { error: tradeError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      stock_symbol: stock.symbol,
      type,
      quantity,
      price: stock.price,
      total
    });

  if (tradeError) throw tradeError;

  // Update portfolio
  if (portfolio) {
    const newQuantity = type === 'BUY' 
      ? portfolio.quantity + quantity
      : portfolio.quantity - quantity;

    if (newQuantity < 0) throw new Error('Insufficient shares');

    if (newQuantity === 0) {
      await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolio.id);
    } else {
      await supabase
        .from('portfolios')
        .update({ quantity: newQuantity })
        .eq('id', portfolio.id);
    }
  } else if (type === 'BUY') {
    await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        stock_symbol: stock.symbol,
        quantity,
        average_price: stock.price
      });
  } else {
    throw new Error('Cannot sell stock you don\'t own');
  }
}