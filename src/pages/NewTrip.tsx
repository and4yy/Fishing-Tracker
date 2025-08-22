import { useNavigate } from "react-router-dom";
import { TripForm } from "@/components/forms/trip-form";
import { StorageService } from "@/lib/storage";
import { FishingTrip } from "@/types/fishing";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewTrip() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (trip: FishingTrip) => {
    try {
      StorageService.saveTrip(trip);
      toast({
        title: "Trip saved successfully",
        description: "Your fishing trip has been recorded."
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error saving trip",
        description: "There was a problem saving your trip. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveBasic = (partialTrip: Partial<FishingTrip>) => {
    try {
      // For basic save, we create a minimal trip object with default values
      const basicTrip: FishingTrip = {
        id: partialTrip.id || '',
        date: partialTrip.date || '',
        crew: partialTrip.crew || [],
        expenses: partialTrip.expenses || { fuel: 0, food: 0, other: 0 },
        fishSales: partialTrip.fishSales || [],
        tripType: partialTrip.tripType || 'Day',
        totalCatch: 0,
        totalSales: 0,
        profit: 0,
        ownerSharePercent: 0,
        profitPerCrew: 0,
        ownerProfit: 0,
      };
      
      StorageService.saveTrip(basicTrip);
      toast({
        title: "Basic trip details saved",
        description: "You can continue adding fish sales and complete the trip later."
      });
    } catch (error) {
      toast({
        title: "Error saving basic trip details",
        description: "There was a problem saving your trip. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Fishing Trip</h1>
          <p className="text-muted-foreground">Record the details of your fishing trip</p>
        </div>
      </div>

      <TripForm onSubmit={handleSubmit} onSaveBasic={handleSaveBasic} />
    </div>
  );
}