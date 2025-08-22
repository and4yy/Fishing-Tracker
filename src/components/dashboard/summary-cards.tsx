import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TripSummary } from "@/types/fishing";
import { Ship, Fish, DollarSign, TrendingUp } from "lucide-react";

interface SummaryCardsProps {
  summary: TripSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="wave-pattern">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
          <Ship className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalTrips}</div>
          <p className="text-xs text-muted-foreground">
            Fishing expeditions recorded
          </p>
        </CardContent>
      </Card>

      <Card className="wave-pattern">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Catch</CardTitle>
          <Fish className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalCatch.toFixed(1)} kg</div>
          <p className="text-xs text-muted-foreground">
            Fish caught across all trips
          </p>
        </CardContent>
      </Card>

      <Card className="wave-pattern">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">MVR {summary.totalSales.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Revenue from all trips
          </p>
        </CardContent>
      </Card>

      <Card className="wave-pattern">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">MVR {summary.totalProfit.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Avg: MVR {summary.averageProfit.toFixed(2)} per trip
          </p>
        </CardContent>
      </Card>
    </div>
  );
}