import React, { useState } from 'react';
import type { Stock } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { executeTrade } from '../utils/tradeUtils';

interface TradeModalProps {
  stock: Stock;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TradeModal({ stock, isOpen, onClose, onSuccess }: TradeModalProps) {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState('1');
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await executeTrade({
        user,
        stock,
        quantity: parseFloat(quantity),
        type
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Trade {stock.symbol}</h2>
        
        <form onSubmit={handleTrade} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
              {error}
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

          <div className="bg-gray-50 p-3 rounded">
            <div className="flex justify-between text-sm">
              <span>Price per share:</span>
              <span>${stock.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold mt-1">
              <span>Total:</span>
              <span>${(parseFloat(quantity) * stock.price).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}