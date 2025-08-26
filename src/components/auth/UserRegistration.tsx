import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function UserRegistration() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    boatName: '',
    experience: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
            boat_name: formData.boatName,
            experience: formData.experience,
            reason: formData.reason
          }
        }
      });

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Registration submitted",
        description: "Your registration has been submitted for approval. You will be notified once approved."
      });

      // Reset form
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        boatName: '',
        experience: '',
        reason: ''
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={handleInputChange('fullName')}
                required
              />
            </div>
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange('phoneNumber')}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="boatName">Boat Name (if applicable)</Label>
            <Input
              id="boatName"
              value={formData.boatName}
              onChange={handleInputChange('boatName')}
              placeholder="Enter your boat name"
            />
          </div>

          <div>
            <Label htmlFor="experience">Fishing Experience</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={handleInputChange('experience')}
              placeholder="Tell us about your fishing experience..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="reason">Reason for Registration</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={handleInputChange('reason')}
              placeholder="Why do you want to use this fishing tracker app?"
              rows={3}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Registration'}
          </Button>
        </form>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground">
            <strong>Note:</strong> All new registrations require approval from the administrator. 
            You will receive an email notification once your account is approved and you can start using the app.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}