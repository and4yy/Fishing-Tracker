import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { UnpaidSalesNotification } from "@/components/notifications/unpaid-sales-notification";
import { SupabaseStorageService } from "@/lib/supabase-storage";
import { exportToExcel } from "@/lib/export";
import { TripSummary } from "@/types/fishing";
import { BoatSettings } from "@/types/settings";
import { BoatSettingsService } from "@/components/settings/boat-settings";
import { Download, Anchor, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WeatherCard } from "@/components/weather/weather-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [summary, setSummary] = useState<TripSummary>({
    totalTrips: 0,
    totalCatch: 0,
    totalSales: 0,
    totalProfit: 0,
    averageProfit: 0,
  });
  const [boatSettings, setBoatSettings] = useState<BoatSettings>({
    boatName: '',
    ownerName: '',
    contactNumber: '',
    email: '',
    address: '',
    registrationNumber: '',
    logoUrl: '',
    bankName: '',
    accountNumber: '',
    accountName: ''
  });
  const [crewPayouts, setCrewPayouts] = useState<Array<{name: string, payout: number}>>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      const summaryData = await SupabaseStorageService.getSummary();
      setSummary(summaryData);
      
      const settings = BoatSettingsService.getSettings();
      setBoatSettings(settings);

      // Calculate crew payouts from trip history
      const trips = await SupabaseStorageService.getAllTrips();
      const crewPayoutMap = new Map<string, number>();

      trips.forEach(trip => {
        if (trip.crew && trip.crew.length > 0 && trip.profitPerCrew > 0) {
          trip.crew.forEach(crewMember => {
            const currentPayout = crewPayoutMap.get(crewMember) || 0;
            crewPayoutMap.set(crewMember, currentPayout + trip.profitPerCrew);
          });
        }
      });

      // Convert to array and sort by payout (descending)
      const crewPayoutsArray = Array.from(crewPayoutMap.entries())
        .map(([name, payout]) => ({ name, payout }))
        .sort((a, b) => b.payout - a.payout)
        .slice(0, 10); // Show top 10 crew members

      setCrewPayouts(crewPayoutsArray);
    };

    loadData();
    
    // Listen for storage changes
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleExportData = async () => {
    try {
      const trips = await SupabaseStorageService.getAllTrips();
      if (trips.length === 0) {
        toast({
          title: "No data to export",
          description: "Add some fishing trips before exporting.",
          variant: "destructive"
        });
        return;
      }
      
      exportToExcel(trips);
      toast({
        title: "Export successful",
        description: "Your fishing trip data has been exported to Excel."
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your data.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 justify-center">
            <div className="p-3 ocean-gradient rounded-xl">
              <Anchor className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Fishing Tracker</h1>
              <p className="text-muted-foreground">
                Track your fishing adventures and profits
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <UnpaidSalesNotification />
            <Button 
              variant="outline" 
              size="icon"
              asChild
            >
              <a href="/settings">
                <Settings className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Welcome Aboard Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
            {boatSettings.logoUrl ? (
              <img 
                src={boatSettings.logoUrl} 
                alt="Boat Logo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full ocean-gradient flex items-center justify-center">
                <Anchor className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">
            {boatSettings.boatName 
              ? `Welcome aboard ${boatSettings.boatName}!` 
              : 'Welcome aboard!'
            }
          </h2>
          {/* Weather Report */}
          <div className="mt-4">
            <WeatherCard />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-3">
            <Button 
              onClick={handleExportData} 
              variant="outline" 
              className="w-full justify-start"
              disabled={summary.totalTrips === 0}
            >
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
            {summary.totalTrips === 0 && (
              <span className="ml-auto text-xs text-muted-foreground">No trips to export</span>
            )}
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      {summary.totalTrips > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          <div className="bg-muted/50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{summary.totalTrips}</div>
                <div className="text-muted-foreground">Total Trips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{(summary.totalCatch / summary.totalTrips).toFixed(1)} kg</div>
                <div className="text-muted-foreground">Avg. Catch per Trip</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">MVR {summary.averageProfit.toFixed(0)}</div>
                <div className="text-muted-foreground">Avg. Profit per Trip</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Crew Payouts Chart */}
      {crewPayouts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Crew Member Payouts</h2>
          <div className="bg-card p-6 rounded-lg border">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={crewPayouts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `MVR ${value.toFixed(0)}`}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number) => [`MVR ${value.toFixed(2)}`, 'Total Payout']}
                  labelClassName="text-foreground"
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar 
                  dataKey="payout" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Total payouts earned by crew members across all fishing trips
            </p>
          </div>
        </div>
      )}

      {summary.totalTrips === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="mx-auto w-24 h-24 ocean-gradient rounded-full flex items-center justify-center">
            <Anchor className="h-12 w-12 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">
              {boatSettings.boatName 
                ? `Welcome aboard ${boatSettings.boatName}!` 
                : 'Welcome to Fishing Tracker'
              }
            </h3>
            <p className="text-muted-foreground mb-6">Start tracking your fishing trips to see insights and manage your business.</p>
            <Button asChild>
              <a href="/new-trip">Record Your First Trip</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}