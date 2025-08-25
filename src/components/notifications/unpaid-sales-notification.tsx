import { useState, useEffect } from "react";
import { Bell, DollarSign, User, Calendar, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { SupabaseStorageService } from "@/lib/supabase-storage";
import { FishingTrip, FishSale } from "@/types/fishing";
import { useToast } from "@/hooks/use-toast";

interface UnpaidSaleWithTrip extends FishSale {
  tripId: string;
  tripDate: string;
}

export function UnpaidSalesNotification() {
  const [unpaidSales, setUnpaidSales] = useState<UnpaidSaleWithTrip[]>([]);
  const { toast } = useToast();

  const loadUnpaidSales = async () => {
    const trips = await SupabaseStorageService.getAllTrips();
    const unpaid: UnpaidSaleWithTrip[] = [];
    
    trips.forEach(trip => {
      // Safety check: ensure fishSales exists and is an array
      if (trip.fishSales && Array.isArray(trip.fishSales)) {
        trip.fishSales.forEach(sale => {
          if (!sale.paid) {
            unpaid.push({
              ...sale,
              tripId: trip.id,
              tripDate: trip.date
            });
          }
        });
      }
    });
    
    setUnpaidSales(unpaid);
  };

  useEffect(() => {
    loadUnpaidSales();
    
    // Listen for storage changes
    const handleStorageChange = () => loadUnpaidSales();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const markAsPaid = async (saleId: string, tripId: string) => {
    const trips = await SupabaseStorageService.getAllTrips();
    const trip = trips.find(t => t.id === tripId);

    if (trip && trip.fishSales && Array.isArray(trip.fishSales)) {
      const sale = trip.fishSales.find(s => s.id === saleId);
      if (sale) {
        sale.paid = true;
        await SupabaseStorageService.saveTrip(trip);
        loadUnpaidSales();

        toast({
          title: "Payment Updated",
          description: `Sale to ${sale.name} marked as paid.`,
        });
      }
    }
  };

  const totalUnpaidAmount = unpaidSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

  if (unpaidSales.length === 0) {
    return (
      <Button variant="outline" size="sm" className="relative">
        <Bell className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 px-2 py-1 text-xs min-w-[20px] h-5 flex items-center justify-center"
          >
            {unpaidSales.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Unpaid Sales ({unpaidSales.length})
        </DropdownMenuLabel>
        <div className="px-2 pb-2 text-sm text-muted-foreground">
          Total Outstanding: MVR {totalUnpaidAmount.toFixed(2)}
        </div>
        <DropdownMenuSeparator />
        
        <div className="max-h-96 overflow-y-auto">
          {unpaidSales.map((sale) => (
            <DropdownMenuItem key={`${sale.tripId}-${sale.id}`} className="p-0">
              <Card className="w-full border-none shadow-none">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium text-sm">{sale.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(sale.tripDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sale.weight}kg × MVR {sale.ratePrice.toFixed(2)}
                      </div>
                      <div className="font-semibold text-sm">
                        MVR {sale.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Contact: {sale.contact}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsPaid(sale.id, sale.tripId);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}