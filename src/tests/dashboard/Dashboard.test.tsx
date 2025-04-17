import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { Dashboard } from '../../pages/Dashboard';
import { AuthProvider } from '../../contexts/AuthContext';
import { MarketProvider } from '../../contexts/MarketContext';

// Mock data
const mockStock = {
  symbol: 'DRREDDY',
  name: "Dr. Reddy's Laboratories Ltd. Inc.",
  sector: 'Healthcare',
  current_price: 5678.90,
  day_change: 13.45,
  day_change_percent: 0.24,
  volume: 345678,
};

const mockMarketData = {
  DRREDDY: {
    price: 5778.90,
    change: 100,
    changePercent: 0.25,
    volume: 5100000,
  },
};

// Mock hooks
vi.mock('../../hooks/useStocks', () => ({
  useStocks: () => ({
    stocks: [mockStock],
    loading: false,
    error: null,
  }),
}));

vi.mock('../../contexts/MarketContext', async () => {
  const actual = await vi.importActual<any>('../../contexts/MarketContext');
  return {
    ...actual,
    useMarket: () => ({
      marketData: mockMarketData,
      isLoading: false,
    }),
  };
});

describe('Dashboard Page with DRREDDY mock data', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <MarketProvider>
            <Dashboard />
          </MarketProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  });

  it('should display market overview sections', async () => {
    await waitFor(() => {
      expect(screen.getByText(/market overview/i)).toBeInTheDocument();
    });
  });

  it('should filter stocks based on search', async () => {
    const searchInput = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'DRREDDY' } });

    await waitFor(() => {
      const stockElements = screen.getAllByText('DRREDDY');
      expect(stockElements.length).toBeGreaterThan(0);
    });
  });
});