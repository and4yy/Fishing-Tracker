import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { WeatherForecast } from '@/lib/weather';
import { Wind, CloudRain, Sun, Cloud, Thermometer } from 'lucide-react';

interface WeatherDetailModalProps {
  forecast: WeatherForecast;
  index: number;
  children: React.ReactNode;
}

export function WeatherDetailModal({ forecast, index, children }: WeatherDetailModalProps) {
  const getWeatherIcon = (weatherCode: number) => {
    if (weatherCode === 0 || weatherCode === 1) return Sun;
    if (weatherCode === 2 || weatherCode === 3) return Cloud;
    if (weatherCode >= 51 && weatherCode <= 82) return CloudRain;
    if (weatherCode >= 95) return Cloud; // Thunderstorm
    return Cloud;
  };

  const getFishingConditions = (weather: WeatherForecast) => {
    const windSpeed = weather.windSpeed || 0;
    const precipitation = weather.precipitation || 0;
    
    if (windSpeed > 15 || precipitation > 10) {
      return { condition: 'Poor', color: 'text-red-500', description: 'High winds or heavy rain' };
    }
    if (windSpeed > 10 || precipitation > 5) {
      return { condition: 'Fair', color: 'text-yellow-500', description: 'Moderate conditions' };
    }
    return { condition: 'Good', color: 'text-green-500', description: 'Calm and clear' };
  };

  const WeatherIcon = getWeatherIcon(forecast.weatherCode);
  const fishingCondition = getFishingConditions(forecast);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <WeatherIcon className="h-5 w-5" />
            {index === 0 ? 'Today\'s Weather' : new Date(forecast.date).toLocaleDateString('en', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Temperature Overview */}
          <div className="text-center p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 rounded-lg">
            <div className="flex justify-center items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{forecast.maxTemp}°C</div>
                <div className="text-xs text-muted-foreground">High</div>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{forecast.minTemp}°C</div>
                <div className="text-xs text-muted-foreground">Low</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-2 capitalize">{forecast.description}</div>
          </div>
          
          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/20">
              <Wind className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">{forecast.windSpeed} m/s</div>
                <div className="text-xs text-muted-foreground">Wind Speed</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/20">
              <CloudRain className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">{forecast.precipitation}mm</div>
                <div className="text-xs text-muted-foreground">Precipitation</div>
              </div>
            </div>
          </div>
          
          {/* Fishing Conditions */}
          <div className="p-4 rounded-lg border-l-4 border-l-primary bg-primary/5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Fishing Conditions</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                fishingCondition.condition === 'Good' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' :
                fishingCondition.condition === 'Fair' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' :
                'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
              }`}>
                {fishingCondition.condition}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{fishingCondition.description}</p>
            {fishingCondition.condition === 'Good' && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                • Ideal for offshore fishing<br/>
                • Calm seas expected<br/>
                • Good visibility
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}