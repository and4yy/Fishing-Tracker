-- Add approval status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add is_admin column to profiles table  
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for status lookups
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Create index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON public.profiles(is_admin);

-- Update the handle_new_user function to set default status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, status, is_admin)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'pending',
    FALSE
  );
  RETURN NEW;
END;
$$;