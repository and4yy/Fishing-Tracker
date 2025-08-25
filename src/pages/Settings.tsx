import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BoatSettingsForm } from "@/components/settings/boat-settings";
import { UserAuth } from "@/components/auth/UserAuth";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { ArrowLeft } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 pb-20 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your app and account preferences</p>
        </div>
      </div>

      <UserAuth />
      <BoatSettingsForm onSave={() => navigate('/')} />
      <NotificationSettings />
    </div>
  );
}