import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StockCard } from '../StockCard';

describe('StockCard', () => {
  const mockStock = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    current_price: 150.00,
    previous_close: 148.00,
    day_change: 2.00,
    day_change_percent: 1.35,
    volume: 1000000
  };

  it('renders stock information correctly', () => {
    render(<StockCard stock={mockStock} />);
    
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('₹150.00')).toBeInTheDocument();
    expect(screen.getByText(/1.35%/)).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<StockCard stock={mockStock} onClick={handleClick} />);
    
    const card = screen.getByText('AAPL').closest('div');
    expect(card).toBeInTheDocument();
    
    if (card) {
      await user.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it('shows delete button only when onDelete is provided', () => {
    const { rerender } = render(<StockCard stock={mockStock} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    const handleDelete = vi.fn();
    rerender(<StockCard stock={mockStock} onDelete={handleDelete} />);
    const deleteButton = screen.getByRole('button');
    expect(deleteButton).toBeInTheDocument();
  });

  it('calls onDelete handler when delete button is clicked', async () => {
    const handleDelete = vi.fn();
    const user = userEvent.setup();
    
    render(<StockCard stock={mockStock} onDelete={handleDelete} />);
    
    const deleteButton = screen.getByRole('button');
    await user.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });
});