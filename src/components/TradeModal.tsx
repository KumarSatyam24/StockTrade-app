import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IndianStock } from '../lib/stocks/types';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { executeTrade } from '../utils/tradeUtils';
import { supabase } from '../lib/supabase';

interface TradeModalProps {
  stock: IndianStock;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: 'BUY' | 'SELL';
}

export function TradeModal({ stock, isOpen, onClose, onSuccess, defaultType = 'BUY' }: TradeModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [quantity, setQuantity] = useState('1');
  const [type, setType] = useState<'BUY' | 'SELL'>(defaultType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    setType(defaultType);
    if (user) {
      fetchUserBalance();
    }
  }, [defaultType, user]);

  async function fetchUserBalance() {
    try {
      const { data, error } = await supabase
        .from('user_funds')
        .select('balance')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserBalance(data?.balance || 0);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  }

  if (!isOpen || !user) return null;

  const currentPrice = stock.current_price || 0;
  const totalValue = (parseFloat(quantity) || 0) * currentPrice;

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (type === 'BUY' && totalValue > userBalance) {
        showNotification('error', 'Insufficient funds. Add funds to continue trading.');
        const addFundsButton = document.createElement('button');
        addFundsButton.textContent = 'Add Funds';
        addFundsButton.onclick = () => navigate('/funds');
        return;
      }

      await executeTrade({
        user,
        stock,
        quantity: parseFloat(quantity),
        type
      });
      
      showNotification('success', `Successfully ${type.toLowerCase()}ed ${quantity} shares of ${stock.symbol}`);
      await fetchUserBalance(); // Refresh balance after trade
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Trade {stock.symbol}</h2>
        
        <form onSubmit={handleTrade} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
              {error}
              {error.includes('Insufficient funds') && (
                <button
                  type="button"
                  onClick={() => navigate('/funds')}
                  className="mt-2 w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Funds
                </button>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'BUY' | 'SELL')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded space-y-2">
            <div className="flex justify-between text-sm">
              <span>Price per share:</span>
              <span>₹{currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Available balance:</span>
              <span>₹{userBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span>₹{totalValue.toFixed(2)}</span>
            </div>
            {type === 'BUY' && totalValue > userBalance && (
              <div className="text-red-600 text-sm">
                Insufficient funds. Add more funds to proceed.
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            {type === 'BUY' && totalValue > userBalance ? (
              <button
                type="button"
                onClick={() => navigate('/funds')}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Funds
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Trade'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}