import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BoatSettings } from "@/types/settings";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SETTINGS_KEY = 'boat-settings';

export const BoatSettingsService = {
  async getSettings(): Promise<BoatSettings> {
    try {
      // Try to get settings from Supabase first
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          return {
            boatName: data.boat_name || '',
            ownerName: data.owner_name || '',
            contactNumber: data.contact_number || '',
            email: data.email || '',
            address: data.address || '',
            registrationNumber: data.registration_number || '',
            logoUrl: data.logo_url || '',
            bankName: data.bank_name || '',
            accountNumber: data.account_number || '',
            accountName: data.account_name || ''
          };
        }
      }
      
      // Fallback to localStorage
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
      // Fallback to localStorage on error
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
    }
  },

  async saveSettings(settings: BoatSettings): Promise<void> {
    try {
      // Save to localStorage first as backup
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      
      // Try to save to Supabase if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const settingsData = {
          user_id: user.id,
          boat_name: settings.boatName,
          owner_name: settings.ownerName,
          contact_number: settings.contactNumber,
          email: settings.email,
          address: settings.address,
          registration_number: settings.registrationNumber,
          logo_url: settings.logoUrl,
          bank_name: settings.bankName,
          account_number: settings.accountNumber,
          account_name: settings.accountName
        };
        
        const { error } = await supabase
          .from('user_settings')
          .upsert(settingsData);
        
        if (error) {
          console.error('Error saving to Supabase:', error);
          // Continue with localStorage save as fallback
        }
      }
    } catch (error) {
      console.error('Error saving boat settings:', error);
      throw new Error('Failed to save boat settings');
    }
  },

  async syncLocalDataToSupabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get local settings
      const localData = localStorage.getItem(SETTINGS_KEY);
      if (!localData) return;

      const settings = JSON.parse(localData);
      
      // Check if Supabase has settings
      const { data: existingData } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Only sync if no Supabase data exists
      if (!existingData) {
        await this.saveSettings(settings);
      }
    } catch (error) {
      console.error('Error syncing local data to Supabase:', error);
    }
  }
};

interface BoatSettingsFormProps {
  onSave?: (settings: BoatSettings) => void;
  onClose?: () => void;
}

export function BoatSettingsForm({ onSave, onClose }: BoatSettingsFormProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
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

  // Check if boat is registered (has essential details)
  const isRegistered = settings.boatName && settings.ownerName && settings.contactNumber;

  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await BoatSettingsService.getSettings();
      setSettings(savedSettings);
      // If no essential details exist, start in editing mode
      const hasEssentialDetails = savedSettings.boatName && savedSettings.ownerName && savedSettings.contactNumber;
      setIsEditing(!hasEssentialDetails);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      await BoatSettingsService.saveSettings(settings);
      toast({
        title: "Settings saved",
        description: "Your boat details have been saved successfully."
      });
      setIsEditing(false);
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
        <div className="flex items-center justify-between">
          <CardTitle>Boat Registration Details</CardTitle>
          {isRegistered && !isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing && isRegistered ? (
          // Display view
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Boat Name</Label>
                <p className="text-sm">{settings.boatName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Owner Name</Label>
                <p className="text-sm">{settings.ownerName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Contact Number</Label>
                <p className="text-sm">{settings.contactNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                <p className="text-sm">{settings.email}</p>
              </div>
            </div>

            {settings.registrationNumber && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Registration Number</Label>
                <p className="text-sm">{settings.registrationNumber}</p>
              </div>
            )}

            {settings.logoUrl && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Boat Logo</Label>
                <img 
                  src={settings.logoUrl} 
                  alt="Boat logo" 
                  className="h-16 w-16 object-contain border rounded mt-2"
                />
              </div>
            )}

            {settings.address && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                <p className="text-sm whitespace-pre-wrap">{settings.address}</p>
              </div>
            )}

            {(settings.bankName || settings.accountName || settings.accountNumber) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.bankName && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Bank Name</Label>
                      <p className="text-sm">{settings.bankName}</p>
                    </div>
                  )}
                  {settings.accountName && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Account Name</Label>
                      <p className="text-sm">{settings.accountName}</p>
                    </div>
                  )}
                </div>
                {settings.accountNumber && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Account Number</Label>
                    <p className="text-sm">{settings.accountNumber}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Edit form
          <>
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
              {isRegistered && (
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
              )}
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}