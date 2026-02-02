import { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye } from 'lucide-react';
import api from '../lib/api';

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

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  meetingType: string;
}

interface WeatherCalendarProps {
  classroomId?: string;
}

const WEATHER_ICONS: { [key: string]: any } = {
  'Clear': Sun,
  'Clouds': Cloud,
  'Rain': CloudRain,
  'Drizzle': CloudRain,
  'Thunderstorm': CloudRain,
  'Snow': Cloud,
  'Mist': Cloud,
  'Fog': Cloud,
  'Haze': Cloud,
};

const WEATHER_COLORS: { [key: string]: string } = {
  'Clear': 'from-yellow-400 to-orange-400',
  'Clouds': 'from-gray-400 to-gray-500',
  'Rain': 'from-blue-400 to-blue-600',
  'Drizzle': 'from-blue-300 to-blue-400',
  'Thunderstorm': 'from-purple-500 to-purple-700',
  'Snow': 'from-blue-100 to-blue-200',
  'Mist': 'from-gray-300 to-gray-400',
  'Fog': 'from-gray-300 to-gray-400',
  'Haze': 'from-gray-200 to-gray-300',
};

export default function WeatherCalendar({ classroomId }: WeatherCalendarProps) {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetchWeatherAndMeetings();
  }, [classroomId]);

  const fetchWeatherAndMeetings = async () => {
    try {
      setLoading(true);
      
      const weatherRes = await api.get('/weather/forecast', {
        params: { days: 7, type: 'daily' }
      });
      
      setWeatherData(weatherRes.data.forecast);

      if (classroomId) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 7);

        const meetingsRes = await api.get(`/classrooms/${classroomId}/meetings/calendar`, {
          params: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        });
        
        setMeetings(meetingsRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch weather and meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMeetingsForDate = (date: string) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime).toISOString().split('T')[0];
      return meetingDate === date;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const getWeatherIcon = (condition: string) => {
    const IconComponent = WEATHER_ICONS[condition] || Cloud;
    return IconComponent;
  };

  const getWeatherGradient = (condition: string) => {
    return WEATHER_COLORS[condition] || 'from-gray-400 to-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl">
          <Cloud className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Weather Forecast</h2>
          <p className="text-sm text-gray-400">Bulacan, Philippines - 7 Day Forecast</p>
        </div>
      </div>

      {/* Weather Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {weatherData.map((day, index) => {
          const WeatherIcon = getWeatherIcon(day.condition);
          const dayMeetings = getMeetingsForDate(day.date);
          const isToday = index === 0;

          return (
            <div
              key={day.date}
              onClick={() => setSelectedDay(day)}
              className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all hover:scale-105 hover:shadow-2xl ${
                selectedDay?.date === day.date
                  ? 'ring-4 ring-cyan-500 shadow-2xl shadow-cyan-500/50'
                  : ''
              }`}
            >
              {/* Weather Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getWeatherGradient(day.condition)} opacity-90`}></div>
              
              {/* Content */}
              <div className="relative p-6 text-white">
                {/* Date & Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium opacity-90">
                      {formatDate(day.date)}
                    </p>
                    {isToday && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-white/30 backdrop-blur-sm rounded-full text-xs font-semibold">
                        Today
                      </span>
                    )}
                  </div>
                  <WeatherIcon className="w-12 h-12 opacity-90" />
                </div>

                {/* Temperature */}
                <div className="mb-4">
                  <div className="text-5xl font-bold">{Math.round(day.temperature)}°</div>
                  <p className="text-sm opacity-90 capitalize">{day.description}</p>
                  <p className="text-xs opacity-75 mt-1">
                    Feels like {Math.round(day.feelsLike)}°
                  </p>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    <span>{day.windSpeed} m/s</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    <span>{day.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{(day.visibility / 1000).toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4" />
                    <span>{day.clouds}%</span>
                  </div>
                </div>

                {/* Meetings Indicator */}
                {dayMeetings.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs font-semibold mb-2">
                      📅 {dayMeetings.length} meeting{dayMeetings.length > 1 ? 's' : ''}
                    </p>
                    <div className="space-y-1">
                      {dayMeetings.slice(0, 2).map(meeting => (
                        <div key={meeting.id} className="text-xs opacity-90 truncate">
                          • {formatTime(meeting.startTime)} - {meeting.title}
                        </div>
                      ))}
                      {dayMeetings.length > 2 && (
                        <div className="text-xs opacity-75">
                          +{dayMeetings.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* High/Low Temp */}
                <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs">
                  <span>↑ {Math.round(day.tempMax)}°</span>
                  <span>↓ {Math.round(day.tempMin)}°</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Details Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  {(() => {
                    const WeatherIcon = getWeatherIcon(selectedDay.condition);
                    return <WeatherIcon className="w-12 h-12 text-white" />;
                  })()}
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {formatDate(selectedDay.date)}
                    </h3>
                    <p className="text-gray-300 capitalize">{selectedDay.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
                >
                  ✕
                </button>
              </div>

              {/* Temperature & Details */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 rounded-2xl p-6">
                  <p className="text-sm text-gray-400 mb-2">Temperature</p>
                  <p className="text-4xl font-bold text-white mb-2">
                    {Math.round(selectedDay.temperature)}°C
                  </p>
                  <p className="text-sm text-gray-300">
                    Feels like {Math.round(selectedDay.feelsLike)}°C
                  </p>
                  <div className="mt-4 flex justify-between text-sm text-gray-300">
                    <span>High: {Math.round(selectedDay.tempMax)}°</span>
                    <span>Low: {Math.round(selectedDay.tempMin)}°</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Humidity</span>
                    <span className="text-white font-semibold">{selectedDay.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Wind Speed</span>
                    <span className="text-white font-semibold">{selectedDay.windSpeed} m/s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Pressure</span>
                    <span className="text-white font-semibold">{selectedDay.pressure} hPa</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Visibility</span>
                    <span className="text-white font-semibold">
                      {(selectedDay.visibility / 1000).toFixed(1)} km
                    </span>
                  </div>
                </div>
              </div>

              {/* Meetings for this day */}
              {(() => {
                const dayMeetings = getMeetingsForDate(selectedDay.date);
                if (dayMeetings.length > 0) {
                  return (
                    <div className="bg-white/5 rounded-2xl p-6">
                      <h4 className="text-lg font-semibold text-white mb-4">
                        Scheduled Meetings ({dayMeetings.length})
                      </h4>
                      <div className="space-y-3">
                        {dayMeetings.map(meeting => (
                          <div
                            key={meeting.id}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                          >
                            <div>
                              <p className="font-semibold text-white">{meeting.title}</p>
                              <p className="text-sm text-gray-400">
                                {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm">
                              {meeting.meetingType}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
