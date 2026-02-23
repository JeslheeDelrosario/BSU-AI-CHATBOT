// client/src/pages/AdminConsultations.tsx
// Admin panel for managing faculty consultation availability

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import {
  Calendar, Clock, Users, Search, Edit2, Save, Check,
  UserCheck, UserX, ChevronDown, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
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
  isAvailable?: boolean;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

export default function AdminConsultations() {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const fil = settings.language === 'fil';

  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCollege, setFilterCollege] = useState('');
  const [colleges, setColleges] = useState<string[]>([]);
  
  // Edit modal state
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [editForm, setEditForm] = useState({
    consultationDays: [] as string[],
    consultationStart: '',
    consultationEnd: '',
    isAvailable: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch faculty
  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/consultations/faculty');
      setFaculty(res.data || []);
      
      // Extract unique colleges
      const uniqueColleges = [...new Set((res.data || []).map((f: Faculty) => f.college))];
      setColleges(uniqueColleges as string[]);
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  // Filter faculty
  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = !searchTerm || 
      `${f.firstName} ${f.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollege = !filterCollege || f.college === filterCollege;
    return matchesSearch && matchesCollege;
  });

  // Open edit modal
  const openEditModal = (f: Faculty) => {
    setEditingFaculty(f);
    setEditForm({
      consultationDays: f.consultationDays || [],
      consultationStart: f.consultationStart || '09:00',
      consultationEnd: f.consultationEnd || '17:00',
      isAvailable: f.consultationDays.length > 0,
    });
    setError('');
    setSuccess('');
  };

  // Toggle day selection
  const toggleDay = (day: string) => {
    setEditForm(prev => ({
      ...prev,
      consultationDays: prev.consultationDays.includes(day)
        ? prev.consultationDays.filter(d => d !== day)
        : [...prev.consultationDays, day]
    }));
  };

  // Save consultation settings
  const handleSave = async () => {
    if (!editingFaculty) return;
    
    try {
      setSaving(true);
      setError('');
      
      // If not available, clear consultation days
      const dataToSave = editForm.isAvailable ? {
        consultationDays: editForm.consultationDays,
        consultationStart: editForm.consultationStart,
        consultationEnd: editForm.consultationEnd,
      } : {
        consultationDays: [],
        consultationStart: null,
        consultationEnd: null,
      };

      await api.put(`/admin/consultations/faculty/${editingFaculty.id}`, dataToSave);
      
      setSuccess('Consultation settings saved successfully!');
      fetchFaculty();
      
      setTimeout(() => {
        setEditingFaculty(null);
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save consultation settings');
    } finally {
      setSaving(false);
    }
  };

  // Quick toggle availability
  const toggleAvailability = async (f: Faculty) => {
    try {
      const isCurrentlyAvailable = f.consultationDays.length > 0;
      
      if (isCurrentlyAvailable) {
        // Make unavailable
        await api.put(`/admin/consultations/faculty/${f.id}`, {
          consultationDays: [],
          consultationStart: null,
          consultationEnd: null,
        });
      } else {
        // Make available with default schedule
        await api.put(`/admin/consultations/faculty/${f.id}`, {
          consultationDays: ['Monday', 'Wednesday', 'Friday'],
          consultationStart: '09:00',
          consultationEnd: '17:00',
        });
      }
      
      fetchFaculty();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    }
  };

  // Access check
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">Admin access required</p>
        </div>
      </div>
    );
  }

  const availableCount = faculty.filter(f => f.consultationDays.length > 0).length;
  const unavailableCount = faculty.length - availableCount;

  return (
    <div className="min-h-screen py-6 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-400" />
              {fil ? 'Pamamahala ng Konsultasyon' : 'Consultation Management'}
            </h1>
            <p className="text-slate-400 mt-1">
              {fil ? 'Itakda ang availability ng faculty para sa konsultasyon' : 'Set faculty availability for consultations'}
            </p>
          </div>
          <button
            onClick={fetchFaculty}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {fil ? 'I-refresh' : 'Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{faculty.length}</p>
                <p className="text-sm text-slate-400">{fil ? 'Kabuuang Faculty' : 'Total Faculty'}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{availableCount}</p>
                <p className="text-sm text-slate-400">{fil ? 'Available' : 'Available'}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{unavailableCount}</p>
                <p className="text-sm text-slate-400">{fil ? 'Hindi Available' : 'Unavailable'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={fil ? 'Maghanap ng faculty...' : 'Search faculty...'}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="relative">
            <select
              value={filterCollege}
              onChange={e => setFilterCollege(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 cursor-pointer min-w-[200px]"
            >
              <option value="">{fil ? 'Lahat ng College' : 'All Colleges'}</option>
              {colleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Faculty List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              {fil ? 'Walang nahanap na faculty' : 'No faculty found'}
            </h3>
            <p className="text-slate-500">
              {searchTerm ? `No results for "${searchTerm}"` : 'No faculty members available'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Faculty</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Position</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Consultation Days</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Hours</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFaculty.map(f => {
                  const isAvailable = f.consultationDays.length > 0;
                  return (
                    <tr key={f.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {f.firstName} {f.middleName ? `${f.middleName.charAt(0)}. ` : ''}{f.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{f.email || 'No email'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-300">{f.position}</p>
                        <p className="text-xs text-slate-500">{f.college}</p>
                      </td>
                      <td className="px-5 py-4">
                        {isAvailable ? (
                          <div className="flex flex-wrap gap-1">
                            {f.consultationDays.map(day => (
                              <span key={day} className="px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">
                                {day.slice(0, 3)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500 italic">Not set</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {isAvailable && f.consultationStart && f.consultationEnd ? (
                          <span className="text-sm text-slate-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {f.consultationStart} - {f.consultationEnd}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-500 italic">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => toggleAvailability(f)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors ${
                            isAvailable
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          {isAvailable ? <><UserCheck className="w-3 h-3" /> Available</> : <><UserX className="w-3 h-3" /> Unavailable</>}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openEditModal(f)}
                          className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                          title="Edit Schedule"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingFaculty && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setEditingFaculty(null); }}>
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-purple-500/30 shadow-2xl">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                {fil ? 'I-edit ang Konsultasyon' : 'Edit Consultation Schedule'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {editingFaculty.firstName} {editingFaculty.lastName}
              </p>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" /> {success}
                </div>
              )}

              {/* Availability Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                <span className="text-sm font-medium text-slate-300">
                  {fil ? 'Available para sa Konsultasyon' : 'Available for Consultations'}
                </span>
                <button
                  type="button"
                  onClick={() => setEditForm(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    editForm.isAvailable ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    editForm.isAvailable ? 'left-8' : 'left-1'
                  }`} />
                </button>
              </div>

              {editForm.isAvailable && (
                <>
                  {/* Days Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      {fil ? 'Mga Araw ng Konsultasyon' : 'Consultation Days'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            editForm.consultationDays.includes(day)
                              ? 'bg-purple-500 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {fil ? 'Oras ng Simula' : 'Start Time'}
                      </label>
                      <select
                        value={editForm.consultationStart}
                        onChange={e => setEditForm(prev => ({ ...prev, consultationStart: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      >
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        {fil ? 'Oras ng Pagtapos' : 'End Time'}
                      </label>
                      <select
                        value={editForm.consultationEnd}
                        onChange={e => setEditForm(prev => ({ ...prev, consultationEnd: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      >
                        {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-white/10 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {fil ? 'I-save' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditingFaculty(null)}
                className="px-6 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors"
              >
                {fil ? 'Kanselahin' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
