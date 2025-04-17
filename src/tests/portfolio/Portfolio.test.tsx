// Portfolio.test.tsx

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Portfolio } from '../../pages/Portfolio';
import { AuthProvider } from '../../contexts/AuthContext';
import { MarketProvider } from '../../contexts/MarketContext';

// Mock portfolio data
const mockPortfolio = [
  {
    id: '1',
    user_id: 'test-user',
    stock_symbol: 'AAPL',
    quantity: 10,
    average_price: 150,
    current_price: 155,
    previous_day_price: 152,
    profit_loss: 50,
    profit_loss_percentage: 3.33,
    created_at: new Date().toISOString()
  }
];

// Mock the hooks
vi.mock('../../hooks/usePortfolio', () => ({
  usePortfolio: () => ({
    portfolio: mockPortfolio,
    loading: false,
    error: null,
    refetch: vi.fn()
  })
}));

vi.mock('../../hooks/usePortfolioUpdates', () => ({
  usePortfolioUpdates: (portfolio: any) => portfolio
}));

describe('Portfolio Page', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <MarketProvider>
            <Portfolio />
          </MarketProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  });

  it('should display portfolio holdings', async () => {
    await waitFor(() => {
      expect(screen.getByText(/holdings/i)).toBeInTheDocument();
      expect(screen.getByText(/total investment/i)).toBeInTheDocument();
    });
  });

  it('should calculate portfolio metrics correctly', async () => {
    const totalInvestment = mockPortfolio.reduce((sum, holding) => 
      sum + (holding.quantity * holding.average_price), 0
    );

    await waitFor(() => {
      expect(screen.getByText(new RegExp(totalInvestment.toString()))).toBeInTheDocument();
    });
  });
});