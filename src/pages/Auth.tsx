import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Anchor, ArrowLeft, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithPhone, verifyOtp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast({
        title: 'Phone number required',
        description: 'Please enter your phone number.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error } = await signInWithPhone(phone);
    
    if (error) {
      toast({
        title: 'Failed to send OTP',
        description: error.message || 'Could not send verification code. Please try again.',
        variant: 'destructive'
      });
    } else {
      setStep('otp');
      toast({
        title: 'OTP sent!',
        description: 'Check your phone for the verification code.'
      });
    }
    setLoading(false);
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit verification code.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(phone, otp);
    
    if (error) {
      toast({
        title: 'Verification failed',
        description: error.message || 'Invalid verification code. Please try again.',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Welcome!',
        description: 'Successfully signed in to Fishing Tracker.'
      });
      // Navigation will happen automatically via useEffect when user state changes
    }
    setLoading(false);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Add + prefix if not present and has digits
    if (digits && !value.startsWith('+')) {
      return '+' + digits;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 ocean-gradient rounded-full">
              <Anchor className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Fishing Tracker</h1>
            <p className="text-muted-foreground">Sign in to track your fishing adventures</p>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Smartphone className="h-5 w-5" />
              {step === 'phone' ? 'Enter Phone Number' : 'Enter Verification Code'}
            </CardTitle>
            <CardDescription>
              {step === 'phone' 
                ? 'We\'ll send you a verification code via SMS' 
                : `We sent a 6-digit code to ${phone}`
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+960 123 4567"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    className="text-center"
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g., +960 for Maldives)
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !phone.trim()}
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Verification Code
                  </label>
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={loading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Phone Number
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          By signing in, you agree to use Fishing Tracker responsibly
        </p>
      </div>
    </div>
  );
}