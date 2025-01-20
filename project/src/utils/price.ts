export function calculateProfitLoss(quantity: number, avgPrice: number, currentPrice: number) {
  return (currentPrice - avgPrice) * quantity;
}

export function calculatePercentageChange(oldValue: number, newValue: number) {
  if (!oldValue) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}