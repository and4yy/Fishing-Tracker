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

      <TripForm onSubmit={handleSubmit} />
    </div>
  );
}