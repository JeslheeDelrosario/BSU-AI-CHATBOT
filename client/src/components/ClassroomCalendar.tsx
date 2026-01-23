import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import api from '../lib/api';

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

interface ClassroomCalendarProps {
  classroomId: string;
  isTeacher: boolean;
  onCreateMeeting: () => void;
  onViewMeeting: (meeting: Meeting) => void;
}

const MEETING_TYPE_COLORS: { [key: string]: string } = {
  LECTURE: 'bg-blue-500',
  LAB_SESSION: 'bg-purple-500',
  DISCUSSION: 'bg-green-500',
  EXAM: 'bg-red-500',
  QUIZ: 'bg-orange-500',
  OFFICE_HOURS: 'bg-cyan-500',
  REVIEW_SESSION: 'bg-yellow-500',
  WORKSHOP: 'bg-pink-500',
  SEMINAR: 'bg-indigo-500',
  GROUP_WORK: 'bg-teal-500',
};

const MEETING_TYPE_LABELS: { [key: string]: string } = {
  LECTURE: 'Lecture',
  LAB_SESSION: 'Lab Session',
  DISCUSSION: 'Discussion',
  EXAM: 'Exam',
  QUIZ: 'Quiz',
  OFFICE_HOURS: 'Office Hours',
  REVIEW_SESSION: 'Review Session',
  WORKSHOP: 'Workshop',
  SEMINAR: 'Seminar',
  GROUP_WORK: 'Group Work',
};

export default function ClassroomCalendar({ classroomId, isTeacher, onCreateMeeting, onViewMeeting }: ClassroomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

      const [calendarRes, upcomingRes] = await Promise.all([
        api.get(`/classrooms/${classroomId}/meetings/calendar`, {
          params: {
            start: startOfMonth.toISOString(),
            end: endOfMonth.toISOString()
          }
        }),
        api.get(`/classrooms/${classroomId}/meetings/upcoming`)
      ]);

      setMeetings(calendarRes.data);
      setUpcomingMeetings(upcomingRes.data);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [classroomId, currentDate]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getMeetingsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.startTime);
      return meetingDate.getDate() === day &&
             meetingDate.getMonth() === date.getMonth() &&
             meetingDate.getFullYear() === date.getFullYear();
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const days = getDaysInMonth();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-2xl">
            <CalendarIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Calendar</h2>
        </div>
        {isTeacher && (
          <button
            onClick={onCreateMeeting}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Meeting
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <h3 className="text-xl font-bold text-white">{monthYear}</h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayMeetings = getMeetingsForDay(day);
              const today = isToday(day);

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square border rounded-xl p-2 ${
                    selectedDate === day
                      ? 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500 shadow-lg shadow-purple-500/50'
                      : today
                      ? 'border-cyan-500 bg-cyan-500/20 ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/50'
                      : 'border-white/10 hover:bg-white/10 hover:border-white/20'
                  } transition-all cursor-pointer`}
                >
                  <div className={`text-sm font-semibold mb-1 ${
                    selectedDate === day
                      ? 'text-purple-400'
                      : today 
                      ? 'text-cyan-400' 
                      : 'text-white'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayMeetings.slice(0, 2).map(meeting => (
                      <div
                        key={meeting.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewMeeting(meeting);
                        }}
                        className={`${MEETING_TYPE_COLORS[meeting.meetingType] || 'bg-gray-500'} text-white text-xs px-1 py-0.5 rounded-md truncate cursor-pointer hover:opacity-80 hover:scale-105 transition-all`}
                        title={meeting.title}
                      >
                        {formatTime(meeting.startTime)}
                      </div>
                    ))}
                    {dayMeetings.length > 2 && (
                      <div className="text-xs text-gray-400 font-medium">
                        +{dayMeetings.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white mb-3">Meeting Types</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(MEETING_TYPE_LABELS).map(([type, label]) => (
                <div key={type} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${MEETING_TYPE_COLORS[type]} shadow-lg`} />
                  <span className="text-xs text-gray-300">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Day View or Upcoming Meetings */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6">
          {selectedDate ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  {new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-sm text-gray-400 hover:text-white px-3 py-1.5 hover:bg-white/10 rounded-lg transition-all"
                >
                  Clear
                </button>
              </div>
              
              {(() => {
                const dayMeetings = getMeetingsForDay(selectedDate);
                return dayMeetings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No meetings scheduled
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {dayMeetings.map(meeting => (
                      <div
                        key={meeting.id}
                        onClick={() => onViewMeeting(meeting)}
                        className="p-4 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all hover:shadow-lg"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-1 h-full ${MEETING_TYPE_COLORS[meeting.meetingType]} rounded-full shadow-lg`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white">
                              {meeting.title}
                            </h4>
                            {meeting.description && (
                              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                {meeting.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={`text-xs px-2 py-1 rounded-lg ${MEETING_TYPE_COLORS[meeting.meetingType]} text-white shadow-md`}>
                                {MEETING_TYPE_LABELS[meeting.meetingType]}
                              </span>
                              <span className="text-xs px-2 py-1 bg-white/10 text-gray-300 rounded-lg">
                                {meeting._count.Attendees} attendees
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                meeting.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                meeting.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                meeting.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' :
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {meeting.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              By {meeting.CreatedBy.firstName} {meeting.CreatedBy.lastName}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-white mb-4">Upcoming Meetings</h3>
              
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : upcomingMeetings.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No upcoming meetings
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingMeetings.map(meeting => (
                    <div
                      key={meeting.id}
                      onClick={() => onViewMeeting(meeting)}
                      className="p-4 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all hover:shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-1 h-full ${MEETING_TYPE_COLORS[meeting.meetingType]} rounded-full shadow-lg`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate">
                            {meeting.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(meeting.startTime)}</span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-lg ${MEETING_TYPE_COLORS[meeting.meetingType]} text-white shadow-md`}>
                              {MEETING_TYPE_LABELS[meeting.meetingType]}
                            </span>
                            <span className="text-xs text-gray-500">
                              {meeting._count.Attendees} attendees
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
