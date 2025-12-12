import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FishingTrip, FishSale } from "@/types/fishing";
import { Edit2, Trash2, Calendar, Users, Fish, DollarSign, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { generateInvoiceNumber, downloadInvoiceAsPDF } from "@/lib/invoice";
import { BoatSettingsService } from "@/components/settings/boat-settings";
import { useToast } from "@/hooks/use-toast";

interface TripListProps {
  trips: FishingTrip[];
  onEdit: (trip: FishingTrip) => void;
  onDelete: (id: string) => void;
}

export function TripList({ trips, onEdit, onDelete }: TripListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    onDelete(id);
    setDeletingId(null);
  };

  const toggleExpand = (tripId: string) => {
    setExpandedTrips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tripId)) {
        newSet.delete(tripId);
      } else {
        newSet.add(tripId);
      }
      return newSet;
    });
  };

  const handleDownloadInvoice = async (trip: FishingTrip, fishSale: FishSale) => {
    try {
      const boatSettings = await BoatSettingsService.getSettings();
      
      if (!boatSettings.boatName || !boatSettings.ownerName) {
        toast({
          title: "Boat details required",
          description: "Please configure your boat details in Settings before generating invoices.",
          variant: "destructive"
        });
        return;
      }

      const invoiceData = {
        invoiceNumber: generateInvoiceNumber(),
        date: trip.date,
        customer: {
          name: fishSale.name,
          contact: fishSale.contact
        },
        boat: boatSettings,
        fishSale,
        tripType: trip.tripType
      };

      await downloadInvoiceAsPDF(invoiceData);
      toast({
        title: "Invoice generated",
        description: `Invoice for ${fishSale.name} has been downloaded.`
      });
    } catch (error) {
      toast({
        title: "Error generating invoice",
        description: "There was a problem generating the invoice.",
        variant: "destructive"
      });
    }
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

            {/* Fish Sales Section */}
            {trip.fishSales && trip.fishSales.length > 0 && (
              <div className="border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(trip.id)}
                  className="w-full flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Fish Sales ({trip.fishSales.length})
                  </span>
                  {expandedTrips.has(trip.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                
                {expandedTrips.has(trip.id) && (
                  <div className="mt-2 space-y-2">
                    {trip.fishSales.map((sale: FishSale) => (
                      <div key={sale.id} className="flex items-center justify-between p-2 bg-muted rounded-lg text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{sale.name}</div>
                          <div className="text-muted-foreground">
                            {sale.weight}kg × MVR {sale.ratePrice} = MVR {sale.totalAmount.toFixed(2)}
                            {sale.fishType && (
                              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${sale.fishType === 'Fresh' ? 'bg-blue-100 text-blue-800' : 'bg-cyan-100 text-cyan-800'}`}>
                                {sale.fishType}
                              </span>
                            )}
                          </div>
                          {sale.remarks && (
                            <div className="text-xs text-muted-foreground">Remarks: {sale.remarks}</div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(trip, sale)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Invoice
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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