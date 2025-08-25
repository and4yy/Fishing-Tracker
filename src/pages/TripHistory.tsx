import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TripList } from "@/components/trips/trip-list";
import { PaymentStatusUpdater } from "@/components/trips/payment-status-updater";
import { SupabaseStorageService } from "@/lib/supabase-storage";
import { FishingTrip } from "@/types/fishing";
import { Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TripHistory() {
  const [trips, setTrips] = useState<FishingTrip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<FishingTrip[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadTrips = async () => {
      const allTrips = (await SupabaseStorageService.getAllTrips()).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTrips(allTrips);
      setFilteredTrips(allTrips);
    };

    loadTrips();
  }, []);

  useEffect(() => {
    let filtered = trips;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(trip => 
        trip.crew.some(member => 
          member.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        new Date(trip.date).toLocaleDateString().includes(searchTerm) ||
        trip.tripType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by trip type
    if (filterType !== "all") {
      filtered = filtered.filter(trip => trip.tripType === filterType);
    }

    setFilteredTrips(filtered);
  }, [trips, searchTerm, filterType]);

  const handleEdit = (trip: FishingTrip) => {
    navigate(`/edit-trip/${trip.id}`);
  };

  const handleDeleteTrip = async (id: string) => {
    try {
      await SupabaseStorageService.deleteTrip(id);
      const updatedTrips = trips.filter(trip => trip.id !== id);
      setTrips(updatedTrips);
      toast({
        title: "Trip deleted",
        description: "The fishing trip has been removed."
      });
    } catch (error) {
      toast({
        title: "Error deleting trip",
        description: "There was an error deleting the trip. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTrip = async (updatedTrip: FishingTrip) => {
    try {
      await SupabaseStorageService.saveTrip(updatedTrip);
      const updatedTrips = trips.map(trip => 
        trip.id === updatedTrip.id ? updatedTrip : trip
      );
      setTrips(updatedTrips);
    } catch (error) {
      toast({
        title: "Error updating payment status",
        description: "There was a problem updating the payment status.",
        variant: "destructive"
      });
    }
  };

  const tripTypes = Array.from(new Set(trips.map(trip => trip.tripType)));

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trip History</h1>
        <p className="text-muted-foreground">View and manage your fishing trips</p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by crew member, date, or trip type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trip Types</SelectItem>
              {tripTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredTrips.length} of {trips.length} trips
      </div>

      {/* Payment Status Updater */}
      {trips.length > 0 && (
        <PaymentStatusUpdater
          trips={trips}
          onUpdateTrip={handleUpdateTrip}
        />
      )}

      {/* Trip List */}
      <TripList
        trips={filteredTrips}
        onEdit={handleEdit}
        onDelete={handleDeleteTrip}
      />
    </div>
  );
}