import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { WeatherService } from '../services/weather.service';

export const getBulacanWeather = async (req: AuthRequest, res: Response) => {
  try {
    const { days = '7', type = 'daily' } = req.query;
    const numDays = Math.min(parseInt(days as string), 7);

    let weatherData;
    if (type === 'daily') {
      weatherData = await WeatherService.getDailyForecast(numDays);
    } else {
      weatherData = await WeatherService.getBulacanForecast(numDays);
    }

    return res.json({
      location: 'Bulacan, Philippines',
      coordinates: {
        latitude: 14.7942,
        longitude: 120.8794
      },
      forecast: weatherData,
      cached: true
    });
  } catch (error) {
    console.error('Get weather error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const clearWeatherCache = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const user = await require('../lib/prisma').prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await WeatherService.clearCache();
    return res.json({ message: 'Weather cache cleared successfully' });
  } catch (error) {
    console.error('Clear weather cache error:', error);
    return res.status(500).json({ error: 'Failed to clear weather cache' });
  }
};

export const getWeatherIcon = async (req: AuthRequest, res: Response) => {
  try {
    const { icon } = req.params;
    const iconUrl = WeatherService.getWeatherIconUrl(icon);
    return res.json({ iconUrl });
  } catch (error) {
    console.error('Get weather icon error:', error);
    return res.status(500).json({ error: 'Failed to get weather icon' });
  }
};
