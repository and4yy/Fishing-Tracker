import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff } from "lucide-react";
import { PushNotificationService } from "@/lib/push-notifications";
import { useToast } from "@/hooks/use-toast";

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    setIsLoading(true);
    
    const supported = await PushNotificationService.initialize();
    setIsSupported(supported);
    
    if (supported) {
      const subscribed = await PushNotificationService.isSubscribed();
      setIsSubscribed(subscribed);
    }
    
    setIsLoading(false);
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!isSupported) {
      toast({
        title: "Not supported",
        description: "Push notifications are not supported in this browser",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (enabled) {
        const permissionGranted = await PushNotificationService.requestPermission();
        
        if (!permissionGranted) {
          toast({
            title: "Permission denied",
            description: "Please allow notifications in your browser settings",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        const subscribed = await PushNotificationService.subscribeUser();
        
        if (subscribed) {
          setIsSubscribed(true);
          toast({
            title: "Notifications enabled",
            description: "You'll receive reminders about unpaid sales twice daily"
          });
        } else {
          toast({
            title: "Subscription failed",
            description: "Failed to enable notifications",
            variant: "destructive"
          });
        }
      } else {
        const unsubscribed = await PushNotificationService.unsubscribeUser();
        
        if (unsubscribed) {
          setIsSubscribed(false);
          toast({
            title: "Notifications disabled",
            description: "You won't receive notification reminders anymore"
          });
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification for unpaid sales reminders',
        icon: '/favicon.ico'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSubscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get reminded about unpaid sales twice daily (9 AM and 6 PM)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported ? (
          <div className="text-sm text-muted-foreground">
            Push notifications are not supported in this browser.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm font-medium">
                Enable push notifications
              </Label>
              <Switch
                id="notifications"
                checked={isSubscribed}
                onCheckedChange={handleNotificationToggle}
                disabled={isLoading}
              />
            </div>
            
            {isSubscribed && (
              <Button
                variant="outline"
                size="sm"
                onClick={testNotification}
                className="w-full"
              >
                Send test notification
              </Button>
            )}
            
            <div className="text-xs text-muted-foreground">
              Notifications will remind you about unpaid fish sales that need attention.
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}