import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../../pages/Login';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';

// ✅ Mock Supabase module
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

// ✅ Mock Supabase Auth UI
vi.mock('@supabase/auth-ui-react', () => ({
  Auth: () => <div data-testid="auth-ui">Auth UI Mock</div>,
}));

describe('Login Page', () => {
  beforeEach(() => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Login />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    );
  });

  it('should render the login page with title', async () => {
    await waitFor(() => {
      expect(screen.getByText(/Welcome to StockTrade/i)).toBeInTheDocument();
      expect(screen.getByText(/Your personal stock trading platform/i)).toBeInTheDocument();
    });
  });

  it('should render Supabase Auth UI component', async () => {
    await waitFor(() => {
      expect(screen.getByTestId('auth-ui')).toBeInTheDocument();
    });
  });
});