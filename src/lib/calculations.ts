import { Expense } from '@/types/fishing';

export const calculateProfit = (
  totalSales: number,
  expenses: Expense
): number => {
  const totalExpenses = expenses.fuel + expenses.food + expenses.other;
  return totalSales - totalExpenses;
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

export const generateFishSaleId = (): string => {
  return `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};