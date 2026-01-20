// client/src/pages/Consultations.tsx
// Student Consultation Booking Interface

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Calendar, Clock, Mail, Search, Filter, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
  
  // Booking form
  const [bookingForm, setBookingForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    topic: '',
    notes: ''
  });

  useEffect(() => {
    fetchFaculty();
    if (user?.role === 'STUDENT') {
      fetchMyBookings();
    }
  }, [user]);

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/admin/faculty');
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

  const fetchMyBookings = async () => {
    try {
      const res = await api.get('/consultations/my-bookings');
      setBookings(res.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = searchQuery === '' || 
      `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || 
      f.college.includes(filterDepartment);
    
    // Filter by user's registered course if available
    let matchesCourse = true;
    if (user?.course) {
      // Extract department from course (e.g., "BS Biology" -> "Science", "BS Mathematics" -> "Mathematics")
      const userDepartment = user.course.toLowerCase().includes('mathematics') ? 'Mathematics' : 'Science';
      matchesCourse = f.college.includes(userDepartment);
    }
    
    return matchesSearch && matchesDepartment && matchesCourse;
  });

  const openBookingModal = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setShowBookingModal(true);
    setBookingForm({
      date: '',
      startTime: faculty.consultationStart || '',
      endTime: faculty.consultationEnd || '',
      topic: '',
      notes: ''
    });
  };

  const handleBooking = async () => {
    if (!selectedFaculty || !bookingForm.date || !bookingForm.topic) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/consultations/book', {
        facultyId: selectedFaculty.id,
        date: bookingForm.date,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        topic: bookingForm.topic,
        notes: bookingForm.notes
      });

      alert('Consultation request sent! Waiting for faculty confirmation.');
      setShowBookingModal(false);
      fetchMyBookings();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to book consultation');
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
      case 'CONFIRMED': return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'PENDING': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'CANCELLED': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'COMPLETED': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
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
        <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
          {settings.language === 'fil' ? 'Konsultasyon sa Faculty' : 'Faculty Consultations'}
        </h1>
        <p className="text-lg text-slate-600 dark:text-gray-400">
          {settings.language === 'fil' 
            ? 'Mag-book ng consultation appointment sa iyong mga guro' 
            : 'Book consultation appointments with your instructors'}
        </p>

        {/* Profile Completion Notice */}
        {!user?.course && (
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-slate-900 dark:text-white font-semibold mb-1">
                {settings.language === 'fil' ? 'Kumpletuhin ang iyong profile' : 'Complete your profile'}
              </p>
              <p className="text-sm text-slate-600 dark:text-gray-400">
                {settings.language === 'fil' 
                  ? 'Para makita ang mga faculty na naaayon sa iyong kurso, kumpletuhin ang iyong profile sa ' 
                  : 'To see faculty relevant to your course, please complete your profile in '}
                <a href="/profile" className="text-cyan-500 hover:text-cyan-400 font-semibold underline">
                  {settings.language === 'fil' ? 'My Profile' : 'My Profile'}
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Faculty List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={settings.language === 'fil' ? 'Maghanap ng faculty...' : 'Search faculty...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={filterDepartment}
                  onChange={e => setFilterDepartment(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
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
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
                <p className="text-xl text-gray-400">
                  {settings.language === 'fil' ? 'Walang available na faculty' : 'No faculty available'}
                </p>
              </div>
            ) : (
              filteredFaculty.map(f => (
                <div key={f.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-cyan-500/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                        {f.firstName[0]}{f.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {f.firstName} {f.middleName} {f.lastName}
                        </h3>
                        <p className="text-sm text-cyan-500">{f.position}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {f.college.replace('College of Science - ', '')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openBookingModal(f)}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                    >
                      {settings.language === 'fil' ? 'Mag-book' : 'Book'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {f.email && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span>{f.email}</span>
                      </div>
                    )}
                    {f.consultationDays.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{f.consultationDays.join(', ')}</span>
                      </div>
                    )}
                    {f.consultationStart && f.consultationEnd && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{f.consultationStart} - {f.consultationEnd} (GMT+8)</span>
                      </div>
                    )}
                    {f.officeHours && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{f.officeHours}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Bookings Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sticky top-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-500" />
              {settings.language === 'fil' ? 'Aking mga Booking' : 'My Bookings'}
            </h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {bookings.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  {settings.language === 'fil' ? 'Wala pang bookings' : 'No bookings yet'}
                </p>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status}
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white mb-2">{booking.topic}</p>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {booking.startTime} - {booking.endTime}
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">
                {settings.language === 'fil' ? 'Mag-book ng Konsultasyon' : 'Book Consultation'}
              </h2>
              <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-white">
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-white/5 rounded-xl">
              <p className="text-lg font-semibold text-white mb-1">
                {selectedFaculty.firstName} {selectedFaculty.lastName}
              </p>
              <p className="text-sm text-cyan-400">{selectedFaculty.position}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {settings.language === 'fil' ? 'Petsa' : 'Date'} *
                </label>
                <input
                  type="date"
                  value={bookingForm.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
                {bookingForm.date && !isDateAvailable(bookingForm.date, selectedFaculty) && (
                  <p className="mt-2 text-sm text-red-400">
                    ⚠️ {settings.language === 'fil' ? 'Hindi available ang faculty sa araw na ito' : 'Faculty not available on this day'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {settings.language === 'fil' ? 'Oras ng Simula' : 'Start Time'} *
                  </label>
                  <input
                    type="time"
                    value={bookingForm.startTime}
                    onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {settings.language === 'fil' ? 'Oras ng Pagtatapos' : 'End Time'} *
                  </label>
                  <input
                    type="time"
                    value={bookingForm.endTime}
                    onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {settings.language === 'fil' ? 'Paksa ng Konsultasyon' : 'Consultation Topic'} *
                </label>
                <input
                  type="text"
                  value={bookingForm.topic}
                  onChange={e => setBookingForm({ ...bookingForm, topic: e.target.value })}
                  placeholder={settings.language === 'fil' ? 'Ano ang pag-uusapan?' : 'What would you like to discuss?'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {settings.language === 'fil' ? 'Karagdagang Impormasyon (Opsyonal)' : 'Additional Notes (Optional)'}
                </label>
                <textarea
                  value={bookingForm.notes}
                  onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  rows={4}
                  placeholder={settings.language === 'fil' ? 'Anumang karagdagang detalye...' : 'Any additional details...'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 px-6 py-4 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all"
                >
                  {settings.language === 'fil' ? 'Kanselahin' : 'Cancel'}
                </button>
                <button
                  onClick={handleBooking}
                  disabled={!bookingForm.date || !bookingForm.topic || !isDateAvailable(bookingForm.date, selectedFaculty)}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {settings.language === 'fil' ? 'Mag-book' : 'Book Consultation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
