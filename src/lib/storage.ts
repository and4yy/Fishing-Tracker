import { FishingTrip, TripSummary } from '@/types/fishing';

const STORAGE_KEY = 'fishing-trips';

export const StorageService = {
  // Get all trips
  getAllTrips(): FishingTrip[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading trips:', error);
      return [];
    }
  },

  // Save a trip
  saveTrip(trip: FishingTrip): void {
    try {
      const trips = this.getAllTrips();
      const existingIndex = trips.findIndex(t => t.id === trip.id);
      
      if (existingIndex >= 0) {
        trips[existingIndex] = trip;
      } else {
        trips.push(trip);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (error) {
      console.error('Error saving trip:', error);
      throw new Error('Failed to save trip');
    }
  },

  // Delete a trip
  deleteTrip(id: string): void {
    try {
      const trips = this.getAllTrips().filter(trip => trip.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw new Error('Failed to delete trip');
    }
  },

  // Get trip by ID
  getTripById(id: string): FishingTrip | null {
    const trips = this.getAllTrips();
    return trips.find(trip => trip.id === id) || null;
  },

  // Get summary statistics
  getSummary(): TripSummary {
    const trips = this.getAllTrips();
    
    if (trips.length === 0) {
      return {
        totalTrips: 0,
        totalCatch: 0,
        totalSales: 0,
        totalProfit: 0,
        averageProfit: 0
      };
    }

    const totals = trips.reduce(
      (acc, trip) => ({
        catch: acc.catch + trip.totalCatch,
        sales: acc.sales + trip.totalSales,
        profit: acc.profit + trip.profit
      }),
      { catch: 0, sales: 0, profit: 0 }
    );

    return {
      totalTrips: trips.length,
      totalCatch: totals.catch,
      totalSales: totals.sales,
      totalProfit: totals.profit,
      averageProfit: totals.profit / trips.length
    };
  }
};