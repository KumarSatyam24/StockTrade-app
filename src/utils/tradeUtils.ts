import { supabase } from '../lib/supabase';
import type { User } from '../types';
import type { IndianStock } from '../lib/stocks/types';

interface TradeParams {
  user: User;
  stock: IndianStock;
  quantity: number;
  type: 'BUY' | 'SELL';
}

export async function executeTrade({ user, stock, quantity, type }: TradeParams) {
  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  try {
    const tradeQuantity = Number(quantity);
    const price = Number(stock.current_price);

    if (isNaN(tradeQuantity) || tradeQuantity <= 0) {
      throw new Error('Invalid quantity');
    }
    if (isNaN(price) || price <= 0) {
      throw new Error('Invalid stock price');
    }

    // Get user's current balance
    const { data: userFunds, error: fundsError } = await supabase
      .from('user_funds')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (fundsError) throw fundsError;

    const currentBalance = userFunds?.balance || 0;
    const totalCost = tradeQuantity * price;

    if (type === 'BUY' && totalCost > currentBalance) {
      throw new Error('Insufficient funds');
    }

    // Check existing position
    const { data: holdings, error: holdingError } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .eq('stock_symbol', stock.symbol)
      .maybeSingle();

    if (holdingError) throw holdingError;

    if (type === 'SELL') {
      if (!holdings) {
        throw new Error('No shares available to sell');
      }

      const currentQuantity = Number(holdings.quantity);
      if (currentQuantity < tradeQuantity) {
        throw new Error('Insufficient shares to sell');
      }

      const newQuantity = currentQuantity - tradeQuantity;

      if (newQuantity === 0) {
        // Delete the position if selling all shares
        const { error: deleteError } = await supabase
          .from('portfolios')
          .delete()
          .eq('id', holdings.id)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;
      } else {
        // Update the position with new quantity
        const { error: updateError } = await supabase
          .from('portfolios')
          .update({
            quantity: newQuantity,
            current_price: price,
            last_price_update: new Date().toISOString()
          })
          .eq('id', holdings.id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      // Update user's balance for sell
      const { error: updateFundsError } = await supabase
        .from('user_funds')
        .update({ balance: currentBalance + totalCost })
        .eq('user_id', user.id);

      if (updateFundsError) throw updateFundsError;
    } else {
      // BUY operation
      // Check balance again before buying
      if (totalCost > currentBalance) {
        throw new Error('Insufficient funds');
      }

      if (holdings) {
        // Update existing position
        const currentQuantity = Number(holdings.quantity);
        const newQuantity = currentQuantity + tradeQuantity;
        const newAveragePrice = ((currentQuantity * holdings.average_price) + (tradeQuantity * price)) / newQuantity;

        const { error: updateError } = await supabase
          .from('portfolios')
          .update({
            quantity: newQuantity,
            average_price: newAveragePrice,
            current_price: price,
            last_price_update: new Date().toISOString()
          })
          .eq('id', holdings.id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        // Create new position
        const { error: insertError } = await supabase
          .from('portfolios')
          .insert({
            user_id: user.id,
            stock_symbol: stock.symbol,
            quantity: tradeQuantity,
            average_price: price,
            current_price: price,
            previous_day_price: price,
            last_price_update: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      // Update user's balance for buy
      const { error: updateFundsError } = await supabase
        .from('user_funds')
        .update({ balance: currentBalance - totalCost })
        .eq('user_id', user.id);

      if (updateFundsError) throw updateFundsError;
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
        total: totalCost
      });

    if (tradeError) throw tradeError;

  } catch (error) {
    console.error('Trade execution error:', error);
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}