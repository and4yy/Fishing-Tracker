import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, LogOut, Mail, Lock, UserPlus, LogIn, MessageCircle } from 'lucide-react';

export function UserAuth({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { user, signUp, signIn, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName || !contactNumber) return;

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
        description: 'Please check your email to verify your account and contact us via WhatsApp for approval.'
      });
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setContactNumber('');
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
    const phoneNumber = '7371611';
    const message = `Hello, I have registered for an account and would like to request login approval to enable online data saving. My details are:
Name: ${firstName} ${lastName}
Email: ${email}
Contact: ${contactNumber}`;
    
    // Check if user is on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile devices, use whatsapp:// scheme first, fallback to wa.me
      const whatsappScheme = `whatsapp://send?phone=960${phoneNumber}&text=${encodeURIComponent(message)}`;
      const whatsappWeb = `https://wa.me/960${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      // Try opening WhatsApp app directly
      window.location.href = whatsappScheme;
      
      // Fallback to web version after a short delay
      setTimeout(() => {
        try {
          window.open(whatsappWeb, '_blank', 'noopener,noreferrer');
        } catch (error) {
          // Final fallback - show phone number
          toast({
            title: 'Contact via WhatsApp',
            description: `Please contact us at +960 ${phoneNumber} via WhatsApp for registration.`,
            duration: 5000
          });
        }
      }, 500);
    } else {
      // For desktop, use wa.me directly
      const whatsappUrl = `https://wa.me/960${phoneNumber}?text=${encodeURIComponent(message)}`;
      
      try {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
        // Fallback: copy phone number to clipboard
        navigator.clipboard.writeText(`+960 ${phoneNumber}`).then(() => {
          toast({
            title: 'Phone number copied!',
            description: `WhatsApp link blocked. Phone number copied to clipboard: +960 ${phoneNumber}`
          });
        }).catch(() => {
          toast({
            title: 'Contact Information',
            description: `Please contact us at +960 ${phoneNumber} via WhatsApp for registration.`,
            variant: 'default'
          });
        });
      }
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
          Account Management
        </CardTitle>
        <CardDescription>
          Sign in to existing account or register for online data saving
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full" onValueChange={(value) => {
          setActiveTab(value);
          onTabChange?.(value);
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Register
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 mt-4">
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
                <LogIn className="h-4 w-4 mr-2" />
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="signup-firstname">First Name</Label>
                  <Input
                    id="signup-firstname"
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="signup-lastname">Last Name</Label>
                  <Input
                    id="signup-lastname"
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="signup-contact">Contact Number</Label>
                <Input
                  id="signup-contact"
                  type="tel"
                  placeholder="Enter contact number (without country code)"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
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
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <UserPlus className="h-4 w-4 mr-2" />
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium mb-2 text-yellow-800">Important Note</h4>
              <p className="text-sm text-yellow-700 mb-3">
                After registration, your account will be in pending status. You need admin approval to login and start using online features.
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
              <h4 className="font-medium mb-3 text-primary">Request Login Approval</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Once you've created your account, contact us via WhatsApp at <strong>+960 7371611</strong> to request login approval. A one-time fee of MVR 1,000 applies for account activation.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleWhatsAppContact}
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20c55a] text-white border-[#25D366] hover:border-[#20c55a]"
              >
                <MessageCircle className="h-4 w-4" />
                Request Approval via WhatsApp
              </Button>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Benefits of online account:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Access your data from any device</li>
                <li>• Automatic backup of all fishing trips</li>
                <li>• Secure cloud storage</li>
                <li>• Never lose your data</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}