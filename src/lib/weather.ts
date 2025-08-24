export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  visibility: number;
  pressure: number;
  description: string;
}

export interface WeatherForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  windSpeed: number;
  precipitation: number;
  description: string;
}

const WEATHER_CODES: { [key: number]: string } = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy", 
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail"
};

export class WeatherService {
  private static readonly BASE_URL = 'https://api.open-meteo.com/v1';
  
  static async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,visibility,surface_pressure',
      timezone: 'auto'
    });

    const response = await fetch(`${this.BASE_URL}/forecast?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();
    const current = data.current;

    return {
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      windDirection: current.wind_direction_10m,
      weatherCode: current.weather_code,
      visibility: current.visibility ? Math.round(current.visibility / 1000) : 0,
      pressure: Math.round(current.surface_pressure),
      description: WEATHER_CODES[current.weather_code] || "Unknown"
    };
  }

  static async getForecast(latitude: number, longitude: number, days: number = 7): Promise<WeatherForecast[]> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,precipitation_sum',
      timezone: 'auto',
      forecast_days: days.toString()
    });

    const response = await fetch(`${this.BASE_URL}/forecast?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch forecast data');
    }

    const data = await response.json();
    const daily = data.daily;

    return daily.time.map((date: string, index: number) => ({
      date,
      maxTemp: Math.round(daily.temperature_2m_max[index]),
      minTemp: Math.round(daily.temperature_2m_min[index]),
      weatherCode: daily.weather_code[index],
      windSpeed: Math.round(daily.wind_speed_10m_max[index] * 10) / 10,
      precipitation: Math.round(daily.precipitation_sum[index] * 10) / 10,
      description: WEATHER_CODES[daily.weather_code[index]] || "Unknown"
    }));
  }

  static getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  static async getLocationFromCoords(latitude: number, longitude: number): Promise<string> {
    try {
      // Using a simple reverse geocoding approach
      return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
    } catch (error) {
      return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
    }
  }
}