// client/src/pages/FacultyConsultationCalendar.tsx
// Faculty-facing consultation calendar: manage schedule, view/confirm/cancel bookings

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import {
  Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle,
  AlertCircle, Loader2, Settings, Edit3, Save, X, RefreshCw,
  CalendarDays, BookOpen, Mail, Search, Users
} from 'lucide-react';
import api from '../lib/api';

interface Faculty {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  position: string;
  college: string;
  officeHours?: string;
  consultationDays: string[];
  consultationStart?: string;
  consultationEnd?: string;
}

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  notes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  Student?: { firstName: string; lastName: string; email?: string };
}

interface ConsultationConfig {
  maxDurationMinutes: number;
  minDurationMinutes: number;
  maxStudentsPerSlot: number;
  allowCancellation: boolean;
  cancellationWindowHours: number;
  reminderHoursBefore: number;
  allowRescheduling: boolean;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const getWeekStart = (d: Date): Date => {
  const r = new Date(d); const day = r.getDay();
  r.setDate(r.getDate() + (day === 0 ? -6 : 1 - day));
  r.setHours(0, 0, 0, 0); return r;
};
const addDays = (d: Date, n: number): Date => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const fmtDate = (d: Date): string => d.toISOString().split('T')[0];
const fmtTime = (t: string): string => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };
const fmtDisp = (s: string): string => new Date(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const stsCls = (s: string): string => s === 'CONFIRMED' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200' : s === 'PENDING' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200' : s === 'CANCELLED' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200' : s === 'COMPLETED' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200';

export default function FacultyConsultationCalendar() {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const fil = settings.language === 'fil';

  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [config, setConfig] = useState<ConsultationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [calLoading, setCalLoading] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'schedule' | 'config'>('calendar');
  const [editSched, setEditSched] = useState(false);
  const [schedForm, setSchedForm] = useState({ consultationDays: [] as string[], consultationStart: '', consultationEnd: '', officeHours: '' });
  const [schedLoading, setSchedLoading] = useState(false);
  const [editConfig, setEditConfig] = useState(false);
  const [cfgForm, setCfgForm] = useState<ConsultationConfig>({ maxDurationMinutes: 30, minDurationMinutes: 15, maxStudentsPerSlot: 1, allowCancellation: true, cancellationWindowHours: 24, reminderHoursBefore: 24, allowRescheduling: true });
  const [cfgLoading, setCfgLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Faculty search state
  const [allFaculty, setAllFaculty] = useState<Faculty[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [viewMode, setViewMode] = useState<'my' | 'search'>('my');

  const showToast = (msg: string, type: 'success' | 'error') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/consultations/my-profile');
      setFaculty(res.data.faculty);
      setSchedForm({ consultationDays: res.data.faculty.consultationDays || [], consultationStart: res.data.faculty.consultationStart || '', consultationEnd: res.data.faculty.consultationEnd || '', officeHours: res.data.faculty.officeHours || '' });
    } catch { /* shown in UI */ }
  }, []);

  const fetchCalendar = useCallback(async (fac: Faculty, start: Date) => {
    setCalLoading(true);
    try { const res = await api.get('/consultations/calendar', { params: { facultyId: fac.id, weekStart: fmtDate(start) } }); setBookings(res.data.bookings || []); }
    catch { setBookings([]); }
    finally { setCalLoading(false); }
  }, []);

  const fetchConfig = useCallback(async () => {
    try { const res = await api.get('/consultations/config'); setConfig(res.data); setCfgForm(res.data); } catch { /* non-critical */ }
  }, []);

  const fetchAllFaculty = useCallback(async () => {
    try {
      const res = await api.get('/consultations/faculty-list');
      setAllFaculty(res.data || []);
    } catch (err) { 
      console.error('Failed to fetch faculty list:', err);
    }
  }, []);

  useEffect(() => { (async () => { setLoading(true); await Promise.all([fetchProfile(), fetchConfig(), fetchAllFaculty()]); setLoading(false); })(); }, [fetchProfile, fetchConfig, fetchAllFaculty]);
  
  // Auto-switch to search mode if user has no faculty record
  useEffect(() => { if (!loading && !faculty) setViewMode('search'); }, [loading, faculty]);
  
  // Fetch calendar for the active faculty (own or selected)
  const activeFaculty = viewMode === 'search' ? selectedFaculty : faculty;
  useEffect(() => { if (activeFaculty) fetchCalendar(activeFaculty, weekStart); }, [activeFaculty, weekStart, fetchCalendar]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try { await api.put(`/consultations/${id}/status`, { status }); showToast(fil ? 'Na-update' : 'Updated', 'success'); if (faculty) fetchCalendar(faculty, weekStart); setSelectedBooking(null); }
    catch (e: unknown) { showToast((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed', 'error'); }
    finally { setActionLoading(null); }
  };

  const saveSchedule = async () => {
    if (!schedForm.consultationDays.length) { showToast(fil ? 'Pumili ng araw' : 'Select at least one day', 'error'); return; }
    setSchedLoading(true);
    try { const res = await api.put('/consultations/my-schedule', schedForm); setFaculty(res.data); setEditSched(false); showToast(fil ? 'Na-save' : 'Saved', 'success'); }
    catch (e: unknown) { showToast((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed', 'error'); }
    finally { setSchedLoading(false); }
  };

  const saveConfig = async () => {
    setCfgLoading(true);
    try { const res = await api.put('/consultations/config', cfgForm); setConfig(res.data.config); setEditConfig(false); showToast(fil ? 'Na-save' : 'Saved', 'success'); }
    catch (e: unknown) { showToast((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed', 'error'); }
    finally { setCfgLoading(false); }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const bkgsForDay = (d: Date) => bookings.filter(b => b.date.startsWith(fmtDate(d)));
  const isToday = (d: Date) => { const t = new Date(); return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear(); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-cyan-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen py-8 px-4 lg:px-8">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-50 dark:bg-green-900/80 border-green-200 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/80 border-red-200 text-red-700 dark:text-red-300'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.msg}</span>
          <button onClick={() => setToast(null)}><X className="w-4 h-4 opacity-60" /></button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            {fil ? 'Kalendaryo ng Konsultasyon' : 'Consultation Calendar'}
          </h1>
          {faculty && <p className="text-slate-600 dark:text-slate-400">{faculty.firstName} {faculty.lastName} · {faculty.position}</p>}
        </div>

        {!faculty && (
          <div className="p-6 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 rounded-2xl flex items-start gap-4 mb-8">
            <AlertCircle className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">{fil ? 'Walang faculty record' : 'No faculty record found'}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{fil ? 'Hindi pa naka-link ang account mo. Makipag-ugnayan sa admin.' : 'Your account is not linked to a faculty record. Contact an admin.'}</p>
            </div>
          </div>
        )}

        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-white/5 rounded-2xl p-1 w-fit">
          {([{ key: 'calendar', icon: CalendarDays, label: fil ? 'Kalendaryo' : 'Calendar' }, { key: 'schedule', icon: Edit3, label: fil ? 'Aking Schedule' : 'My Schedule' }, ...(user?.role === 'ADMIN' ? [{ key: 'config', icon: Settings, label: 'Configuration' }] : [])] as { key: 'calendar' | 'schedule' | 'config'; icon: typeof CalendarDays; label: string }[]).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === t.key ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Faculty Search/Filter Section */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* View Mode Toggle */}
                {faculty && (
                  <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
                    <button onClick={() => { setViewMode('my'); setSelectedFaculty(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'my' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>
                      <Users className="w-4 h-4 inline mr-1.5" />{fil ? 'Aking Calendar' : 'My Calendar'}
                    </button>
                    <button onClick={() => setViewMode('search')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'search' ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>
                      <Search className="w-4 h-4 inline mr-1.5" />{fil ? 'Hanapin Faculty' : 'Search Faculty'}
                    </button>
                  </div>
                )}

                {/* Faculty Search Input */}
                {viewMode === 'search' && (
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={fil ? 'Hanapin ang pangalan ng faculty member...' : 'Search faculty member by name...'} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Faculty Members List */}
              {viewMode === 'search' && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-3">{fil ? 'Pumili ng Faculty Member' : 'Select a Faculty Member'} ({allFaculty.filter(f => !searchQuery || `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())).length})</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto">
                    {allFaculty.filter(f => !searchQuery || `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())).map(f => (
                      <button key={f.id} onClick={() => setSelectedFaculty(f)} className={`p-3 rounded-xl border text-left transition-all hover:shadow-md ${selectedFaculty?.id === f.id ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-cyan-300'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{f.firstName[0]}{f.lastName[0]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{f.firstName} {f.lastName}</p>
                            <p className="text-xs text-slate-500 truncate">{f.position}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {f.consultationDays?.slice(0, 3).map(d => (
                            <span key={d} className="text-[10px] px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded">{d.slice(0, 3)}</span>
                          ))}
                          {(f.consultationDays?.length || 0) > 3 && <span className="text-[10px] text-slate-400">+{(f.consultationDays?.length || 0) - 3}</span>}
                        </div>
                      </button>
                    ))}
                    {allFaculty.filter(f => !searchQuery || `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <p className="col-span-full text-center text-slate-400 py-4">{fil ? 'Walang nahanap na faculty' : 'No faculty found'}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Faculty Info Card */}
              {selectedFaculty && (
                <div className="mt-4 p-4 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-500/10 dark:to-purple-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0">{selectedFaculty.firstName[0]}{selectedFaculty.lastName[0]}</div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white text-lg">{selectedFaculty.firstName} {selectedFaculty.lastName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{selectedFaculty.position}</p>
                      {selectedFaculty.email && <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Mail className="w-3 h-3" />{selectedFaculty.email}</p>}
                    </div>
                    <button onClick={() => setSelectedFaculty(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-cyan-200 dark:border-cyan-500/30 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{fil ? 'Araw ng Konsultasyon' : 'Consultation Days'}</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedFaculty.consultationDays?.map(d => (
                          <span key={d} className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-lg font-medium">{d}</span>
                        ))}
                        {(!selectedFaculty.consultationDays || selectedFaculty.consultationDays.length === 0) && <span className="text-xs text-slate-400">Not set</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{fil ? 'Oras' : 'Time'}</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {selectedFaculty.consultationStart && selectedFaculty.consultationEnd 
                          ? `${fmtTime(selectedFaculty.consultationStart)} – ${fmtTime(selectedFaculty.consultationEnd)}`
                          : 'Not set'}
                      </p>
                    </div>
                  </div>
                  {selectedFaculty.officeHours && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Office Hours</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{selectedFaculty.officeHours}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
              <button onClick={() => setWeekStart(p => addDays(p, -7))} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"><ChevronLeft className="w-5 h-5 text-slate-600" /></button>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-900 dark:text-white text-sm">{weekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} · {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {addDays(weekStart, 6).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <button onClick={() => setWeekStart(getWeekStart(new Date()))} className="px-3 py-1.5 text-xs font-medium bg-cyan-500/10 text-cyan-600 rounded-lg hover:bg-cyan-500/20 flex items-center gap-1.5"><RefreshCw className="w-3 h-3" />{fil ? 'Ngayon' : 'Today'}</button>
              </div>
              <button onClick={() => setWeekStart(p => addDays(p, 7))} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"><ChevronRight className="w-5 h-5 text-slate-600" /></button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-200" /><span className="text-slate-500">{fil ? 'Araw ng Konsultasyon' : 'Consultation Day'}</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" /><span className="text-slate-500">Pending</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200" /><span className="text-slate-500">Confirmed</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-200" /><span className="text-slate-500">Completed</span></div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-200" /><span className="text-slate-500">Cancelled</span></div>
            </div>

            {/* Calendar Grid */}
            {!activeFaculty ? (
              <div className="p-8 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{viewMode === 'search' ? (fil ? 'Pumili ng faculty para makita ang calendar' : 'Select a faculty to view their calendar') : (fil ? 'Walang faculty record na naka-link sa account mo' : 'No faculty record linked to your account')}</p>
              </div>
            ) : calLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>
            ) : (
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, idx) => {
                  const dayBkgs = bkgsForDay(day);
                  const avail = activeFaculty?.consultationDays?.includes(DAYS[(day.getDay() + 6) % 7]) ?? false;
                  const today = isToday(day);
                  return (
                    <div key={idx} className={`min-h-[180px] rounded-2xl border p-3 flex flex-col ${today ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10' : avail ? 'border-cyan-200 bg-cyan-50/50 dark:bg-cyan-500/5' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5'}`}>
                      <div className="mb-2">
                        <p className={`text-xs font-semibold uppercase ${today ? 'text-cyan-600' : 'text-slate-400'}`}>{SHORT[idx]}</p>
                        <p className={`text-lg font-bold ${today ? 'text-cyan-700' : 'text-slate-900 dark:text-white'}`}>{day.getDate()}</p>
                        {avail && <p className="text-[10px] text-cyan-600 font-medium">{activeFaculty?.consultationStart} – {activeFaculty?.consultationEnd}</p>}
                      </div>
                      <div className="flex-1 space-y-1.5 overflow-y-auto">
                        {dayBkgs.length === 0 && avail && <p className="text-[10px] text-slate-400 italic">{fil ? 'Walang booking' : 'No bookings'}</p>}
                        {!avail && <p className="text-[10px] text-slate-300 italic">{fil ? 'Hindi available' : 'Not available'}</p>}
                        {dayBkgs.map(b => (
                          <button key={b.id} onClick={() => setSelectedBooking(b)} className={`w-full text-left px-2 py-1.5 rounded-lg border text-[10px] font-medium hover:shadow-md transition-shadow ${stsCls(b.status)}`}>
                            <div className="font-semibold truncate">{b.Student?.firstName} {b.Student?.lastName}</div>
                            <div className="opacity-80 flex items-center gap-1"><Clock className="w-3 h-3" />{fmtTime(b.startTime)} – {fmtTime(b.endTime)}</div>
                            <div className="opacity-70 truncate">{b.topic}</div>
                          </button>
                        ))}
                      </div>
                      {avail && dayBkgs.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/10">
                          <p className="text-[10px] text-slate-500">{dayBkgs.length} {fil ? 'booking' : 'booking(s)'}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-purple-500" />{fil ? 'Lahat ng Booking' : 'All Bookings'}<span className="ml-auto text-sm font-normal text-slate-400">{bookings.length}</span></h2>
              {bookings.length === 0 ? <p className="text-center text-slate-400 py-8">{fil ? 'Walang booking' : 'No bookings this week'}</p> : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <div key={b.id} onClick={() => setSelectedBooking(b)} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl hover:border-cyan-500/40 cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">{b.Student?.firstName?.[0]}{b.Student?.lastName?.[0]}</div>
                      <div className="flex-1 min-w-0"><p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{b.Student?.firstName} {b.Student?.lastName}</p><p className="text-xs text-slate-500 truncate">{b.topic}</p></div>
                      <div className="text-right"><p className="text-xs text-slate-500">{fmtDisp(b.date)}</p><p className="text-xs font-medium text-slate-700 dark:text-slate-300">{fmtTime(b.startTime)} – {fmtTime(b.endTime)}</p></div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${stsCls(b.status)}`}>{b.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && faculty && (
          <div className="max-w-2xl">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Calendar className="w-5 h-5 text-cyan-500" />{fil ? 'Aking Schedule' : 'My Schedule'}</h2>
                {!editSched ? (
                  <button onClick={() => setEditSched(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-600 rounded-xl text-sm font-medium hover:bg-cyan-500/20"><Edit3 className="w-4 h-4" />{fil ? 'I-edit' : 'Edit'}</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditSched(false); setSchedForm({ consultationDays: faculty.consultationDays || [], consultationStart: faculty.consultationStart || '', consultationEnd: faculty.consultationEnd || '', officeHours: faculty.officeHours || '' }); }} className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 rounded-xl text-sm font-medium">{fil ? 'Kanselahin' : 'Cancel'}</button>
                    <button onClick={saveSchedule} disabled={schedLoading} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">{schedLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{fil ? 'I-save' : 'Save'}</button>
                  </div>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{fil ? 'Araw ng Konsultasyon' : 'Consultation Days'}</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => {
                    const active = schedForm.consultationDays.includes(day);
                    return <button key={day} onClick={() => editSched && setSchedForm(p => ({ ...p, consultationDays: active ? p.consultationDays.filter(d => d !== day) : [...p.consultationDays, day] }))} disabled={!editSched} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${active ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-slate-50 dark:bg-white/5 text-slate-600 border-slate-200'} ${!editSched ? 'cursor-default' : 'cursor-pointer hover:border-cyan-400'}`}>{day.slice(0, 3)}</button>;
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5"><Clock className="w-4 h-4" />{fil ? 'Simula' : 'Start'}</label>
                  <input type="time" value={schedForm.consultationStart} disabled={!editSched} onChange={e => setSchedForm(p => ({ ...p, consultationStart: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5"><Clock className="w-4 h-4" />{fil ? 'Tapos' : 'End'}</label>
                  <input type="time" value={schedForm.consultationEnd} disabled={!editSched} onChange={e => setSchedForm(p => ({ ...p, consultationEnd: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 disabled:opacity-60" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{fil ? 'Office Hours (Opsyonal)' : 'Office Hours (Optional)'}</label>
                <input type="text" value={schedForm.officeHours} disabled={!editSched} placeholder="e.g. Mon & Wed, 1:00PM–3:00PM" onChange={e => setSchedForm(p => ({ ...p, officeHours: e.target.value }))} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 disabled:opacity-60" />
              </div>
              {!editSched && (
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{fil ? 'Kasalukuyang Schedule' : 'Current Schedule'}</p>
                  <p className="text-sm text-slate-900 dark:text-white font-medium">{faculty.consultationDays.length > 0 ? faculty.consultationDays.join(', ') : (fil ? 'Walang itinakdang araw' : 'No days set')}</p>
                  {faculty.consultationStart && faculty.consultationEnd && <p className="text-sm text-cyan-600 mt-1">{fmtTime(faculty.consultationStart)} – {fmtTime(faculty.consultationEnd)}</p>}
                  {faculty.officeHours && <p className="text-xs text-slate-500 mt-1">{faculty.officeHours}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'config' && user?.role === 'ADMIN' && (
          <div className="max-w-2xl">
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Settings className="w-5 h-5 text-purple-500" />Consultation Configuration</h2>
                {!editConfig ? (
                  <button onClick={() => setEditConfig(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-600 rounded-xl text-sm font-medium hover:bg-purple-500/20"><Edit3 className="w-4 h-4" />Edit</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setEditConfig(false); if (config) setCfgForm(config); }} className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 rounded-xl text-sm font-medium">Cancel</button>
                    <button onClick={saveConfig} disabled={cfgLoading} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">{cfgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Min Duration (min)</label><input type="number" value={cfgForm.minDurationMinutes} disabled={!editConfig} onChange={e => setCfgForm(p => ({ ...p, minDurationMinutes: +e.target.value }))} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white disabled:opacity-60" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Max Duration (min)</label><input type="number" value={cfgForm.maxDurationMinutes} disabled={!editConfig} onChange={e => setCfgForm(p => ({ ...p, maxDurationMinutes: +e.target.value }))} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white disabled:opacity-60" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Max Students/Slot</label><input type="number" value={cfgForm.maxStudentsPerSlot} disabled={!editConfig} onChange={e => setCfgForm(p => ({ ...p, maxStudentsPerSlot: +e.target.value }))} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white disabled:opacity-60" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cancellation Window (hrs)</label><input type="number" value={cfgForm.cancellationWindowHours} disabled={!editConfig} onChange={e => setCfgForm(p => ({ ...p, cancellationWindowHours: +e.target.value }))} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white disabled:opacity-60" /></div>
                <div className="col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={cfgForm.allowCancellation} disabled={!editConfig} onChange={e => setCfgForm(p => ({ ...p, allowCancellation: e.target.checked }))} className="w-4 h-4 rounded border-slate-300" /><span className="text-sm text-slate-700 dark:text-slate-300">Allow Cancellation</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={cfgForm.allowRescheduling} disabled={!editConfig} onChange={e => setCfgForm(p => ({ ...p, allowRescheduling: e.target.checked }))} className="w-4 h-4 rounded border-slate-300" /><span className="text-sm text-slate-700 dark:text-slate-300">Allow Rescheduling</span></label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{fil ? 'Detalye ng Booking' : 'Booking Details'}</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold">{selectedBooking.Student?.firstName?.[0]}{selectedBooking.Student?.lastName?.[0]}</div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.Student?.firstName} {selectedBooking.Student?.lastName}</p>
                  {selectedBooking.Student?.email && <p className="text-xs text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" />{selectedBooking.Student.email}</p>}
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl space-y-2">
                <p className="text-sm"><span className="font-medium text-slate-500">{fil ? 'Paksa:' : 'Topic:'}</span> <span className="text-slate-900 dark:text-white">{selectedBooking.topic}</span></p>
                <p className="text-sm"><span className="font-medium text-slate-500">{fil ? 'Petsa:' : 'Date:'}</span> <span className="text-slate-900 dark:text-white">{fmtDisp(selectedBooking.date)}</span></p>
                <p className="text-sm"><span className="font-medium text-slate-500">{fil ? 'Oras:' : 'Time:'}</span> <span className="text-slate-900 dark:text-white">{fmtTime(selectedBooking.startTime)} – {fmtTime(selectedBooking.endTime)}</span></p>
                {selectedBooking.notes && <p className="text-sm"><span className="font-medium text-slate-500">{fil ? 'Notes:' : 'Notes:'}</span> <span className="text-slate-900 dark:text-white">{selectedBooking.notes}</span></p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500">Status:</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${stsCls(selectedBooking.status)}`}>{selectedBooking.status}</span>
              </div>
            </div>
            {(selectedBooking.status === 'PENDING' || selectedBooking.status === 'CONFIRMED') && (
              <div className="flex gap-2">
                {selectedBooking.status === 'PENDING' && (
                  <button onClick={() => updateStatus(selectedBooking.id, 'CONFIRMED')} disabled={actionLoading === selectedBooking.id} className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2">
                    {actionLoading === selectedBooking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}{fil ? 'Kumpirmahin' : 'Confirm'}
                  </button>
                )}
                {selectedBooking.status === 'CONFIRMED' && (
                  <button onClick={() => updateStatus(selectedBooking.id, 'COMPLETED')} disabled={actionLoading === selectedBooking.id} className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2">
                    {actionLoading === selectedBooking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}{fil ? 'Kumpleto' : 'Complete'}
                  </button>
                )}
                <button onClick={() => updateStatus(selectedBooking.id, 'CANCELLED')} disabled={actionLoading === selectedBooking.id} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2">
                  {actionLoading === selectedBooking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}{fil ? 'Kanselahin' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
