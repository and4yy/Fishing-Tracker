import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FishingTrip } from "@/types/fishing";
import { Edit2, Trash2, Calendar, Users, Fish, DollarSign } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface TripListProps {
  trips: FishingTrip[];
  onEdit: (trip: FishingTrip) => void;
  onDelete: (id: string) => void;
}

export function TripList({ trips, onEdit, onDelete }: TripListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeletingId(null);
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <Fish className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No trips recorded</h3>
        <p className="text-muted-foreground">Start tracking your fishing trips to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trips.map((trip) => (
        <Card key={trip.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(trip.date).toLocaleDateString()}
              </CardTitle>
              <Badge variant="secondary">{trip.tripType}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{trip.crew.length} crew</span>
              </div>
              <div className="flex items-center gap-2">
                <Fish className="h-4 w-4 text-muted-foreground" />
                <span>{trip.totalCatch} kg</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>MVR {trip.totalSales}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${trip.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Profit: MVR {trip.profit.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <div>Crew: {trip.crew.join(', ')}</div>
              <div className="mt-1">
                Expenses: Fuel MVR {trip.expenses.fuel}, Food MVR {trip.expenses.food}, Other MVR {trip.expenses.other}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(trip)}
                className="flex-1"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Trip</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this fishing trip? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(trip.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}