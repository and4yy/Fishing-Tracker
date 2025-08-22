import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FishingTrip, Expense } from "@/types/fishing";
import { calculateProfit, calculateProfitDistribution, generateTripId } from "@/lib/calculations";
import { Plus, Minus } from "lucide-react";

interface TripFormProps {
  onSubmit: (trip: FishingTrip) => void;
  initialData?: Partial<FishingTrip>;
  isEditing?: boolean;
}

const tripTypes: Array<FishingTrip['tripType']> = ['Day', 'Night', 'Deep sea', 'Reef', 'Coastal', 'Other'];

export function TripForm({ onSubmit, initialData, isEditing = false }: TripFormProps) {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    crew: initialData?.crew || [''],
    expenses: initialData?.expenses || { fuel: 0, food: 0, other: 0 },
    tripType: initialData?.tripType || 'Day' as FishingTrip['tripType'],
    totalCatch: initialData?.totalCatch || 0,
    totalSales: initialData?.totalSales || 0,
    ownerSharePercent: initialData?.ownerSharePercent || 0,
  });

  const addCrewMember = () => {
    setFormData(prev => ({
      ...prev,
      crew: [...prev.crew, '']
    }));
  };

  const removeCrewMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      crew: prev.crew.filter((_, i) => i !== index)
    }));
  };

  const updateCrewMember = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      crew: prev.crew.map((member, i) => i === index ? value : member)
    }));
  };

  const updateExpense = (type: keyof Expense, value: number) => {
    setFormData(prev => ({
      ...prev,
      expenses: { ...prev.expenses, [type]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profit = calculateProfit(formData.totalSales, formData.expenses);
    const crewMembers = formData.crew.filter(member => member.trim() !== '');
    const distribution = calculateProfitDistribution(profit, crewMembers.length, formData.ownerSharePercent);

    const trip: FishingTrip = {
      id: initialData?.id || generateTripId(),
      date: formData.date,
      crew: crewMembers,
      expenses: formData.expenses,
      tripType: formData.tripType,
      totalCatch: formData.totalCatch,
      totalSales: formData.totalSales,
      profit,
      ownerSharePercent: formData.ownerSharePercent,
      profitPerCrew: distribution.profitPerCrew,
      ownerProfit: distribution.ownerProfit,
    };

    onSubmit(trip);
  };

  const profit = calculateProfit(formData.totalSales, formData.expenses);
  const crewCount = formData.crew.filter(member => member.trim() !== '').length;
  const distribution = calculateProfitDistribution(profit, crewCount, formData.ownerSharePercent);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="tripType">Trip Type</Label>
              <Select value={formData.tripType} onValueChange={(value) => setFormData(prev => ({ ...prev, tripType: value as FishingTrip['tripType'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tripTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crew Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.crew.map((member, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Crew member ${index + 1}`}
                value={member}
                onChange={(e) => updateCrewMember(index, e.target.value)}
              />
              {formData.crew.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeCrewMember(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addCrewMember}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Crew Member
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses (MVR)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fuel">Fuel</Label>
              <Input
                id="fuel"
                type="number"
                step="0.01"
                value={formData.expenses.fuel}
                onChange={(e) => updateExpense('fuel', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="food">Food</Label>
              <Input
                id="food"
                type="number"
                step="0.01"
                value={formData.expenses.food}
                onChange={(e) => updateExpense('food', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="other">Other</Label>
              <Input
                id="other"
                type="number"
                step="0.01"
                value={formData.expenses.other}
                onChange={(e) => updateExpense('other', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Total Expenses: MVR {(formData.expenses.fuel + formData.expenses.food + formData.expenses.other).toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catch & Sales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="catch">Total Catch (kg)</Label>
              <Input
                id="catch"
                type="number"
                step="0.1"
                value={formData.totalCatch}
                onChange={(e) => setFormData(prev => ({ ...prev, totalCatch: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="sales">Total Sales (MVR)</Label>
              <Input
                id="sales"
                type="number"
                step="0.01"
                value={formData.totalSales}
                onChange={(e) => setFormData(prev => ({ ...prev, totalSales: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit Distribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ownerShare">Owner Share (%)</Label>
            <Input
              id="ownerShare"
              type="number"
              min="0"
              max="100"
              value={formData.ownerSharePercent}
              onChange={(e) => setFormData(prev => ({ ...prev, ownerSharePercent: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="text-sm font-medium">Profit Calculation:</div>
            <div className="text-sm">Total Profit: MVR {profit.toFixed(2)}</div>
            <div className="text-sm">Owner Profit: MVR {distribution.ownerProfit.toFixed(2)}</div>
            <div className="text-sm">Profit per Crew ({crewCount} members): MVR {distribution.profitPerCrew.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        {isEditing ? 'Update Trip' : 'Save Trip'}
      </Button>
    </form>
  );
}