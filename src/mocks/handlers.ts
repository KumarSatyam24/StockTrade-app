import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Supabase auth endpoints
  http.post('*/auth/v1/token', () => {
    return new HttpResponse(JSON.stringify({
      access_token: 'mock-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        created_at: new Date().toISOString()
      }
    }));
  }),

  // Mock stocks endpoint
  http.get('*/rest/v1/stocks', () => {
    return new HttpResponse(JSON.stringify([
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        sector: 'Technology',
        current_price: 150.00,
        previous_close: 148.00,
        day_change: 2.00,
        day_change_percent: 1.35,
        volume: 1000000
      }
    ]));
  }),

  // Mock portfolio endpoint
  http.get('*/rest/v1/portfolios', () => {
    return new HttpResponse(JSON.stringify([
      {
        id: 'mock-portfolio-1',
        user_id: 'mock-user-id',
        stock_symbol: 'AAPL',
        quantity: 10,
        average_price: 145.00,
        current_price: 150.00,
        previous_day_price: 148.00,
        profit_loss: 50.00,
        profit_loss_percentage: 3.45,
        created_at: new Date().toISOString()
      }
    ]));
  }),

  // Mock user funds endpoint
  http.get('*/rest/v1/user_funds', () => {
    return new HttpResponse(JSON.stringify({
      balance: 1000,
      user_id: 'mock-user-id'
    }));
  })
];