// client/src/pages/Consultations.tsx
// Student Consultation Booking Interface

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Calendar, Clock, Mail, Search, Filter, CheckCircle, XCircle, AlertCircle, X, Loader2, User, BookOpen, ChevronRight } from 'lucide-react';
import api from '../lib/api';

interface Faculty {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  position: string;
  college: string;
  officeHours?: string;
  consultationDays: string[];
  consultationStart?: string;
  consultationEnd?: string;
  vacantTime?: string;
}

interface ConsultationBooking {
  id: string;
  facultyId: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  Faculty?: {
    firstName: string;
    lastName: string;
    email?: string;
    position: string;
  };
}

const MAX_CONSULTATION_MINUTES = 15;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function convertTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export default function Consultations() {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  // Faculty bookings modal (admin/faculty view)
  const [showFacultyBookingsModal, setShowFacultyBookingsModal] = useState(false);
  const [facultyBookings, setFacultyBookings] = useState<ConsultationBooking[]>([]);
  const [facultyBookingsLoading, setFacultyBookingsLoading] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  // Booking form
  const [bookingForm, setBookingForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    topic: '',
    notes: ''
  });

  // Available slots state
  const [availableSlots, setAvailableSlots] = useState<{
    available: boolean;
    consultationStart?: string;
    consultationEnd?: string;
    bookedSlots: { startTime: string; endTime: string }[];
  }>({ available: false, bookedSlots: [] });

  // Faculty bookings with time slots state
  const [facultyBookingsWithSlots, setFacultyBookingsWithSlots] = useState<Record<string, ConsultationBooking[]>>({});

  useEffect(() => {
    fetchFaculty();
    if (user?.role === 'STUDENT') {
      fetchMyBookings();
    }
  }, [user]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/consultations/faculty-list');
      const facultyData = res.data.filter((f: Faculty) => 
        f.consultationDays && f.consultationDays.length > 0
      );
      setFaculty(facultyData);
    } catch (error) {
      console.error('Failed to fetch faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (faculty.length > 0) {
      // Load bookings for all faculty members
      faculty.forEach(f => {
        fetchFacultyBookingsWithSlots(f.id);
      });
    }
  }, [faculty]);


  const fetchMyBookings = async () => {
    try {
      const res = await api.get('/consultations/my-bookings');
      setBookings(res.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const fetchAvailableSlots = async (facultyId: string, date: string) => {
    try {
      const res = await api.get(`/consultations/available-slots?facultyId=${facultyId}&date=${date}`);
      setAvailableSlots(res.data);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      setAvailableSlots({ available: false, bookedSlots: [] });
    }
  };

  const fetchFacultyBookingsWithSlots = async (facultyId: string) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const res = await api.get(`/consultations/faculty/${facultyId}/availability`);
    const bookings = Array.isArray(res.data) ? res.data : [];
    
    const upcomingBookings = bookings.filter((booking: ConsultationBooking) => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= today && 
             bookingDate <= nextWeek && 
             (booking.status === 'PENDING' || booking.status === 'CONFIRMED');
    }).slice(0, 5);
    
    // Only log when there are actual bookings
    if (upcomingBookings.length > 0) {
      console.log(`Loaded ${upcomingBookings.length} bookings for faculty ${facultyId}`);
    }
    
    setFacultyBookingsWithSlots(prev => ({
      ...prev,
      [facultyId]: upcomingBookings
    }));
  } catch (error) {
    // Silent fail - don't log 404s or empty responses
    if (error instanceof Error && !error.message.includes('404')) {
      console.error('Failed to fetch faculty bookings:', error);
    }
    setFacultyBookingsWithSlots(prev => ({
      ...prev,
      [facultyId]: []
    }));
  }
};


  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = searchQuery === '' || 
      `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || f.college.includes(filterDepartment);
    return matchesSearch && matchesDepartment;
  });

  const filteredBookings = bookings.filter(b => 
    bookingStatusFilter === 'all' || b.status === bookingStatusFilter
  );

  const openBookingModal = (fac: Faculty) => {
    setSelectedFaculty(fac);
    setShowBookingModal(true);
    setTimeError(null);
    setAvailableSlots({ available: false, bookedSlots: [] }); // Reset available slots
    // Fetch faculty bookings when opening modal
    fetchFacultyBookingsWithSlots(fac.id);
    // Auto-set end time = start + 15 min
    const start = fac.consultationStart || '';
    const autoEnd = start ? minutesToTime(timeToMinutes(start) + MAX_CONSULTATION_MINUTES) : '';
    setBookingForm({
      date: '',
      startTime: start,
      endTime: autoEnd,
      topic: '',
      notes: ''
    });
  };

  const openFacultyBookingsModal = async (fac: Faculty) => {
    setSelectedFaculty(fac);
    setShowFacultyBookingsModal(true);
    setFacultyBookingsLoading(true);
    try {
      const res = await api.get(`/consultations/faculty/${fac.id}`);
      setFacultyBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch faculty bookings:', err);
      setFacultyBookings([]);
    } finally {
      setFacultyBookingsLoading(false);
    }
  };

  const handleStartTimeChange = (val: string) => {
    const endMins = timeToMinutes(val) + MAX_CONSULTATION_MINUTES;
    const autoEnd = minutesToTime(endMins);
    setBookingForm(f => ({ ...f, startTime: val, endTime: autoEnd }));
    setTimeError(null);
    
    // Check for conflicts with existing bookings
    if (availableSlots.bookedSlots.length > 0) {
      const newStartMins = timeToMinutes(val);
      const newEndMins = endMins;
      
      const hasConflict = availableSlots.bookedSlots.some(slot => {
        const slotStartMins = timeToMinutes(slot.startTime);
        const slotEndMins = timeToMinutes(slot.endTime);
        // Check if new booking overlaps with existing slot
        return (newStartMins < slotEndMins && newEndMins > slotStartMins);
      });
      
      if (hasConflict) {
        setTimeError(settings.language === 'fil' 
          ? 'Ang oras na ito ay may conflict sa ibang booking. Pakiusap pumili ng ibang oras.' 
          : 'This time conflicts with an existing booking. Please choose a different time.');
      }
    }
  };

  const validateTime = (): string | null => {
    if (!bookingForm.startTime || !bookingForm.endTime) return 'Start and end time are required';
    const startMins = timeToMinutes(bookingForm.startTime);
    const endMins = timeToMinutes(bookingForm.endTime);
    const diff = endMins - startMins;
    if (diff <= 0) return 'End time must be after start time';
    if (diff > MAX_CONSULTATION_MINUTES) return `Maximum consultation duration is ${MAX_CONSULTATION_MINUTES} minutes`;
    if (selectedFaculty?.consultationStart && selectedFaculty?.consultationEnd) {
      const facStart = timeToMinutes(selectedFaculty.consultationStart);
      const facEnd = timeToMinutes(selectedFaculty.consultationEnd);
      if (startMins < facStart || endMins > facEnd) {
       return `Faculty is only available ${convertTo12Hour(selectedFaculty.consultationStart)} - ${convertTo12Hour(selectedFaculty.consultationEnd)}`;
      }
    }
    return null;
  };

  const handleBooking = async () => {
    if (!selectedFaculty || !bookingForm.date || !bookingForm.topic) return;
    const err = validateTime();
    if (err) { setTimeError(err); return; }
    setTimeError(null);
    setBookingLoading(true);
    try {
      await api.post('/consultations/book', {
        facultyId: selectedFaculty.id,
        date: bookingForm.date,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        topic: bookingForm.topic,
        notes: bookingForm.notes
      });
      setToast({ message: settings.language === 'fil' ? 'Naipadala na ang request! Hinihintay ang kumpirmasyon.' : 'Request sent! Waiting for confirmation.', type: 'success' });
      setShowBookingModal(false);
      fetchMyBookings();
    } catch (error: any) {
  const responseData = error.response?.data;
  
  if (responseData?.errors && Array.isArray(responseData.errors)) {
    // Show the first main error
    const mainError = responseData.errors[0];
    setToast({ 
      message: mainError, 
      type: 'error' 
    });
    
    // Optional: also show timeError for slot conflicts
    if (mainError.includes('time slot') || mainError.includes('occupied')) {
      setTimeError(mainError);
    }
  } 
  else if (responseData?.error) {
    setToast({ 
      message: responseData.error, 
      type: 'error' 
    });
  } 
  else {
    setToast({ 
      message: settings.language === 'fil' ? 'May error sa pag-book. Subukan ulit.' : 'Failed to book consultation. Please try again.', 
      type: 'error' 
    });
  }
} finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.delete(`/consultations/${bookingId}/cancel`);
      setToast({ message: settings.language === 'fil' ? 'Na-cancel na ang booking' : 'Booking cancelled', type: 'success' });
      fetchMyBookings();
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Failed to cancel', type: 'error' });
    }
  };

  const handleClearAllCancelledBookings = async () => {
    try {
      // Check if there are any cancelled bookings
      const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');
      
      if (cancelledBookings.length === 0) {
        setToast({ 
          message: settings.language === 'fil' ? 'Walang kanseladong booking' : 'No cancelled bookings', 
          type: 'info' 
        });
        return;
      }

      // Call the API to clear all cancelled bookings
      const response = await api.delete('/consultations/clear-cancelled');
      
      setToast({ 
        message: settings.language === 'fil' 
          ? `Na-clear ang ${response.data.count} kanseladong booking${response.data.count > 1 ? 's' : ''}` 
          : `Cleared ${response.data.count} cancelled booking${response.data.count > 1 ? 's' : ''}`, 
        type: 'success' 
      });
      
      // Refresh the bookings list
      fetchMyBookings();
      
    } catch (error: any) {
      setToast({ 
        message: error.response?.data?.error || 
          (settings.language === 'fil' ? 'Nabigong i-clear ang mga booking' : 'Failed to clear bookings'), 
        type: 'error' 
      });
    }
  };

  const getDayName = (date: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(date).getDay()];
  };

  const isDateAvailable = (date: string, faculty: Faculty) => {
    const dayName = getDayName(date);
    return faculty.consultationDays.includes(dayName);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-green-600 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30';
      case 'CANCELLED': return 'text-red-600 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30';
      case 'COMPLETED': return 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return <CheckCircle className="w-4 h-4" />;
      case 'PENDING': return <AlertCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in slide-in-from-right ${
          toast.type === 'success' ? 'bg-green-50 dark:bg-green-900/80 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/80 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 pb-3">
          {settings.language === 'fil' ? 'Konsultasyon sa Faculty' : 'Faculty Consultations'}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          {settings.language === 'fil' 
            ? 'Mag-book ng consultation appointment sa iyong mga guro' 
            : 'Book consultation appointments with your instructors'}
        </p>

        {!user?.course && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-slate-900 dark:text-white font-semibold mb-1">
                {settings.language === 'fil' ? 'Kumpletuhin ang iyong profile' : 'Complete your profile'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {settings.language === 'fil' 
                  ? 'Para makita ang mga faculty na naaayon sa iyong kurso, kumpletuhin ang iyong profile sa ' 
                  : 'To see faculty relevant to your course, complete your profile in '}
                <a href="/profile" className="text-cyan-500 hover:text-cyan-400 font-semibold underline">My Profile</a>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Faculty List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters */}
          <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={settings.language === 'fil' ? 'Maghanap ng miyembro ng faculty...' : 'Search faculty member...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={filterDepartment}
                  onChange={e => setFilterDepartment(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                >
                  <option value="all">{settings.language === 'fil' ? 'Lahat ng Departamento' : 'All Departments'}</option>
                  <option value="Mathematics">{settings.language === 'fil' ? 'Matematika' : 'Mathematics'}</option>
                  <option value="Science">{settings.language === 'fil' ? 'Agham' : 'Science'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Faculty Cards */}
          <div className="space-y-4">
            {filteredFaculty.length === 0 ? (
              <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center">
                <User className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <p className="text-xl text-slate-500 dark:text-slate-400">
                  {settings.language === 'fil' ? 'Walang available na faculty' : 'No faculty available'}
                </p>
              </div>
            ) : (
              filteredFaculty.map(f => (
                <div
                  key={f.id}
                  className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer"
                  onClick={() => {
                    if (user?.role === 'ADMIN') openFacultyBookingsModal(f);
                  }}
                  onMouseEnter={() => {
                    // Fetch bookings when hovering over faculty card
                    if (!facultyBookingsWithSlots[f.id]) {
                      fetchFacultyBookingsWithSlots(f.id);
                    }
                  }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {f.firstName[0]}{f.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {f.firstName} {f.middleName ? f.middleName + ' ' : ''}{f.lastName}
                          {user?.role === 'ADMIN' && <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </h3>
                        <p className="text-sm text-cyan-600 dark:text-cyan-400">{f.position}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {f.college.replace('College of Science - ', '')}
                        </p>
                        {user?.role === 'ADMIN' && (
                          <p className="text-xs text-purple-400 mt-1">Click to view all bookings</p>
                        )}
                      </div>
                    </div>
                    {user?.role === 'STUDENT' && (
                    <button
                      onClick={e => { e.stopPropagation(); openBookingModal(f); }}
                      className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all text-sm"
                    >
                      {settings.language === 'fil' ? 'Mag-book' : 'Book'}
                    </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {f.email && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{f.email}</span>
                      </div>
                    )}
                    {f.consultationDays.length > 0 && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{f.consultationDays.join(', ')}</span>
                      </div>
                    )}
                    {f.consultationStart && f.consultationEnd && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{convertTo12Hour(f.consultationStart)} - {convertTo12Hour(f.consultationEnd)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Booked Times Display */}
{facultyBookingsWithSlots[f.id] && facultyBookingsWithSlots[f.id].length > 0 && (
  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl">
    <div className="flex items-center gap-2 mb-3">
      <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
      <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
        {settings.language === 'fil' ? 'Mga Nakaiskedyul na Konsultasyon:' : 'Upcoming Scheduled Consultations:'}
      </p>
    </div>
    <div className="space-y-2">
      {facultyBookingsWithSlots[f.id].map((booking, index) => {
        const bookingDate = new Date(booking.date);
        const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'long' });
        const formattedDate = bookingDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        return (
          <div key={index} className="text-xs border-b border-orange-200 dark:border-orange-500/20 pb-2 last:border-0 last:pb-0">
            <div className="flex items-start gap-2">
              <div className="min-w-[85px]">
                <span className="font-semibold text-orange-700 dark:text-orange-300">{dayName}</span>
              </div>
              <div className="flex-1">
                <div className="text-orange-600 dark:text-orange-400">
                  {formattedDate}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3 text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400">
                    {convertTo12Hour(booking.startTime)} - {convertTo12Hour(booking.endTime)}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    booking.status === 'PENDING' 
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' 
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  }`}>
                    {booking.status === 'PENDING' 
                      ? (settings.language === 'fil' ? 'Nakabinbin' : 'Pending') 
                      : (settings.language === 'fil' ? 'Nakumpirma' : 'Confirmed')}
                  </span>
                </div>
                {booking.topic && (
                  <div className="mt-1 text-orange-500/70 dark:text-orange-400/70 text-[11px]">
                    📚 {booking.topic.length > 40 ? booking.topic.substring(0, 40) + '...' : booking.topic}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Bookings Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 sticky top-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              {settings.language === 'fil' ? 'Aking mga Booking' : 'My Bookings'}
            </h2>

            {/* Status filter tabs */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(['all', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setBookingStatusFilter(s)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                    bookingStatusFilter === s
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {s === 'all' ? (settings.language === 'fil' ? 'Lahat' : 'All') : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Clear cancelled bookings button */}
            {bookings.some(b => b.status === 'CANCELLED') && (
              <div className="mb-4">
                <button
                  onClick={handleClearAllCancelledBookings}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3 h-3" />
                  {settings.language === 'fil' ? 'I-clear ang Kanselado' : 'Clear Cancelled'}
                </button>
              </div>
            )}

            <div className="space-y-3 max-h-[550px] overflow-y-auto">
              {filteredBookings.length === 0 ? (
                <p className="text-center text-slate-400 dark:text-slate-500 py-8 text-sm">
                  {settings.language === 'fil' ? 'Wala pang bookings' : 'No bookings yet'}
                </p>
              ) : (
                filteredBookings.map(booking => (
                  <div key={booking.id} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </div>
                      {booking.status === 'PENDING' ? (
  <button
    onClick={() => handleCancelBooking(booking.id)}
    className="text-xs text-red-500 hover:text-red-600 font-medium hover:underline"
  >
    {settings.language === 'fil' ? 'Kanselahin' : 'Cancel'}
  </button>
) : (
  <span className="text-xs text-slate-400">
    {booking.status === 'COMPLETED' 
      ? (settings.language === 'fil' ? 'Nakumpleto na' : 'Completed')
      : (settings.language === 'fil' ? 'Hindi na maaaring kanselahin' : 'Cannot cancel')}
  </span>
)}
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{booking.topic}</p>
                    {booking.Faculty && (
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 mb-2">
                        {booking.Faculty.firstName} {booking.Faculty.lastName}
                      </p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Calendar className="w-4 h-4 text-cyan-500" />
                        {new Date(booking.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Clock className="w-4 h-4 text-purple-500" />
                        {convertTo12Hour(booking.startTime)} - {convertTo12Hour(booking.endTime)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {settings.language === 'fil' ? 'Mag-book ng Konsultasyon' : 'Book Consultation'}
              </h2>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                {selectedFaculty.firstName[0]}{selectedFaculty.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {selectedFaculty.firstName} {selectedFaculty.lastName}
                </p>
                <p className="text-sm text-cyan-600 dark:text-cyan-400">{selectedFaculty.position}</p>
              </div>
            </div>

            {selectedFaculty.consultationDays.length > 0 && (
              <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl text-sm text-blue-700 dark:text-blue-300">
                <strong>{settings.language === 'fil' ? 'Available:' : 'Available:'}</strong> {selectedFaculty.consultationDays.join(', ')}
                {selectedFaculty.consultationStart && ` (${convertTo12Hour(selectedFaculty.consultationStart)} - ${convertTo12Hour(selectedFaculty.consultationEnd)})`}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {settings.language === 'fil' ? 'Petsa' : 'Date'} *
                </label>
                <input
                  type="date"
                  value={bookingForm.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => {
                    const newDate = e.target.value;
                    setBookingForm({ ...bookingForm, date: newDate });
                    if (newDate && selectedFaculty) {
                      fetchAvailableSlots(selectedFaculty.id, newDate);
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
                {bookingForm.date && !isDateAvailable(bookingForm.date, selectedFaculty) && (
                  <p className="mt-2 text-sm text-red-500">
                    {settings.language === 'fil' ? 'Hindi available ang faculty sa araw na ito' : 'Faculty not available on this day'}
                  </p>
                )}
                
                {/* Booked slots display */}
                {bookingForm.date && selectedFaculty && availableSlots.bookedSlots.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                      {settings.language === 'fil' ? 'Na-book na oras:' : 'Booked time slots:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {availableSlots.bookedSlots.map((slot, index) => (
                        <span key={index} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-lg">
                          {convertTo12Hour(slot.startTime)} - {convertTo12Hour(slot.endTime)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Faculty upcoming bookings display */}
                {selectedFaculty && facultyBookingsWithSlots[selectedFaculty.id] && facultyBookingsWithSlots[selectedFaculty.id].length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {settings.language === 'fil' ? 'Mga paparating na booking:' : 'Upcoming bookings:'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      {facultyBookingsWithSlots[selectedFaculty.id].map((booking, index) => (
                        <div key={index} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                          <span className="w-16">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="w-20">{convertTo12Hour(booking.startTime)} - {convertTo12Hour(booking.endTime)}</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                            {booking.status === 'PENDING' ? (settings.language === 'fil' ? 'Nakabinbin' : 'Pending') : (settings.language === 'fil' ? 'Nakumpirma' : 'Confirmed')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 15-min max notice */}
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                <Clock className="w-4 h-4 flex-shrink-0" />
                {settings.language === 'fil'
                  ? `Maximum na ${MAX_CONSULTATION_MINUTES} minuto ang bawat konsultasyon.`
                  : `Maximum ${MAX_CONSULTATION_MINUTES} minutes per consultation.`}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {settings.language === 'fil' ? 'Oras ng Simula' : 'Start Time'} *
                  </label>
                  <input
                    type="time"
                    value={bookingForm.startTime}
                    onChange={e => handleStartTimeChange(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      timeError && timeError.includes('conflict') 
                        ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500/30' 
                        : 'border-slate-200 dark:border-white/10 focus:border-cyan-500 focus:ring-cyan-500/30'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {settings.language === 'fil' ? 'Oras ng Pagtatapos' : 'End Time'} *
                    <span className="ml-1 text-xs text-slate-400">(auto)</span>
                  </label>
                  <input
                    type="time"
                    value={bookingForm.endTime}
                    readOnly
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Time conflict / validation error */}
              {timeError && (
                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {timeError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {settings.language === 'fil' ? 'Paksa ng Konsultasyon' : 'Consultation Topic'} *
                </label>
                <input
                  type="text"
                  value={bookingForm.topic}
                  onChange={e => setBookingForm({ ...bookingForm, topic: e.target.value })}
                  placeholder={settings.language === 'fil' ? 'Ano ang pag-uusapan?' : 'What would you like to discuss?'}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {settings.language === 'fil' ? 'Karagdagang Impormasyon (Opsyonal)' : 'Additional Notes (Optional)'}
                </label>
                <textarea
                  value={bookingForm.notes}
                  onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  rows={3}
                  placeholder={settings.language === 'fil' ? 'Anumang karagdagang detalye...' : 'Any additional details...'}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowBookingModal(false); setTimeError(null); }}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  {settings.language === 'fil' ? 'Kanselahin' : 'Cancel'}
                </button>
                <button
                  onClick={handleBooking}
                  disabled={bookingLoading || !bookingForm.date || !bookingForm.topic || (bookingForm.date ? !isDateAvailable(bookingForm.date, selectedFaculty) : true)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bookingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {settings.language === 'fil' ? 'Mag-book' : 'Book Consultation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Bookings Modal (Admin view) */}
      {showFacultyBookingsModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedFaculty.firstName} {selectedFaculty.lastName}
                </h2>
                <p className="text-sm text-cyan-500 mt-0.5">{selectedFaculty.position}</p>
              </div>
              <button onClick={() => setShowFacultyBookingsModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-xl text-sm text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {settings.language === 'fil' ? 'Lahat ng booking ng estudyante para sa faculty member na ito' : 'All student bookings for this faculty member'}
            </div>

            {facultyBookingsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ) : facultyBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  {settings.language === 'fil' ? 'Wala pang bookings para sa faculty member na ito' : 'No bookings yet for this faculty member'}
                </p>
              </div>
            ) : (
             <div className="space-y-3">
              {facultyBookings.map(booking => (
                <div key={booking.id} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{booking.topic}</p>
                  {(booking as any).Student && (
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 mb-1">
                      👤 {(booking as any).Student.firstName} {(booking as any).Student.lastName}
                      {(booking as any).Student.email && <span className="text-slate-400 ml-1">· {(booking as any).Student.email}</span>}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3 h-3" />
                    {convertTo12Hour(booking.startTime)} - {convertTo12Hour(booking.endTime)}
                  </div>
                  {booking.notes && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">{booking.notes}</p>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}