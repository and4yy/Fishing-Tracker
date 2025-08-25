import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, Smartphone } from "lucide-react";
import { PushNotificationService } from "@/lib/push-notifications";
import { useToast } from "@/hooks/use-toast";

export function PushNotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationSupport();
  }, []);

  const checkNotificationSupport = async () => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      
      // Initialize service worker
      await PushNotificationService.initialize();
      
      // Check if already subscribed
      const subscribed = await PushNotificationService.isSubscribed();
      setIsSubscribed(subscribed);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    setLoading(true);
    
    try {
      if (enabled) {
        // Request permission first
        const hasPermission = await PushNotificationService.requestPermission();
        
        if (!hasPermission) {
          toast({
            title: "Permission denied",
            description: "Please allow notifications in your browser settings.",
            variant: "destructive"
          });
          return;
        }

        // Subscribe to push notifications
        const success = await PushNotificationService.subscribeUser();
        
        if (success) {
          setIsSubscribed(true);
          setPermission('granted');
          toast({
            title: "Notifications enabled",
            description: "You'll receive reminders about unpaid sales twice daily at 9 AM and 6 PM.",
          });
        } else {
          toast({
            title: "Failed to enable notifications",
            description: "Please try again or check your browser settings.",
            variant: "destructive"
          });
        }
      } else {
        // Unsubscribe from push notifications
        const success = await PushNotificationService.unsubscribeUser();
        
        if (success) {
          setIsSubscribed(false);
          toast({
            title: "Notifications disabled",
            description: "You won't receive push notifications anymore.",
          });
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('https://khkmhxxvspsmszpebfiz.supabase.co/functions/v1/send-unpaid-sales-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true })
      });

      if (response.ok) {
        toast({
          title: "Test notification sent",
          description: "Check your device for the notification.",
        });
      } else {
        throw new Error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Test failed",
        description: "Failed to send test notification.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about unpaid sales twice daily (9 AM & 6 PM)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Enable push notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive reminders about unpaid sales on your device
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={isSubscribed && permission === 'granted'}
            onCheckedChange={handleToggleNotifications}
            disabled={loading}
          />
        </div>

        {permission === 'denied' && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            <div className="flex items-center gap-2">
              <BellOff className="h-4 w-4" />
              <span>Notifications are blocked. Please enable them in your browser settings.</span>
            </div>
          </div>
        )}

        {isSubscribed && (
          <div className="space-y-3">
            <div className="p-3 bg-primary/10 text-primary rounded-md text-sm">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Notifications are active. You'll receive reminders at 9 AM and 6 PM daily.</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestNotification}
              disabled={loading}
            >
              Send Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}