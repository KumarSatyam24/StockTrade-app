import { useState } from 'react';
import type { Portfolio } from '../types';

export function usePortfolioUpdates(initialPortfolio: Portfolio[]): Portfolio[] {
  // Return portfolio as is without any updates
  return initialPortfolio;
}