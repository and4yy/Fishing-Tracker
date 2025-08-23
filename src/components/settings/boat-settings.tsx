import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BoatSettings } from "@/types/settings";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, X } from "lucide-react";

const SETTINGS_KEY = 'boat-settings';

export const BoatSettingsService = {
  getSettings(): BoatSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : {
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
      };
    } catch (error) {
      console.error('Error loading boat settings:', error);
      return {
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
      };
    }
  },

  saveSettings(settings: BoatSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving boat settings:', error);
      throw new Error('Failed to save boat settings');
    }
  }
};

interface BoatSettingsFormProps {
  onSave?: (settings: BoatSettings) => void;
  onClose?: () => void;
}

export function BoatSettingsForm({ onSave, onClose }: BoatSettingsFormProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BoatSettings>({
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

  useEffect(() => {
    const savedSettings = BoatSettingsService.getSettings();
    setSettings(savedSettings);
  }, []);

  const handleSave = () => {
    try {
      BoatSettingsService.saveSettings(settings);
      toast({
        title: "Settings saved",
        description: "Your boat details have been saved successfully."
      });
      onSave?.(settings);
      onClose?.();
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your boat details.",
        variant: "destructive"
      });
    }
  };

  const updateSetting = (key: keyof BoatSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive"
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        updateSetting('logoUrl', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    updateSetting('logoUrl', '');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Boat Registration Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="boatName">Boat Name</Label>
            <Input
              id="boatName"
              placeholder="Enter boat name"
              value={settings.boatName}
              onChange={(e) => updateSetting('boatName', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input
              id="ownerName"
              placeholder="Enter owner name"
              value={settings.ownerName}
              onChange={(e) => updateSetting('ownerName', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              placeholder="Enter contact number"
              value={settings.contactNumber}
              onChange={(e) => updateSetting('contactNumber', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={settings.email}
              onChange={(e) => updateSetting('email', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="registrationNumber">Registration Number</Label>
          <Input
            id="registrationNumber"
            placeholder="Enter boat registration number"
            value={settings.registrationNumber}
            onChange={(e) => updateSetting('registrationNumber', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="logo">Boat Logo</Label>
          <div className="space-y-2">
            {settings.logoUrl ? (
              <div className="flex items-center gap-4">
                <img 
                  src={settings.logoUrl} 
                  alt="Boat logo" 
                  className="h-16 w-16 object-contain border rounded"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={removeLogo}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Logo
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <Label htmlFor="logo" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-input bg-background hover:bg-accent rounded-md">
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </div>
                </Label>
                <span className="text-sm text-muted-foreground">Max 2MB, image files only</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="Enter address"
            value={settings.address}
            onChange={(e) => updateSetting('address', e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Bank Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                placeholder="Enter bank name"
                value={settings.bankName}
                onChange={(e) => updateSetting('bankName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                placeholder="Enter account holder name"
                value={settings.accountName}
                onChange={(e) => updateSetting('accountName', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              placeholder="Enter account number"
              value={settings.accountNumber}
              onChange={(e) => updateSetting('accountNumber', e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}