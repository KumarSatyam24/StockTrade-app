# StockTrade Platform

A real-time stock trading platform built with React, TypeScript, and Supabase. Monitor stocks, manage your portfolio, and execute trades with ease.
link:[ https://kaleidoscopiccuchuflief6438.netlify.app/login](https://kaleidoscopic-cuchufli-ef6438.netlify.app/login)

![StockTrade Platform](https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200)

## Features

- **Real-time Stock Tracking**: Monitor stock prices and market movements in real-time
- **Portfolio Management**: Track your investments and analyze performance
- **Smart Trading**: Execute buy/sell orders with built-in balance management
- **Watchlist**: Create and manage your personalized stock watchlist
- **Transaction History**: Detailed history of all your trades with PDF export
- **Funds Management**: Easy deposit and withdrawal system
- **Secure Authentication**: Google sign-in integration

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Backend & Database**: Supabase
- **Real-time Updates**: Supabase Realtime
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **PDF Generation**: jsPDF

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stock-trading-platform
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries and types
├── pages/         # Page components
├── services/      # API and service functions
├── types/         # TypeScript type definitions
└── utils/         # Helper functions
```

## Features in Detail

### Portfolio Management
- Real-time portfolio valuation
- Profit/Loss tracking
- Transaction history
- Performance analytics

### Stock Trading
- Real-time stock prices
- Market order execution
- Balance management
- Trade confirmation

### Watchlist
- Custom stock tracking
- Price alerts
- Quick trade access
- Customizable views

### Funds Management
- Deposit/Withdrawal system
- Transaction history
- PDF statement generation
- Balance tracking

## Security Features

- Secure authentication with Supabase
- Row Level Security (RLS) policies
- Protected API endpoints
- Secure session management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [Lucide](https://lucide.dev/) for the beautiful icons
- [Vite](https://vitejs.dev/) for the build tooling
