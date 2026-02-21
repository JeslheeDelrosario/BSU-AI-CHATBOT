// client/src/components/ConsultationBookingCard.tsx
// Inline consultation booking card for AI chatbot responses with visual calendar

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Calendar, Clock, X, Loader2, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, CalendarDays, Ban } from 'lucide-react';
import api from '../lib/api';

interface Faculty {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  position: string;
  college: string;
  consultationDays: string[];
  consultationStart?: string;
  consultationEnd?: string;
  officeHours?: string;
}

interface BookedSlot {
  startTime: string;
  endTime: string;
}

interface ConsultationBookingCardProps {
  faculty: Faculty[];
  selectedFaculty?: Faculty | null;
  language?: string;
  onBookingComplete?: () => void;
}

export default function ConsultationBookingCard({ 
  faculty, 
  selectedFaculty: initialSelected,
  language = 'en',
  onBookingComplete 
}: ConsultationBookingCardProps) {
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(initialSelected || null);
  const [showBookingForm, setShowBookingForm] = useState(!!initialSelected);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Occupied slots state
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  // Track which dates have been fetched to avoid duplicate requests
  const [fetchedDates, setFetchedDates] = useState<Set<string>>(new Set());

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [bookingForm, setBookingForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    topic: '',
    notes: ''
  });

  // Fetch occupied slots for a given faculty + date
  const fetchBookedSlots = useCallback(async (facultyId: string, date: string) => {
    const key = `${facultyId}:${date}`;
    if (fetchedDates.has(key)) return;
    setLoadingSlots(true);
    try {
      const res = await api.get('/consultations/available-slots', {
        params: { facultyId, date }
      });
      setBookedSlots(res.data.bookedSlots || []);
      setFetchedDates(prev => new Set(prev).add(key));
    } catch {
      // Non-critical — silently fail, calendar still works
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [fetchedDates]);

  // Re-fetch when selected date changes
  useEffect(() => {
    if (selectedFaculty && bookingForm.date) {
      fetchBookedSlots(selectedFaculty.id, bookingForm.date);
    }
  }, [selectedFaculty, bookingForm.date, fetchBookedSlots]);

  const handleSelectFaculty = (f: Faculty) => {
    setSelectedFaculty(f);
    setShowBookingForm(true);
    setBookedSlots([]);
    setFetchedDates(new Set());
    setBookingForm({
      date: '',
      startTime: f.consultationStart || '14:00',
      endTime: f.consultationEnd || '16:00',
      topic: '',
      notes: ''
    });
    setError(null);
    setSuccess(false);
  };

  // Check if a specific time slot overlaps with any booked slot
  const isTimeSlotBooked = useCallback((start: string, end: string): boolean => {
    return bookedSlots.some(slot => {
      // Overlap: start < slotEnd AND end > slotStart
      return start < slot.endTime && end > slot.startTime;
    });
  }, [bookedSlots]);

  // Format time for display (e.g. "14:00" → "2:00 PM")
  const formatTime = (time: string): string => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const getDayName = (date: Date | string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = typeof date === 'string' ? new Date(date) : date;
    return days[d.getDay()];
  };

  const isDateAvailable = (date: Date | string) => {
    if (!selectedFaculty) return false;
    const dayName = getDayName(date);
    return selectedFaculty.consultationDays.includes(dayName);
  };

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: (Date | null)[] = [];
    
    // Add padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  }, [currentMonth]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateSelect = (date: Date) => {
    if (date < today) return;
    const dateStr = date.toISOString().split('T')[0];
    setBookedSlots([]);  // Clear previous slots while new ones load
    setBookingForm({ ...bookingForm, date: dateStr });
  };

  const handleSubmit = async () => {
    if (!selectedFaculty || !bookingForm.date || !bookingForm.topic) return;
    
    if (!isDateAvailable(bookingForm.date)) {
      setError(language === 'fil' 
        ? 'Hindi available ang faculty sa araw na ito' 
        : 'Faculty not available on this day');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/consultations/book', {
        facultyId: selectedFaculty.id,
        date: bookingForm.date,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        topic: bookingForm.topic,
        notes: bookingForm.notes
      });
      
      setSuccess(true);
      onBookingComplete?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book consultation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFaculty(null);
    setShowBookingForm(false);
    setSuccess(false);
    setError(null);
    setBookedSlots([]);
    setFetchedDates(new Set());
    setBookingForm({ date: '', startTime: '', endTime: '', topic: '', notes: '' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Success state
  if (success) {
    return (
      <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              {language === 'fil' ? 'Naipadala na ang Request!' : 'Booking Request Sent!'}
            </h4>
            <p className="text-sm text-green-600 dark:text-green-300">
              {language === 'fil' 
                ? `Consultation kay ${selectedFaculty?.firstName} ${selectedFaculty?.lastName}` 
                : `Consultation with ${selectedFaculty?.firstName} ${selectedFaculty?.lastName}`}
            </p>
          </div>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300 mb-3">
          {language === 'fil'
            ? 'Hihintayin mo na lang ang confirmation mula sa faculty. Makikita mo ang status sa Consultations page.'
            : 'Please wait for confirmation from the faculty. You can check the status on the Consultations page.'}
        </p>
        <button
          onClick={resetForm}
          className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
        >
          {language === 'fil' ? 'Mag-book ng isa pa' : 'Book another consultation'}
        </button>
      </div>
    );
  }

  // Booking form with visual calendar
  if (showBookingForm && selectedFaculty) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="mt-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-lg max-w-md">
        {/* Faculty Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
              {selectedFaculty.firstName[0]}{selectedFaculty.lastName[0]}
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">
                {selectedFaculty.firstName} {selectedFaculty.lastName}
              </h4>
              <p className="text-xs text-cyan-600 dark:text-cyan-400">{selectedFaculty.position}</p>
            </div>
          </div>
          <button 
            onClick={resetForm}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Availability Info */}
        <div className="mb-4 p-3 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-500/10 dark:to-purple-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {language === 'fil' ? 'Available na Araw' : 'Available Days'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedFaculty.consultationDays.map(day => (
              <span key={day} className="px-2 py-1 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-md text-xs font-medium">
                {day}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-600 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span>{selectedFaculty.consultationStart || '14:00'} - {selectedFaculty.consultationEnd || '16:00'}</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Visual Calendar Picker */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {language === 'fil' ? 'Pumili ng Petsa' : 'Select Date'} *
          </label>
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {dayNames.map(day => (
                <div key={day} className="text-center text-[10px] font-medium text-slate-500 dark:text-slate-400 py-1">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }
                
                const dateStr = date.toISOString().split('T')[0];
                const isPast = date < today;
                const isAvailable = isDateAvailable(date);
                const isSelected = bookingForm.date === dateStr;
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => !isPast && handleDateSelect(date)}
                    disabled={isPast}
                    className={`aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center relative
                      ${isPast 
                        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                        : isSelected
                          ? 'bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-md'
                          : isAvailable
                            ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-500/30 cursor-pointer'
                            : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }
                      ${isToday && !isSelected ? 'ring-2 ring-cyan-500 ring-offset-1 dark:ring-offset-slate-800' : ''}
                    `}
                  >
                    {date.getDate()}
                    {isAvailable && !isPast && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex-wrap">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="w-3 h-3 bg-cyan-100 dark:bg-cyan-500/20 rounded" />
                {language === 'fil' ? 'Available' : 'Available'}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="w-3 h-3 bg-gradient-to-br from-cyan-500 to-purple-600 rounded" />
                {language === 'fil' ? 'Napili' : 'Selected'}
              </div>
            </div>
          </div>
        </div>

        {/* Occupied Slots Display */}
        {bookingForm.date && isDateAvailable(bookingForm.date) && (
          <div className="mb-4">
            {loadingSlots ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 py-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                {language === 'fil' ? 'Kinukuha ang mga occupied na oras...' : 'Loading occupied slots...'}
              </div>
            ) : bookedSlots.length > 0 ? (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Ban className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-semibold text-red-700 dark:text-red-300">
                    {language === 'fil' ? 'Occupied na Oras' : 'Occupied Time Slots'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {bookedSlots.map((slot, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-md text-xs font-medium"
                    >
                      {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-red-500 dark:text-red-400 mt-1.5">
                  {language === 'fil'
                    ? 'Huwag pumili ng oras na nakalagay sa itaas.'
                    : 'Please choose a time outside the slots listed above.'}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 py-1">
                <CheckCircle className="w-3.5 h-3.5" />
                {language === 'fil' ? 'Walang occupied na oras sa araw na ito.' : 'No occupied slots on this date.'}
              </div>
            )}
          </div>
        )}

        {/* Booking Preview */}
        {bookingForm.date && isDateAvailable(bookingForm.date) && (
          <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {language === 'fil' ? 'Preview ng Booking' : 'Booking Preview'}
              </span>
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <p><strong>{formatDate(bookingForm.date)}</strong></p>
              <p className="text-slate-500 dark:text-slate-400">
                {bookingForm.startTime || selectedFaculty.consultationStart} - {bookingForm.endTime || selectedFaculty.consultationEnd}
              </p>
            </div>
          </div>
        )}

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              {language === 'fil' ? 'Oras ng Simula' : 'Start Time'}
            </label>
            <input
              type="time"
              value={bookingForm.startTime}
              onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              {language === 'fil' ? 'Oras ng Tapos' : 'End Time'}
            </label>
            <input
              type="time"
              value={bookingForm.endTime}
              onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>
        </div>

        {/* Topic */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            {language === 'fil' ? 'Paksa ng Konsultasyon' : 'Consultation Topic'} *
          </label>
          <input
            type="text"
            value={bookingForm.topic}
            onChange={e => setBookingForm({ ...bookingForm, topic: e.target.value })}
            placeholder={language === 'fil' ? 'Ano ang pag-uusapan?' : 'What would you like to discuss?'}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
          />
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            {language === 'fil' ? 'Karagdagang Notes (Opsyonal)' : 'Additional Notes (Optional)'}
          </label>
          <textarea
            value={bookingForm.notes}
            onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
            rows={2}
            placeholder={language === 'fil' ? 'Karagdagang detalye...' : 'Additional details...'}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !bookingForm.date || !bookingForm.topic || !isDateAvailable(bookingForm.date) || isTimeSlotBooked(bookingForm.startTime, bookingForm.endTime)}
          className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {language === 'fil' ? 'Kumpirmahin ang Booking' : 'Confirm Booking'}
        </button>
      </div>
    );
  }

  // Faculty selection list
  return (
    <div className="mt-3 space-y-2">
      {faculty.map(f => (
        <button
          key={f.id}
          onClick={() => handleSelectFaculty(f)}
          className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 hover:border-cyan-500/50 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {f.firstName[0]}{f.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                {f.firstName} {f.middleName ? f.middleName + ' ' : ''}{f.lastName}
              </h4>
              <p className="text-xs text-cyan-600 dark:text-cyan-400">{f.position}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {f.consultationDays.slice(0, 2).join(', ')}{f.consultationDays.length > 2 ? '...' : ''}
                </span>
                {f.consultationStart && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {f.consultationStart}
                  </span>
                )}
              </div>
            </div>
            <div className="px-3 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-lg text-xs font-medium group-hover:bg-cyan-500 group-hover:text-white transition-colors">
              {language === 'fil' ? 'Book' : 'Book'}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
