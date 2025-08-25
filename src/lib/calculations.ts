import { Expense } from '@/types/fishing';

export const calculateProfit = (
  totalSales: number,
  expenses: Expense,
  hirePrice: number = 0
): number => {
  const totalExpenses = expenses.fuel + expenses.food + expenses.other;
  const totalRevenue = totalSales + hirePrice;
  return totalRevenue - totalExpenses;
};

export const calculateProfitDistribution = (
  profit: number,
  crewCount: number,
  ownerSharePercent: number = 0
) => {
  const ownerProfit = (profit * ownerSharePercent) / 100;
  const remainingProfit = profit - ownerProfit;
  const profitPerCrew = crewCount > 0 ? remainingProfit / crewCount : 0;

  return {
    ownerProfit,
    profitPerCrew,
    totalDistributed: ownerProfit + (profitPerCrew * crewCount)
  };
};

export const generateTripId = (): string => {
  return `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateSupabaseUUID = (): string => {
  // Generate a valid UUID v4 format
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const generateFishSaleId = (): string => {
  return `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};