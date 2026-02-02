import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import api from '../lib/api';
import CalendarViewSelector, { CalendarViewType } from './CalendarViewSelector';
import ClassroomCalendar from './ClassroomCalendar';
import WeatherCalendar from './WeatherCalendar';
import HolidayCalendar from './HolidayCalendar';
import TaskManager from './TaskManager';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  meetingType: string;
  googleMeetLink: string;
  startTime: string;
  endTime: string;
  status: string;
  CreatedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    Attendees: number;
  };
}

interface EnhancedClassroomCalendarProps {
  classroomId: string;
  isTeacher: boolean;
  onCreateMeeting: () => void;
  onViewMeeting: (meeting: Meeting) => void;
}

export default function EnhancedClassroomCalendar({
  classroomId,
  isTeacher,
  onCreateMeeting,
  onViewMeeting
}: EnhancedClassroomCalendarProps) {
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
      case 'MONTH':
      case 'DAY':
      case 'WEEK':
      case 'YEAR':
      case 'SCHEDULE':
        return (
          <ClassroomCalendar
            classroomId={classroomId}
            isTeacher={isTeacher}
            onCreateMeeting={onCreateMeeting}
            onViewMeeting={onViewMeeting}
          />
        );
      
      case 'WEATHER':
        return <WeatherCalendar classroomId={classroomId} />;
      
      case 'HOLIDAY':
        return <HolidayCalendar />;
      
      default:
        return (
          <ClassroomCalendar
            classroomId={classroomId}
            isTeacher={isTeacher}
            onCreateMeeting={onCreateMeeting}
            onViewMeeting={onViewMeeting}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with View Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-2xl">
            <CalendarIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Calendar</h2>
            <p className="text-sm text-gray-400">
              {currentView === 'WEATHER' && 'Weather Forecast View'}
              {currentView === 'HOLIDAY' && 'Holiday Calendar View'}
              {!['WEATHER', 'HOLIDAY'].includes(currentView) && 'Classroom Schedule'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CalendarViewSelector
            currentView={currentView}
            onViewChange={handleViewChange}
          />
          
          {isTeacher && currentView !== 'WEATHER' && currentView !== 'HOLIDAY' && (
            <button
              onClick={onCreateMeeting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Meeting
            </button>
          )}
        </div>
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
