import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { MOCK_STOCKS } from '../utils/mockData';
import type { Stock } from '../types';

interface SearchStocksProps {
  onSelect: (stock: Stock) => void;
}

export function SearchStocks({ onSelect }: SearchStocksProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Stock[]>([]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.length > 0) {
      // In a real app, this would be an API call
      const filtered = MOCK_STOCKS.filter(
        stock => 
          stock.symbol.toLowerCase().includes(value.toLowerCase()) ||
          stock.name.toLowerCase().includes(value.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search stocks..."
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
          {results.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => {
                onSelect(stock);
                setQuery('');
                setResults([]);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-sm text-gray-600">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">${stock.price}</div>
                <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}