-- Create fishing trips table
CREATE TABLE public.fishing_trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  crew TEXT[] NOT NULL DEFAULT '{}',
  expenses JSONB NOT NULL DEFAULT '{"fuel": 0, "food": 0, "other": 0}',
  fish_sales JSONB NOT NULL DEFAULT '[]',
  trip_type TEXT NOT NULL CHECK (trip_type IN ('Private Hire', 'Yellow Fin Tuna', 'Reef Fish', 'Kalhubilamas', 'Latti/Raagondi')),
  hire_details JSONB,
  weather_conditions JSONB,
  total_catch DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_sales DECIMAL(10,2) NOT NULL DEFAULT 0,
  profit DECIMAL(10,2) NOT NULL DEFAULT 0,
  owner_share_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  profit_per_crew DECIMAL(10,2) NOT NULL DEFAULT 0,
  owner_profit DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fishing_trips ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own trips" 
ON public.fishing_trips 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trips" 
ON public.fishing_trips 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" 
ON public.fishing_trips 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" 
ON public.fishing_trips 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fishing_trips_updated_at
BEFORE UPDATE ON public.fishing_trips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_fishing_trips_user_id ON public.fishing_trips(user_id);
CREATE INDEX idx_fishing_trips_date ON public.fishing_trips(date DESC);