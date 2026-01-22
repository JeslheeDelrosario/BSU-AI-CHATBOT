import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Video, MapPin, Users, Clock, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  type: string;
  status: string;
  googleMeetLink?: string;
  room?: {
    id: string;
    name: string;
    building: string;
  };
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
  };
  isOrganizer: boolean;
  participantStatus?: string;
}

interface Room {
  id: string;
  name: string;
  building: string;
  floor?: number;
  capacity: number;
  type: string;
  facilities: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Calendar() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingType: 'ONLINE',
    googleMeetLink: '',
    roomId: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    fetchMeetings();
    fetchRooms();
  }, [currentMonth]);

  const fetchMeetings = async () => {
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      const response = await axios.get(`${API_URL}/meetings/calendar`, {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      setMeetings(response.data);
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/meetings/rooms/list`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.post(
        `${API_URL}/meetings`,
        {
          ...formData,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        meetingType: 'ONLINE',
        googleMeetLink: '',
        roomId: '',
        startTime: '',
        endTime: '',
      });
      fetchMeetings();
    } catch (error: any) {
      console.error('Failed to create meeting:', error);
      alert(error.response?.data?.error || 'Failed to create meeting');
    }
  };

  const renderCalendarHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Meeting
        </button>
      </div>
    );
  };

  const renderCalendarDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-t-lg overflow-hidden">
        {days.map((day) => (
          <div
            key={day}
            className="bg-gray-50 py-3 text-center text-sm font-semibold text-gray-700"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCalendarCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayMeetings = meetings.filter((meeting) =>
          isSameDay(new Date(meeting.start), cloneDay)
        );

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[120px] bg-white p-2 border-r border-b border-gray-200 ${
              !isSameMonth(day, monthStart) ? 'bg-gray-50' : ''
            } ${isSameDay(day, selectedDate) ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <div
              className={`text-sm font-medium mb-1 ${
                isSameDay(day, new Date())
                  ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                  : !isSameMonth(day, monthStart)
                  ? 'text-gray-400'
                  : 'text-gray-900'
              }`}
            >
              {format(day, 'd')}
            </div>
            <div className="space-y-1">
              {dayMeetings.slice(0, 3).map((meeting) => (
                <div
                  key={meeting.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMeeting(meeting);
                  }}
                  className={`text-xs p-1 rounded cursor-pointer truncate ${
                    meeting.type === 'ONLINE'
                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      : meeting.type === 'IN_PERSON'
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  }`}
                >
                  {format(new Date(meeting.start), 'HH:mm')} {meeting.title}
                </div>
              ))}
              {dayMeetings.length > 3 && (
                <div className="text-xs text-gray-500 pl-1">
                  +{dayMeetings.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-px bg-gray-200">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="border border-gray-200 rounded-b-lg overflow-hidden">{rows}</div>;
  };

  const renderMeetingDetails = () => {
    if (!selectedMeeting) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedMeeting.title}</h3>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {selectedMeeting.description && (
              <p className="text-gray-600 mb-4">{selectedMeeting.description}</p>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">
                    {format(new Date(selectedMeeting.start), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(selectedMeeting.start), 'h:mm a')} -{' '}
                    {format(new Date(selectedMeeting.end), 'h:mm a')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium">Organizer</div>
                  <div className="text-sm text-gray-600">
                    {selectedMeeting.organizer.firstName} {selectedMeeting.organizer.lastName}
                  </div>
                </div>
              </div>

              {selectedMeeting.googleMeetLink && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Video className="w-5 h-5 text-gray-400" />
                  <a
                    href={selectedMeeting.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Join Google Meet
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {selectedMeeting.room && (
                <div className="flex items-center gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium">{selectedMeeting.room.name}</div>
                    <div className="text-sm text-gray-600">{selectedMeeting.room.building}</div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedMeeting.type === 'ONLINE'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedMeeting.type === 'IN_PERSON'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {selectedMeeting.type.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateModal = () => {
    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateMeeting} className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create Meeting</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Type *
                </label>
                <select
                  value={formData.meetingType}
                  onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ONLINE">Online</option>
                  <option value="IN_PERSON">In Person</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="CONSULTATION">Consultation</option>
                  <option value="CLASS">Class</option>
                  <option value="EXAM">Exam</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="SEMINAR">Seminar</option>
                </select>
              </div>

              {(formData.meetingType === 'ONLINE' || formData.meetingType === 'HYBRID') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Meet Link
                  </label>
                  <input
                    type="url"
                    value={formData.googleMeetLink}
                    onChange={(e) => setFormData({ ...formData, googleMeetLink: e.target.value })}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {(formData.meetingType === 'IN_PERSON' || formData.meetingType === 'HYBRID') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room
                  </label>
                  <select
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a room</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} - {room.building} (Capacity: {room.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Meeting
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-blue-600" />
          Meeting Calendar
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your meetings and track all Google Meet sessions in one place
        </p>
      </div>

      {renderCalendarHeader()}
      {renderCalendarDays()}
      {renderCalendarCells()}
      {renderMeetingDetails()}
      {renderCreateModal()}
    </div>
  );
}
