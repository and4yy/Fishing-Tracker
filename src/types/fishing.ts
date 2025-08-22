export interface Expense {
  fuel: number;
  food: number;
  other: number;
}

export interface FishSale {
  id: string;
  name: string;
  contact: string;
  weight: number;
  ratePrice: number;
  totalAmount: number;
  paid: boolean;
}

export interface FishingTrip {
  id: string;
  date: string;
  crew: string[];
  expenses: Expense;
  fishSales: FishSale[];
  tripType: 'Day' | 'Night' | 'Deep sea' | 'Reef' | 'Coastal' | 'Other';
  totalCatch: number; // kg
  totalSales: number; // MVR
  profit: number;
  ownerSharePercent: number;
  profitPerCrew: number;
  ownerProfit: number;
}

export interface TripSummary {
  totalTrips: number;
  totalCatch: number;
  totalSales: number;
  totalProfit: number;
  averageProfit: number;
}