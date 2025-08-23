import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FishingTrip, Expense, FishSale } from "@/types/fishing";
import { calculateProfit, calculateProfitDistribution, generateTripId, generateFishSaleId } from "@/lib/calculations";
import { generateInvoiceNumber, downloadInvoiceAsPDF, printInvoice } from "@/lib/invoice";
import { BoatSettingsService } from "@/components/settings/boat-settings";
import { Plus, Minus, Save, FileText, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TripFormProps {
  onSubmit: (trip: FishingTrip) => void;
  onSaveBasic?: (trip: Partial<FishingTrip>) => void;
  initialData?: Partial<FishingTrip>;
  isEditing?: boolean;
}

const tripTypes: Array<FishingTrip['tripType']> = ['Private Hire', 'Yellow Fin Tuna', 'Reef Fish', 'Kalhubilamas', 'Latti/Raagondi'];

export function TripForm({ onSubmit, onSaveBasic, initialData, isEditing = false }: TripFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    crew: initialData?.crew || [''],
    expenses: initialData?.expenses || { fuel: 0, food: 0, other: 0 },
    tripType: initialData?.tripType || 'Day' as FishingTrip['tripType'],
    totalCatch: initialData?.totalCatch || 0,
    totalSales: initialData?.totalSales || 0,
    ownerSharePercent: initialData?.ownerSharePercent || 0,
    fishSales: initialData?.fishSales || [] as FishSale[],
  });

  const [newFishSale, setNewFishSale] = useState({
    name: '',
    contact: '',
    weight: 0,
    ratePrice: 0,
    paid: false
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

  const addFishSale = () => {
    if (!newFishSale.name.trim() || newFishSale.weight <= 0 || newFishSale.ratePrice <= 0) {
      toast({
        title: "Invalid fish sale",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive"
      });
      return;
    }

    const totalAmount = newFishSale.weight * newFishSale.ratePrice;
    const fishSale: FishSale = {
      id: generateFishSaleId(),
      name: newFishSale.name.trim(),
      contact: newFishSale.contact.trim(),
      weight: newFishSale.weight,
      ratePrice: newFishSale.ratePrice,
      totalAmount,
      paid: newFishSale.paid
    };

    setFormData(prev => ({
      ...prev,
      fishSales: [...prev.fishSales, fishSale],
      totalCatch: prev.totalCatch + newFishSale.weight,
      totalSales: prev.totalSales + totalAmount
    }));

    setNewFishSale({
      name: '',
      contact: '',
      weight: 0,
      ratePrice: 0,
      paid: false
    });

    toast({
      title: "Fish sale added",
      description: `Added sale for ${newFishSale.name}: ${newFishSale.weight}kg at MVR ${newFishSale.ratePrice}/kg`
    });
  };

  const removeFishSale = (id: string) => {
    const saleToRemove = formData.fishSales.find(sale => sale.id === id);
    if (saleToRemove) {
      setFormData(prev => ({
        ...prev,
        fishSales: prev.fishSales.filter(sale => sale.id !== id),
        totalCatch: prev.totalCatch - saleToRemove.weight,
        totalSales: prev.totalSales - saleToRemove.totalAmount
      }));
    }
  };

  const generateInvoice = (fishSale: FishSale, action: 'download' | 'print') => {
    try {
      const boatSettings = BoatSettingsService.getSettings();
      
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
        date: formData.date,
        customer: {
          name: fishSale.name,
          contact: fishSale.contact
        },
        boat: boatSettings,
        fishSale
      };

      if (action === 'download') {
        downloadInvoiceAsPDF(invoiceData);
        toast({
          title: "Invoice generated",
          description: `Invoice for ${fishSale.name} has been downloaded.`
        });
      } else {
        printInvoice(invoiceData);
        toast({
          title: "Invoice printed",
          description: `Invoice for ${fishSale.name} is being printed.`
        });
      }
    } catch (error) {
      toast({
        title: "Error generating invoice",
        description: "There was a problem generating the invoice.",
        variant: "destructive"
      });
    }
  };

  const handleSaveBasic = () => {
    if (!onSaveBasic) return;
    
    const basicTrip = {
      id: initialData?.id || generateTripId(),
      date: formData.date,
      crew: formData.crew.filter(member => member.trim() !== ''),
      expenses: formData.expenses,
      tripType: formData.tripType,
      fishSales: formData.fishSales
    };
    
    onSaveBasic(basicTrip);
    toast({
      title: "Basic trip details saved",
      description: "You can continue adding fish sales."
    });
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
      fishSales: formData.fishSales,
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
          {onSaveBasic && (
            <Button 
              type="button" 
              onClick={handleSaveBasic}
              className="w-full"
              variant="outline"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Basic Trip Details
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fish Sale Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="fishName">Customer Name</Label>
              <Input
                id="fishName"
                placeholder="Customer name"
                value={newFishSale.name}
                onChange={(e) => setNewFishSale(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="fishContact">Contact</Label>
              <Input
                id="fishContact"
                placeholder="Phone/Contact"
                value={newFishSale.contact}
                onChange={(e) => setNewFishSale(prev => ({ ...prev, contact: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="fishWeight">Weight (kg)</Label>
              <Input
                id="fishWeight"
                type="number"
                step="0.1"
                value={newFishSale.weight || ''}
                onChange={(e) => setNewFishSale(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="fishRate">Rate (MVR/kg)</Label>
              <Input
                id="fishRate"
                type="number"
                step="0.01"
                value={newFishSale.ratePrice || ''}
                onChange={(e) => setNewFishSale(prev => ({ ...prev, ratePrice: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="fishPaid"
                  checked={newFishSale.paid}
                  onCheckedChange={(checked) => setNewFishSale(prev => ({ ...prev, paid: checked }))}
                />
                <Label htmlFor="fishPaid" className="text-sm">Paid</Label>
              </div>
              <Button
                type="button"
                onClick={addFishSale}
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Sale
              </Button>
            </div>
          </div>
          
          {newFishSale.weight > 0 && newFishSale.ratePrice > 0 && (
            <div className="text-sm text-muted-foreground">
              Total Amount: MVR {(newFishSale.weight * newFishSale.ratePrice).toFixed(2)}
            </div>
          )}

          {formData.fishSales.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Fish Sales:</div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {formData.fishSales.map((sale) => (
                  <div key={sale.id} className="p-3 bg-muted rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <div><strong>{sale.name}</strong></div>
                        <div>{sale.contact}</div>
                        <div>{sale.weight}kg × MVR {sale.ratePrice}</div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">MVR {sale.totalAmount.toFixed(2)}</span>
                          <span className={`px-2 py-1 rounded text-xs ${sale.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {sale.paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeFishSale(sale.id)}
                        className="ml-2"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => generateInvoice(sale, 'download')}
                        className="flex-1"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Download Invoice
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => generateInvoice(sale, 'print')}
                        className="flex-1"
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Print Invoice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium text-right">
                Total Fish Sales: MVR {formData.fishSales.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}
              </div>
            </div>
          )}
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