# StockTrade 📈

A modern, real-time stock trading platform for the Indian market built with React, TypeScript, and Supabase.

![StockTrade Dashboard](https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200)

## Features 🚀

### Real-Time Market Data
- Live stock price updates with WebSocket connections
- Dynamic market overview with top gainers and losers
- Advanced stock search with symbol, company name, and sector filtering
- Detailed stock information including volume, market cap, and P/E ratios

### Portfolio Management
- Real-time portfolio tracking with current value and P/L
- Historical performance analysis
- Transaction history with detailed trade records
- Average price and quantity tracking

### Smart Trading
- One-click trading interface
- Real-time profit/loss calculations
- Position tracking
- Trade history and analytics

### Watchlist
- Customizable stock watchlists
- Target price alerts
- Quick trading access from watchlist
- Real-time price updates

## Technology Stack 💻

- **Frontend**: React 18, TypeScript
- **State Management**: React Context
- **Styling**: Tailwind CSS
- **Backend & Database**: Supabase
- **Real-time Updates**: Supabase Realtime
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Getting Started 🏁

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone https://github.com/sk7474481/stocktrade.git
cd stocktrade
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Add your Supabase credentials to the `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
```

## Security 🔒

- End-to-end data encryption
- Secure authentication with Supabase Auth
- Row Level Security (RLS) policies
- Protected API endpoints
- Regular security updates

## Project Structure 📁

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and types
├── pages/         # Page components
├── services/      # API and external service integrations
└── types/         # TypeScript type definitions
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📝

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [Supabase](https://supabase.io/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [Lucide React](https://lucide.dev/) for the beautiful icons
- [React](https://reactjs.org/) for the frontend framework

## Contact 📧

Your Name - [@satyam Kumar](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/stocktrade](https://github.com/yourusername/stocktrade)
