import { FishingTrip, TripSummary } from '@/types/fishing';
import { supabase } from '@/integrations/supabase/client';
import { StorageService } from './storage';
import { useToast } from '@/hooks/use-toast';
import { generateSupabaseUUID } from './calculations';

// Map to store local ID to Supabase UUID mappings
const ID_MAPPING_KEY = 'trip-id-mappings';

class IdMappingService {
  static getMapping(): Record<string, string> {
    try {
      const data = localStorage.getItem(ID_MAPPING_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static saveMapping(localId: string, supabaseId: string): void {
    try {
      const mappings = this.getMapping();
      mappings[localId] = supabaseId;
      localStorage.setItem(ID_MAPPING_KEY, JSON.stringify(mappings));
    } catch (error) {
      console.error('Error saving ID mapping:', error);
    }
  }

  static getSupabaseId(localId: string): string {
    const mappings = this.getMapping();
    return mappings[localId] || generateSupabaseUUID();
  }

  static getLocalId(supabaseId: string): string | null {
    const mappings = this.getMapping();
    return Object.keys(mappings).find(key => mappings[key] === supabaseId) || null;
  }
}

export class SupabaseStorageService {
  
  // Get all trips for the authenticated user
  static async getAllTrips(): Promise<FishingTrip[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Return local storage data if not authenticated
        return StorageService.getAllTrips();
      }

      const { data, error } = await supabase
        .from('fishing_trips')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching trips from Supabase:', error);
        // Fallback to local storage
        return StorageService.getAllTrips();
      }

      // Transform Supabase data to match our interface
      return data.map(this.transformFromSupabase);
    } catch (error) {
      console.error('Error in getAllTrips:', error);
      return StorageService.getAllTrips();
    }
  }

  // Save a trip (online if authenticated, otherwise locally)
  static async saveTrip(trip: FishingTrip): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Save locally if not authenticated
        StorageService.saveTrip(trip);
        return;
      }

      const supabaseTrip = this.transformToSupabase(trip, user.id);
      
      const { error } = await supabase
        .from('fishing_trips')
        .upsert(supabaseTrip as any, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error saving trip to Supabase:', error);
        // Fallback to local storage
        StorageService.saveTrip(trip);
        throw new Error('Failed to save trip online, saved locally instead');
      }

      // Don't save locally when successfully saved to Supabase to avoid duplicates
      // Local storage is only used as fallback when offline
    } catch (error) {
      console.error('Error in saveTrip:', error);
      // Always ensure it's saved locally
      StorageService.saveTrip(trip);
      throw error;
    }
  }

  // Delete a trip
  static async deleteTrip(id: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        StorageService.deleteTrip(id);
        return;
      }

      // Get the Supabase UUID for this local ID
      const supabaseId = IdMappingService.getSupabaseId(id);

      const { error } = await supabase
        .from('fishing_trips')
        .delete()
        .eq('id', supabaseId);

      if (error) {
        console.error('Error deleting trip from Supabase:', error);
        // Fallback to local storage deletion only if Supabase fails
        StorageService.deleteTrip(id);
        throw new Error('Failed to delete trip online');
      }

      // Successfully deleted from Supabase - no need to delete locally
    } catch (error) {
      console.error('Error in deleteTrip:', error);
      throw error;
    }
  }

  // Get trip by ID
  static async getTripById(id: string): Promise<FishingTrip | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return StorageService.getTripById(id);
      }

      // Get the Supabase UUID for this local ID
      const supabaseId = IdMappingService.getSupabaseId(id);

      const { data, error } = await supabase
        .from('fishing_trips')
        .select('*')
        .eq('id', supabaseId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching trip from Supabase:', error);
        return StorageService.getTripById(id);
      }

      return data ? this.transformFromSupabase(data) : null;
    } catch (error) {
      console.error('Error in getTripById:', error);
      return StorageService.getTripById(id);
    }
  }

  // Get summary statistics
  static async getSummary(): Promise<TripSummary> {
    try {
      const trips = await this.getAllTrips();
      
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
    } catch (error) {
      console.error('Error in getSummary:', error);
      return StorageService.getSummary();
    }
  }

  // Sync local data to Supabase when user logs in
  static async syncLocalDataToSupabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const localTrips = StorageService.getAllTrips();
      
      if (localTrips.length === 0) {
        return;
      }

      // Transform and upload all local trips
      const supabaseTrips = localTrips.map(trip => 
        this.transformToSupabase(trip, user.id)
      );

      const { error } = await supabase
        .from('fishing_trips')
        .upsert(supabaseTrips as any, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error syncing local data to Supabase:', error);
        throw new Error('Failed to sync local data');
      }

      console.log(`Successfully synced ${localTrips.length} trips to Supabase`);
    } catch (error) {
      console.error('Error in syncLocalDataToSupabase:', error);
      throw error;
    }
  }

  // Transform from Supabase format to our interface
  private static transformFromSupabase(data: any): FishingTrip {
    // Try to get the original local ID from the mapping, otherwise use the Supabase UUID
    const localId = IdMappingService.getLocalId(data.id) || data.id;
    
    return {
      id: localId,
      date: data.date,
      crew: data.crew || [],
      expenses: data.expenses || { fuel: 0, food: 0, other: 0 },
      fishSales: data.fish_sales || [],
      tripType: data.trip_type,
      hireDetails: data.hire_details,
      weatherConditions: data.weather_conditions,
      totalCatch: parseFloat(data.total_catch) || 0,
      totalSales: parseFloat(data.total_sales) || 0,
      profit: parseFloat(data.profit) || 0,
      ownerSharePercent: parseFloat(data.owner_share_percent) || 0,
      profitPerCrew: parseFloat(data.profit_per_crew) || 0,
      ownerProfit: parseFloat(data.owner_profit) || 0,
    };
  }

  // Transform to Supabase format
  private static transformToSupabase(trip: FishingTrip, userId: string) {
    // Get or generate UUID for Supabase
    const supabaseId = IdMappingService.getSupabaseId(trip.id);
    
    // Save the mapping if it's a new one
    if (!IdMappingService.getMapping()[trip.id]) {
      IdMappingService.saveMapping(trip.id, supabaseId);
    }
    
    return {
      id: supabaseId,
      user_id: userId,
      date: trip.date,
      crew: trip.crew,
      expenses: trip.expenses,
      fish_sales: trip.fishSales,
      trip_type: trip.tripType,
      hire_details: trip.hireDetails,
      weather_conditions: trip.weatherConditions,
      total_catch: trip.totalCatch,
      total_sales: trip.totalSales,
      profit: trip.profit,
      owner_share_percent: trip.ownerSharePercent,
      profit_per_crew: trip.profitPerCrew,
      owner_profit: trip.ownerProfit,
    };
  }
}