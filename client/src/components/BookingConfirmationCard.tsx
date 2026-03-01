// client/src/components/BookingConfirmationCard.tsx
// Inline booking confirmation card with Confirm/Cancel buttons and mini calendar

import { useState, useMemo } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/api';

interface PendingBooking {
  facultyId: string;
  facultyName: string;
  date: string;
  startTime: string;
  endTime: string;
  dayName: string;
}

interface BookingConfirmationCardProps {
  pendingBooking: PendingBooking;
  language?: string;
  onConfirm?: (booking: any) => void;
  onCancel?: () => void;
  isConfirmed?: boolean;
  isCancelled?: boolean;
}

export default function BookingConfirmationCard({
  pendingBooking,
  language = 'en',
  onConfirm,
  onCancel,
  isConfirmed = false,
  isCancelled = false,
}: BookingConfirmationCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(isConfirmed);
  const [cancelled, setCancelled] = useState(isCancelled);
  const [topic, setTopic] = useState('');
  const [showTopicInput, setShowTopicInput] = useState(false);

  const isFilipino = language === 'fil';

  // Mini calendar state - centered on the booking date
  const bookingDate = useMemo(() => new Date(pendingBooking.date), [pendingBooking.date]);
  const [currentMonth, setCurrentMonth] = useState(new Date(bookingDate.getFullYear(), bookingDate.getMonth(), 1));

  const formatTime12h = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Generate calendar days for mini calendar
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  }, [currentMonth]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const handleConfirm = async () => {
    if (!topic.trim()) {
      setShowTopicInput(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/consultations/book', {
        facultyId: pendingBooking.facultyId,
        date: pendingBooking.date,
        startTime: pendingBooking.startTime,
        endTime: pendingBooking.endTime,
        topic: topic.trim(),
      });

      setConfirmed(true);
      onConfirm?.(response.data.booking);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book consultation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCancelled(true);
    onCancel?.();
  };

  // Already confirmed state
  if (confirmed) {
    return (
      <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              {isFilipino ? 'Booking Confirmed!' : 'Booking Confirmed!'}
            </h4>
            <p className="text-sm text-green-600 dark:text-green-300">
              {isFilipino 
                ? `Consultation kay ${pendingBooking.facultyName}` 
                : `Consultation with ${pendingBooking.facultyName}`}
            </p>
          </div>
        </div>
        <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
          <p className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(pendingBooking.date)}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatTime12h(pendingBooking.startTime)} - {formatTime12h(pendingBooking.endTime)}
          </p>
        </div>
        <p className="text-xs text-green-600 dark:text-green-400 mt-3">
          {isFilipino
            ? 'Hihintayin mo na lang ang confirmation mula sa faculty.'
            : 'Please wait for confirmation from the faculty.'}
        </p>
      </div>
    );
  }

  // Cancelled state
  if (cancelled) {
    return (
      <div className="mt-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <XCircle className="w-5 h-5" />
          <span className="text-sm">
            {isFilipino ? 'Kinansela ang booking' : 'Booking cancelled'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-white dark:bg-slate-800/50 border border-cyan-200 dark:border-cyan-500/30 rounded-2xl p-5 shadow-lg max-w-md">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">
            {isFilipino ? 'Kumpirmahin ang Booking' : 'Confirm Your Booking'}
          </h4>
          <p className="text-xs text-cyan-600 dark:text-cyan-400">
            {isFilipino ? 'I-review ang detalye bago mag-confirm' : 'Review details before confirming'}
          </p>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-500/10 dark:to-purple-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-xl p-4 mb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isFilipino ? 'Faculty' : 'Faculty'}
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {pendingBooking.facultyName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isFilipino ? 'Petsa' : 'Date'}
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {formatDate(pendingBooking.date)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isFilipino ? 'Oras' : 'Time'}
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {formatTime12h(pendingBooking.startTime)} - {formatTime12h(pendingBooking.endTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Calendar View (Read-only) */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {isFilipino ? 'Kalendaryo ng Booking' : 'Booking Calendar'}
          </span>
        </div>
        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3">
          {/* Month Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {dayNames.map((day, idx) => (
              <div key={idx} className="text-center text-[9px] font-medium text-slate-400 py-0.5">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }
              
              const dateStr = date.toISOString().split('T')[0];
              const isBookingDate = dateStr === pendingBooking.date;
              const isToday = date.toDateString() === new Date().toDateString();
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
              
              return (
                <div
                  key={dateStr}
                  className={`aspect-square rounded text-[10px] font-medium flex items-center justify-center
                    ${isBookingDate
                      ? 'bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-md ring-2 ring-cyan-300 dark:ring-cyan-500'
                      : isPast
                        ? 'text-slate-300 dark:text-slate-600'
                        : isToday
                          ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                          : 'text-slate-500 dark:text-slate-400'
                    }
                  `}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-3 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1 text-[9px] text-slate-500">
              <span className="w-2.5 h-2.5 bg-gradient-to-br from-cyan-500 to-purple-600 rounded" />
              {isFilipino ? 'Booking' : 'Booking'}
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-500">
              <span className="w-2.5 h-2.5 bg-cyan-100 dark:bg-cyan-500/20 rounded" />
              {isFilipino ? 'Ngayon' : 'Today'}
            </div>
          </div>
        </div>
      </div>

      {/* Topic Input */}
      {showTopicInput && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
            {isFilipino ? 'Paksa ng Konsultasyon *' : 'Consultation Topic *'}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={isFilipino ? 'Ano ang pag-uusapan?' : 'What would you like to discuss?'}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
            autoFocus
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <XCircle className="w-5 h-5" />
          {isFilipino ? 'Cancel' : 'Cancel'}
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          {isFilipino ? 'Confirm' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}
