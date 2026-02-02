import axios from 'axios';
import { CacheService } from './cache.service';

interface WeatherData {
  date: string;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  pressure: number;
  visibility: number;
  clouds: number;
}

interface OpenWeatherResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
    };
    visibility: number;
    dt_txt: string;
  }>;
}

export class WeatherService {
  private static readonly API_KEY = process.env.OPENWEATHER_API_KEY;
  private static readonly BULACAN_LAT = 14.7942;
  private static readonly BULACAN_LON = 120.8794;
  private static readonly CACHE_KEY = 'weather:bulacan';
  private static readonly CACHE_TTL = parseInt(process.env.WEATHER_CACHE_TTL || '10800'); // 3 hours

  static async getBulacanForecast(days: number = 7): Promise<WeatherData[]> {
    try {
      const cached = await CacheService.get<WeatherData[]>(this.CACHE_KEY);
      if (cached && cached.length > 0) {
        console.log('✅ Weather data retrieved from cache');
        return cached.slice(0, days * 8);
      }

      console.log('🌤️ Fetching weather data from OpenWeatherMap API...');
      const response = await axios.get<OpenWeatherResponse>(
        'https://api.openweathermap.org/data/2.5/forecast',
        {
          params: {
            lat: this.BULACAN_LAT,
            lon: this.BULACAN_LON,
            appid: this.API_KEY,
            units: 'metric',
            cnt: days * 8
          },
          timeout: 10000
        }
      );

      const weatherData = this.parseWeatherData(response.data);
      
      await CacheService.set(this.CACHE_KEY, weatherData, this.CACHE_TTL);
      console.log('✅ Weather data cached successfully');

      return weatherData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Weather API error:', error.response?.data || error.message);
      } else {
        console.error('Weather service error:', error);
      }
      throw new Error('Failed to fetch weather data');
    }
  }

  static async getDailyForecast(days: number = 7): Promise<WeatherData[]> {
    const forecast = await this.getBulacanForecast(days);
    
    const dailyData: Map<string, WeatherData[]> = new Map();
    
    forecast.forEach(item => {
      const date = item.date.split(' ')[0];
      if (!dailyData.has(date)) {
        dailyData.set(date, []);
      }
      dailyData.get(date)!.push(item);
    });

    const dailyForecast: WeatherData[] = [];
    dailyData.forEach((items, date) => {
      const avgTemp = items.reduce((sum, item) => sum + item.temperature, 0) / items.length;
      const maxTemp = Math.max(...items.map(item => item.tempMax));
      const minTemp = Math.min(...items.map(item => item.tempMin));
      const avgHumidity = items.reduce((sum, item) => sum + item.humidity, 0) / items.length;
      const avgWindSpeed = items.reduce((sum, item) => sum + item.windSpeed, 0) / items.length;
      
      const noonItem = items.find(item => {
        const hour = parseInt(item.date.split(' ')[1].split(':')[0]);
        return hour === 12;
      }) || items[Math.floor(items.length / 2)];

      dailyForecast.push({
        date,
        temperature: Math.round(avgTemp * 10) / 10,
        feelsLike: noonItem.feelsLike,
        tempMin: Math.round(minTemp * 10) / 10,
        tempMax: Math.round(maxTemp * 10) / 10,
        condition: noonItem.condition,
        description: noonItem.description,
        humidity: Math.round(avgHumidity),
        windSpeed: Math.round(avgWindSpeed * 10) / 10,
        icon: noonItem.icon,
        pressure: noonItem.pressure,
        visibility: noonItem.visibility,
        clouds: noonItem.clouds
      });
    });

    return dailyForecast.slice(0, days);
  }

  private static parseWeatherData(data: OpenWeatherResponse): WeatherData[] {
    return data.list.map(item => ({
      date: item.dt_txt,
      temperature: Math.round(item.main.temp * 10) / 10,
      feelsLike: Math.round(item.main.feels_like * 10) / 10,
      tempMin: Math.round(item.main.temp_min * 10) / 10,
      tempMax: Math.round(item.main.temp_max * 10) / 10,
      condition: item.weather[0].main,
      description: item.weather[0].description,
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 10) / 10,
      icon: item.weather[0].icon,
      pressure: item.main.pressure,
      visibility: item.visibility,
      clouds: item.clouds.all
    }));
  }

  static async clearCache(): Promise<boolean> {
    return await CacheService.delete(this.CACHE_KEY);
  }

  static getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  static getWeatherConditionColor(condition: string): string {
    const colors: Record<string, string> = {
      'Clear': '#FDB813',
      'Clouds': '#95A5A6',
      'Rain': '#3498DB',
      'Drizzle': '#5DADE2',
      'Thunderstorm': '#8E44AD',
      'Snow': '#ECF0F1',
      'Mist': '#BDC3C7',
      'Fog': '#7F8C8D',
      'Haze': '#D5DBDB'
    };
    return colors[condition] || '#95A5A6';
  }
}

export default WeatherService;
