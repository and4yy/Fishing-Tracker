import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, LogOut, Mail, Lock, UserPlus, LogIn, MessageCircle } from 'lucide-react';

export function UserAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, signUp, signIn, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const { error } = await signUp(email, password);
    
    if (error) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'Could not create account. Please try again.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Account created',
        description: 'Please check your email to verify your account.'
      });
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'Could not sign in. Please try again.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in.'
      });
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = '9607371611';
    const message = 'Hello, I would like to register for an account to enable online data saving.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    try {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      // Fallback: copy phone number to clipboard
      navigator.clipboard.writeText(`+960 ${phoneNumber}`).then(() => {
        toast({
          title: 'Phone number copied!',
          description: 'WhatsApp link blocked. Phone number copied to clipboard: +960 7371611'
        });
      }).catch(() => {
        toast({
          title: 'Contact Information',
          description: 'Please contact us at +960 7371611 via WhatsApp for registration.',
          variant: 'default'
        });
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.'
      });
    }
  };

  if (user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>
            You are signed in and your data is saved online
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-muted-foreground">Online account</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            ✓ Your fishing trips and settings are automatically saved online
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Save Data Online
        </CardTitle>
        <CardDescription>
          Create an account to save your data online and access it from any device
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <Label htmlFor="signin-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="signin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
            <h4 className="font-medium mb-3 text-primary">Account Registration</h4>
            <p className="text-sm text-muted-foreground mb-4">
              To enable online data saving, users are required to sign up for an account. For registration, please contact us via WhatsApp at <strong>+960 7371611</strong>. A one-time registration fee of MVR 1,000 (One Thousand Maldivian Rufiyaa) applies. Thank you for your understanding and support!
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleWhatsAppContact}
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20c55a] text-white border-[#25D366] hover:border-[#20c55a]"
            >
              <MessageCircle className="h-4 w-4" />
              Contact via WhatsApp
            </Button>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Benefits of creating an account:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Access your data from any device</li>
            <li>• Automatic backup of all fishing trips</li>
            <li>• Secure cloud storage</li>
            <li>• Never lose your data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}