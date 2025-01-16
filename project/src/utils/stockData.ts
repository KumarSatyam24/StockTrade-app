import type { Stock } from '../types';

// Helper function to generate mock historical data
const generateHistoricalData = (basePrice: number) => {
  const data = [];
  const days = 30;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const randomChange = (Math.random() - 0.5) * 5;
    data.push({
      date: date.toISOString().split('T')[0],
      price: basePrice + randomChange
    });
  }
  return data;
};

// Helper to create stock data
const createStock = (
  symbol: string,
  name: string,
  price: number,
  change: number
): Stock => ({
  symbol,
  name,
  price,
  change,
  changePercent: (change / price) * 100,
  historicalData: generateHistoricalData(price)
});

// Technology Sector
const techStocks = [
  createStock('AAPL', 'Apple Inc.', 173.75, 2.45),
  createStock('MSFT', 'Microsoft Corporation', 338.11, -1.23),
  createStock('GOOGL', 'Alphabet Inc.', 125.30, 0.85),
  createStock('AMZN', 'Amazon.com Inc.', 127.12, 1.45),
  createStock('NVDA', 'NVIDIA Corporation', 431.50, 5.20),
  createStock('META', 'Meta Platforms Inc.', 297.89, 3.15),
  createStock('TSLA', 'Tesla Inc.', 238.45, -4.20),
  createStock('ADBE', 'Adobe Inc.', 548.20, 2.30),
  createStock('CRM', 'Salesforce Inc.', 217.85, 1.15),
  createStock('INTC', 'Intel Corporation', 43.75, -0.65)
];

// Financial Sector
const financeStocks = [
  createStock('JPM', 'JPMorgan Chase & Co.', 148.90, 0.75),
  createStock('BAC', 'Bank of America Corp.', 32.45, -0.30),
  createStock('WFC', 'Wells Fargo & Co.', 45.60, 0.25),
  createStock('GS', 'Goldman Sachs Group Inc.', 385.20, 2.80),
  createStock('MS', 'Morgan Stanley', 87.65, 0.45),
  createStock('BLK', 'BlackRock Inc.', 792.30, 4.20),
  createStock('V', 'Visa Inc.', 245.80, 1.35),
  createStock('MA', 'Mastercard Inc.', 398.45, 2.15),
  createStock('AXP', 'American Express Co.', 167.90, 0.90),
  createStock('SCHW', 'Charles Schwab Corp.', 56.75, -0.85)
];

// Healthcare Sector
const healthcareStocks = [
  createStock('JNJ', 'Johnson & Johnson', 162.35, 0.55),
  createStock('PFE', 'Pfizer Inc.', 34.20, -0.45),
  createStock('UNH', 'UnitedHealth Group Inc.', 485.90, 3.25),
  createStock('ABBV', 'AbbVie Inc.', 145.70, 1.20),
  createStock('MRK', 'Merck & Co.', 107.85, 0.65),
  createStock('TMO', 'Thermo Fisher Scientific', 565.30, 4.80),
  createStock('ABT', 'Abbott Laboratories', 112.45, -0.95),
  createStock('DHR', 'Danaher Corporation', 245.80, 1.75),
  createStock('BMY', 'Bristol-Myers Squibb', 52.30, -0.40),
  createStock('AMGN', 'Amgen Inc.', 268.90, 2.10)
];

// Consumer Sector
const consumerStocks = [
  createStock('PG', 'Procter & Gamble Co.', 152.80, 0.85),
  createStock('KO', 'Coca-Cola Co.', 58.95, 0.30),
  createStock('PEP', 'PepsiCo Inc.', 167.45, 1.15),
  createStock('WMT', 'Walmart Inc.', 157.90, 0.95),
  createStock('COST', 'Costco Wholesale Corp.', 558.70, 3.45),
  createStock('NKE', 'Nike Inc.', 98.75, -1.25),
  createStock('MCD', "McDonald's Corp.", 282.35, 1.85),
  createStock('SBUX', 'Starbucks Corp.', 92.40, -0.75),
  createStock('HD', 'Home Depot Inc.', 305.60, 2.40),
  createStock('TGT', 'Target Corp.', 142.85, -1.15)
];

// Energy Sector
const energyStocks = [
  createStock('XOM', 'Exxon Mobil Corp.', 103.45, 0.95),
  createStock('CVX', 'Chevron Corp.', 154.80, 1.25),
  createStock('COP', 'ConocoPhillips', 115.90, 0.85),
  createStock('SLB', 'Schlumberger NV', 52.35, -0.45),
  createStock('EOG', 'EOG Resources Inc.', 121.75, 1.05),
  createStock('PXD', 'Pioneer Natural Resources', 235.90, 2.15),
  createStock('MPC', 'Marathon Petroleum Corp.', 142.60, 1.35),
  createStock('VLO', 'Valero Energy Corp.', 128.45, 0.90),
  createStock('PSX', 'Phillips 66', 115.80, 0.75),
  createStock('OXY', 'Occidental Petroleum', 62.35, -0.55)
];

// Industrial Sector
const industrialStocks = [
  createStock('CAT', 'Caterpillar Inc.', 242.90, 1.85),
  createStock('BA', 'Boeing Co.', 198.45, -2.35),
  createStock('HON', 'Honeywell International', 198.75, 1.25),
  createStock('UPS', 'United Parcel Service', 142.85, -0.95),
  createStock('RTX', 'Raytheon Technologies', 85.60, 0.45),
  createStock('GE', 'General Electric Co.', 128.90, 1.15),
  createStock('MMM', '3M Co.', 95.75, -0.85),
  createStock('DE', 'Deere & Co.', 385.90, 3.25),
  createStock('LMT', 'Lockheed Martin Corp.', 445.30, 2.75),
  createStock('FDX', 'FedEx Corp.', 248.65, 1.45)
];

// Combine all sectors
export const MOCK_STOCKS: Stock[] = [
  ...techStocks,
  ...financeStocks,
  ...healthcareStocks,
  ...consumerStocks,
  ...energyStocks,
  ...industrialStocks
];