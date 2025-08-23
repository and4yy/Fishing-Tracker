import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FishingTrip, FishSale } from "@/types/fishing";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

interface PaymentStatusUpdaterProps {
  trips: FishingTrip[];
  onUpdateTrip: (updatedTrip: FishingTrip) => void;
}

export function PaymentStatusUpdater({ trips, onUpdateTrip }: PaymentStatusUpdaterProps) {
  const { toast } = useToast();
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const updatePaymentStatus = (trip: FishingTrip, saleId: string, paid: boolean) => {
    if (updatingIds.has(saleId)) return;
    
    setUpdatingIds(prev => new Set(prev.add(saleId)));
    
    const updatedTrip = {
      ...trip,
      fishSales: (trip.fishSales || []).map(sale =>
        sale.id === saleId ? { ...sale, paid } : sale
      )
    };
    
    onUpdateTrip(updatedTrip);
    
    toast({
      title: "Payment status updated",
      description: `Sale marked as ${paid ? 'paid' : 'unpaid'}`,
    });
    
    setTimeout(() => {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(saleId);
        return newSet;
      });
    }, 500);
  };

  const unpaidSales = trips.flatMap(trip => 
    (trip.fishSales || [])
      .filter(sale => !sale.paid)
      .map(sale => ({ ...sale, tripId: trip.id, tripDate: trip.date }))
  );

  if (unpaidSales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">All sales have been paid</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unpaid Sales ({unpaidSales.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {unpaidSales.map((sale) => {
          const trip = trips.find(t => t.id === sale.tripId);
          const isUpdating = updatingIds.has(sale.id);
          
          return (
            <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{sale.name}</span>
                  <Badge variant="secondary">{sale.tripDate}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Contact: {sale.contact} | Weight: {sale.weight}kg | Amount: MVR {sale.totalAmount}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => trip && updatePaymentStatus(trip, sale.id, true)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark Paid
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}