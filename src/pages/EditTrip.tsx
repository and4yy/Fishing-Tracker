import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TripForm } from "@/components/forms/trip-form";
import { SupabaseStorageService } from "@/lib/supabase-storage";
import { FishingTrip } from "@/types/fishing";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditTrip() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<FishingTrip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrip = async () => {
      if (!id) return;

      const foundTrip = await SupabaseStorageService.getTripById(id);
      if (!foundTrip) {
        toast({
          title: "Trip not found",
          description: "The requested trip could not be found.",
          variant: "destructive"
        });
        navigate('/trips');
        return;
      }

      setTrip(foundTrip);
      setLoading(false);
    };

    loadTrip();
  }, [id, navigate, toast]);

  const handleSave = async (updatedTrip: FishingTrip) => {
    try {
      await SupabaseStorageService.saveTrip(updatedTrip);
      toast({
        title: "Trip updated successfully",
        description: "Your fishing trip has been saved."
      });
      navigate('/trips');
    } catch (error) {
      toast({
        title: "Error saving trip",
        description: "There was an error saving your trip. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 pb-20">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/history')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Fishing Trip</h1>
          <p className="text-muted-foreground">
            Updating trip from {new Date(trip.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <TripForm onSubmit={handleSave} initialData={{...trip, fishSales: trip.fishSales || []}} isEditing />
    </div>
  );
}