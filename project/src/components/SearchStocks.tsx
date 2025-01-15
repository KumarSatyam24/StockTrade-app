import React, { useState, useRef, useEffect } from 'react';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';
import type { Stock } from '../types';

interface SearchStocksProps {
  onSelect: (stock: Stock) => void;
  stocks: Stock[];
}

export function SearchStocks({ onSelect, stocks }: SearchStocksProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredStocks = query
    ? stocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredStocks.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredStocks[selectedIndex]) {
          handleSelect(filteredStocks[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (stock: Stock) => {
    onSelect(stock);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search stocks by symbol or name..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {isOpen && filteredStocks.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[400px] overflow-y-auto">
          {filteredStocks.map((stock, index) => (
            <button
              key={stock.symbol}
              onClick={() => handleSelect(stock)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex justify-between items-center border-b border-gray-100 last:border-0 ${
                index === selectedIndex ? 'bg-gray-50' : ''
              }`}
            >
              <div>
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-sm text-gray-600">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">${stock.price.toFixed(2)}</div>
                <div className={`text-sm flex items-center justify-end ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query && filteredStocks.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
          No stocks found matching "{query}"
        </div>
      )}
    </div>
  );
}