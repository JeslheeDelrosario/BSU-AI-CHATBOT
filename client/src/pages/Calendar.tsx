import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import CalendarViewSelector, { CalendarViewType } from '../components/CalendarViewSelector';
import WeatherCalendar from '../components/WeatherCalendar';
import HolidayCalendar from '../components/HolidayCalendar';
import TaskManager from '../components/TaskManager';
import api from '../lib/api';

export default function Calendar() {
  const [currentView, setCurrentView] = useState<CalendarViewType>('MONTH');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserPreference();
  }, []);

  const loadUserPreference = async () => {
    try {
      const response = await api.get('/calendar/preferences');
      if (response.data.viewType) {
        setCurrentView(response.data.viewType);
      }
    } catch (error) {
      console.error('Failed to load calendar preference:', error);
    }
  };

  const handleViewChange = async (view: CalendarViewType) => {
    setCurrentView(view);
    
    try {
      await api.put('/calendar/preferences', { viewType: view });
    } catch (error) {
      console.error('Failed to save calendar preference:', error);
    }
  };

  const renderCalendarView = () => {
    switch (currentView) {
      case 'WEATHER':
        return <WeatherCalendar />;
      
      case 'HOLIDAY':
        return <HolidayCalendar />;
      
      case 'SCHEDULE':
        return <TaskManager />;
      
      default:
        return (
          <div className="text-center py-12">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {currentView} view coming soon. Please select Weather, Holiday, or Schedule view.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with View Selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-2xl">
            <CalendarIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Calendar</h1>
            <p className="text-sm text-gray-400">
              {currentView === 'WEATHER' && 'Weather Forecast View'}
              {currentView === 'HOLIDAY' && 'Holiday Calendar View'}
              {currentView === 'SCHEDULE' && 'Task Manager View'}
              {!['WEATHER', 'HOLIDAY', 'SCHEDULE'].includes(currentView) && 'Calendar View'}
            </p>
          </div>
        </div>

        <CalendarViewSelector
          currentView={currentView}
          onViewChange={handleViewChange}
        />
      </div>

      {/* Calendar View */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        renderCalendarView()
      )}
    </div>
  );
}
