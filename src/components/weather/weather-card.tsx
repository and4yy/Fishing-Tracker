import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherService, WeatherData, WeatherForecast } from '@/lib/weather';
import { Cloud, Wind, Eye, Gauge, Droplets, MapPin, RefreshCw, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WeatherCardProps {
  onWeatherData?: (weather: WeatherData | null) => void;
  selectedDate?: string;
}

export function WeatherCard({ onWeatherData, selectedDate }: WeatherCardProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWeatherData = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const [current, forecastData] = await Promise.all([
        WeatherService.getCurrentWeather(lat, lng),
        WeatherService.getForecast(lat, lng, 5)
      ]);
      
      setWeatherData(current);
      setForecast(forecastData);
      onWeatherData?.(current);
      
      const locationName = await WeatherService.getLocationFromCoords(lat, lng);
      setLocation(locationName);
      
    } catch (err) {
      setError('Failed to fetch weather data');
      toast({
        title: "Weather Error",
        description: "Could not fetch weather information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive"
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherData(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        
        // Default to Maldives coordinates (Male)
        const defaultLat = 4.1755;
        const defaultLng = 73.5093;
        
        fetchWeatherData(defaultLat, defaultLng);
        
        toast({
          title: "Location Access",
          description: "Using default location (Maldives). Enable location access for accurate weather data.",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const getSelectedDateForecast = () => {
    if (!selectedDate || !forecast.length) return null;
    return forecast.find(f => f.date === selectedDate);
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error && !weatherData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={getCurrentLocation} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const selectedForecast = getSelectedDateForecast();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Weather Conditions
          </CardTitle>
          <Button 
            onClick={getCurrentLocation} 
            variant="ghost" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {location}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4 mt-4">
            {weatherData && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 rounded-lg">
                    <div className="text-3xl font-bold text-primary">{weatherData.temperature}°C</div>
                    <div className="text-sm text-muted-foreground capitalize">{weatherData.description}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Wind className="h-4 w-4 text-blue-500" />
                      <span>{weatherData.windSpeed} m/s {WeatherService.getWindDirection(weatherData.windDirection)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span>{weatherData.humidity}% humidity</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span>{weatherData.visibility}km visibility</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Gauge className="h-4 w-4 text-blue-500" />
                      <span>{weatherData.pressure} hPa</span>
                    </div>
                  </div>
                </div>

                {selectedForecast && selectedDate !== new Date().toISOString().split('T')[0] && (
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Calendar className="h-4 w-4" />
                      Trip Date Forecast ({new Date(selectedDate).toLocaleDateString()})
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Temperature:</span>
                        <br />
                        <span className="font-medium">{selectedForecast.minTemp}°C - {selectedForecast.maxTemp}°C</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Conditions:</span>
                        <br />
                        <span className="font-medium capitalize">{selectedForecast.description}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Wind:</span>
                        <br />
                        <span className="font-medium">{selectedForecast.windSpeed} m/s</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rain:</span>
                        <br />
                        <span className="font-medium">{selectedForecast.precipitation}mm</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="forecast" className="mt-4">
            <div className="space-y-3">
              {forecast.slice(0, 5).map((day, index) => (
                <div 
                  key={day.date} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    day.date === selectedDate 
                      ? 'bg-primary/5 border-primary' 
                      : 'bg-card hover:bg-accent/50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium">
                      {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {day.description}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {day.minTemp}° - {day.maxTemp}°
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Wind className="h-3 w-3" />
                      {day.windSpeed} m/s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}