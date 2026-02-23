// client/src/pages/AdminRooms.tsx
// Admin Room & Schedule Management — dark theme, schedule CRUD

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import {
  Building2, Plus, Search, Edit, Trash2, Users, Wifi, Monitor,
  CheckCircle, XCircle, Eye, EyeOff, X, Calendar, Clock, ChevronDown,
  Loader2, AlertTriangle, Projector
} from 'lucide-react';
import api from '../lib/api';

// ─── Types ───────────────────────────────────────────────
interface Room {
  id: string;
  name: string;
  building: string;
  floor?: number;
  capacity: number;
  type: string;
  facilities: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { Meetings: number };
  Meetings?: Meeting[];
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  meetingType: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  Organizer?: { id: string; firstName: string; lastName: string };
}

interface Statistics {
  totalRooms: number;
  activeRooms: number;
  inactiveRooms: number;
  roomsByType: Array<{ type: string; _count: number }>;
  roomsByBuilding: Array<{ building: string; _count: number }>;
  upcomingMeetings: number;
}

// ─── Constants ───────────────────────────────────────────
const ROOM_TYPES = ['CLASSROOM','LABORATORY','CONFERENCE','LECTURE_HALL','COMPUTER_LAB','LIBRARY','STUDY_ROOM','AUDITORIUM'];
const ROOM_TYPE_LABELS: Record<string, string> = {
  CLASSROOM: 'Classroom', LABORATORY: 'Laboratory', CONFERENCE: 'Conference Room',
  LECTURE_HALL: 'Lecture Hall', COMPUTER_LAB: 'Computer Lab', LIBRARY: 'Library',
  STUDY_ROOM: 'Study Room', AUDITORIUM: 'Auditorium',
};
const MEETING_TYPES = ['CLASS','CONSULTATION','EXAM','WORKSHOP','SEMINAR','ONLINE','IN_PERSON','HYBRID'];
const COMMON_FACILITIES = ['Whiteboard','Projector','Smart Board','Air Conditioning','WiFi','Sound System','Video Conferencing','Microphones','Desktop Computers','Lab Equipment','Storage Cabinets'];

const ROOM_COLORS: Record<string, string> = {
  CLASSROOM: 'from-blue-500 to-cyan-500', LABORATORY: 'from-green-500 to-emerald-500',
  CONFERENCE: 'from-purple-500 to-pink-500', LECTURE_HALL: 'from-amber-500 to-orange-500',
  COMPUTER_LAB: 'from-cyan-500 to-blue-500', LIBRARY: 'from-indigo-500 to-purple-500',
  STUDY_ROOM: 'from-teal-500 to-green-500', AUDITORIUM: 'from-rose-500 to-red-500',
};

type Tab = 'rooms' | 'schedules';

export default function AdminRooms() {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const fil = settings.language === 'fil';

  // State
  const [activeTab, setActiveTab] = useState<Tab>('rooms');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterActive, setFilterActive] = useState('');

  // Room modal
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    name: '', building: '', floor: '', capacity: '', type: 'CLASSROOM',
    facilities: [] as string[], isActive: true,
  });

  // Schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: '', description: '', roomId: '', meetingType: 'CLASS',
    startDate: '', startTime: '', endDate: '', endTime: '',
    isRecurring: false, recurrenceRule: '',
  });

  // Schedule view
  const [scheduleRoomId, setScheduleRoomId] = useState('');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [roomMeetings, setRoomMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [customFacility, setCustomFacility] = useState('');

  // ─── Data Fetching ─────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterType) params.type = filterType;
      if (filterBuilding) params.building = filterBuilding;
      if (filterActive) params.isActive = filterActive;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/admin/rooms', { params });
      setRooms(res.data || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterBuilding, filterActive, searchTerm]);

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await api.get('/admin/rooms/statistics');
      setStatistics(res.data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  }, []);

  const fetchBuildings = useCallback(async () => {
    try {
      const res = await api.get('/admin/rooms/buildings');
      setBuildings(res.data || []);
    } catch (err) {
      console.error('Failed to fetch buildings:', err);
    }
  }, []);

  const fetchRoomMeetings = useCallback(async () => {
    if (!scheduleRoomId) { setRoomMeetings([]); return; }
    try {
      setLoadingMeetings(true);
      const res = await api.get(`/admin/rooms/${scheduleRoomId}`, { params: { date: scheduleDate } });
      setRoomMeetings(res.data?.Meetings || []);
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
      setRoomMeetings([]);
    } finally {
      setLoadingMeetings(false);
    }
  }, [scheduleRoomId, scheduleDate]);

  useEffect(() => { fetchRooms(); fetchStatistics(); fetchBuildings(); }, [fetchRooms, fetchStatistics, fetchBuildings]);
  useEffect(() => { if (activeTab === 'schedules') fetchRoomMeetings(); }, [activeTab, fetchRoomMeetings]);

  // ─── Room CRUD ─────────────────────────────────────────
  const resetRoomForm = () => {
    setRoomForm({ name: '', building: '', floor: '', capacity: '', type: 'CLASSROOM', facilities: [], isActive: true });
    setEditingRoom(null);
    setError('');
    setCustomFacility('');
  };

  const openEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name, building: room.building, floor: room.floor?.toString() || '',
      capacity: room.capacity.toString(), type: room.type, facilities: room.facilities, isActive: room.isActive,
    });
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...roomForm,
        floor: roomForm.floor ? parseInt(roomForm.floor) : null,
        capacity: parseInt(roomForm.capacity),
      };
      if (editingRoom) {
        await api.put(`/admin/rooms/${editingRoom.id}`, payload);
      } else {
        await api.post('/admin/rooms', payload);
      }
      setShowRoomModal(false);
      resetRoomForm();
      fetchRooms();
      fetchStatistics();
      fetchBuildings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room? All associated schedules will also be removed.')) return;
    try {
      await api.delete(`/admin/rooms/${roomId}`);
      fetchRooms();
      fetchStatistics();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete room');
    }
  };

  const toggleFacility = (f: string) => {
    setRoomForm(prev => ({
      ...prev,
      facilities: prev.facilities.includes(f) ? prev.facilities.filter(x => x !== f) : [...prev.facilities, f],
    }));
  };

  // ─── Schedule CRUD ─────────────────────────────────────
  const resetScheduleForm = () => {
    setScheduleForm({ title: '', description: '', roomId: '', meetingType: 'CLASS', startDate: '', startTime: '', endDate: '', endTime: '', isRecurring: false, recurrenceRule: '' });
    setEditingMeeting(null);
    setError('');
  };

  const openCreateSchedule = (roomId?: string) => {
    resetScheduleForm();
    if (roomId) setScheduleForm(prev => ({ ...prev, roomId }));
    setShowScheduleModal(true);
  };

  const openEditSchedule = (meeting: Meeting, roomId: string) => {
    setEditingMeeting(meeting);
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);
    setScheduleForm({
      title: meeting.title,
      description: meeting.description || '',
      roomId,
      meetingType: meeting.meetingType,
      startDate: start.toISOString().split('T')[0],
      startTime: start.toTimeString().slice(0, 5),
      endDate: end.toISOString().split('T')[0],
      endTime: end.toTimeString().slice(0, 5),
      isRecurring: meeting.isRecurring,
      recurrenceRule: meeting.recurrenceRule || '',
    });
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!scheduleForm.roomId) { setError('Please select a room'); return; }
    if (!scheduleForm.startDate || !scheduleForm.startTime || !scheduleForm.endTime) { setError('Please fill in all date/time fields'); return; }

    setSaving(true);
    try {
      const startTime = new Date(`${scheduleForm.startDate}T${scheduleForm.startTime}:00`);
      const endDate = scheduleForm.endDate || scheduleForm.startDate;
      const endTime = new Date(`${endDate}T${scheduleForm.endTime}:00`);

      if (endTime <= startTime) { setError('End time must be after start time'); setSaving(false); return; }

      const payload = {
        title: scheduleForm.title,
        description: scheduleForm.description || null,
        roomId: scheduleForm.roomId,
        meetingType: scheduleForm.meetingType,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isRecurring: scheduleForm.isRecurring,
        recurrenceRule: scheduleForm.recurrenceRule || null,
        organizerId: user?.id,
      };

      if (editingMeeting) {
        await api.put(`/admin/rooms/meetings/${editingMeeting.id}`, payload);
      } else {
        await api.post('/admin/rooms/meetings', payload);
      }

      setShowScheduleModal(false);
      resetScheduleForm();
      fetchRoomMeetings();
      fetchStatistics();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm('Delete this schedule entry?')) return;
    try {
      await api.delete(`/admin/rooms/meetings/${meetingId}`);
      fetchRoomMeetings();
      fetchStatistics();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete schedule');
    }
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });

  // ─── Render ────────────────────────────────────────────
  if (loading && rooms.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto" />
          <p className="mt-4 text-slate-400">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
              <Building2 className="w-8 h-8 text-cyan-400" />
              {fil ? 'Pamamahala ng Silid' : 'Room & Schedule Management'}
            </h1>
            <p className="text-slate-400 mt-1">{fil ? 'Pamahalaan ang mga silid at iskedyul' : 'Manage rooms, facilities, and schedules'}</p>
          </div>
        </div>

        {/* Stats */}
        {statistics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Rooms', value: statistics.totalRooms, icon: Building2, color: 'cyan' },
              { label: 'Active', value: statistics.activeRooms, icon: CheckCircle, color: 'green' },
              { label: 'Inactive', value: statistics.inactiveRooms, icon: XCircle, color: 'red' },
              { label: 'Upcoming', value: statistics.upcomingMeetings, icon: Calendar, color: 'purple' },
            ].map(s => (
              <div key={s.label} className={`bg-gradient-to-br from-${s.color}-500/10 to-${s.color}-500/5 border border-${s.color}-500/20 rounded-2xl p-5`}>
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-${s.color}-500/20 rounded-xl`}><s.icon className={`w-6 h-6 text-${s.color}-400`} /></div>
                  <div>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-sm text-slate-400">{s.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5">
          {(['rooms', 'schedules'] as Tab[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              {tab === 'rooms' ? (fil ? 'Mga Silid' : 'Rooms') : (fil ? 'Mga Iskedyul' : 'Schedules')}
            </button>
          ))}
        </div>

        {/* ═══ ROOMS TAB ═══ */}
        {activeTab === 'rooms' && (
          <>
            {/* Filters */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search rooms..." className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
                </div>
                <div className="relative">
                  <select value={filterType} onChange={e => setFilterType(e.target.value)}
                    className="appearance-none px-4 py-3 pr-10 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 cursor-pointer min-w-[140px]">
                    <option value="">All Types</option>
                    {ROOM_TYPES.map(t => <option key={t} value={t}>{ROOM_TYPE_LABELS[t]}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={filterBuilding} onChange={e => setFilterBuilding(e.target.value)}
                    className="appearance-none px-4 py-3 pr-10 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 cursor-pointer min-w-[150px]">
                    <option value="">All Buildings</option>
                    {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={filterActive} onChange={e => setFilterActive(e.target.value)}
                    className="appearance-none px-4 py-3 pr-10 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 cursor-pointer min-w-[120px]">
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <button onClick={() => { resetRoomForm(); setShowRoomModal(true); }}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:brightness-110 transition-all whitespace-nowrap">
                  <Plus className="w-5 h-5" /> Add Room
                </button>
              </div>
            </div>

            {/* Room Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      {['Room', 'Building', 'Type', 'Capacity', 'Facilities', 'Status', 'Schedules', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rooms.map(room => (
                      <tr key={room.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${ROOM_COLORS[room.type] || 'from-cyan-500 to-blue-500'} flex items-center justify-center`}>
                              <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{room.name}</p>
                              {room.floor && <p className="text-xs text-slate-500">Floor {room.floor}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-300">{room.building}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 text-xs rounded-lg bg-gradient-to-r ${ROOM_COLORS[room.type] || 'from-cyan-500 to-blue-500'} text-white`}>
                            {ROOM_TYPE_LABELS[room.type] || room.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-sm text-slate-300"><Users className="w-4 h-4 text-slate-400" />{room.capacity}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {room.facilities.slice(0, 2).map(f => (
                              <span key={f} className="px-2 py-0.5 text-[10px] bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">
                                {f === 'WiFi' && <Wifi className="w-3 h-3 inline mr-1" />}
                                {f === 'Projector' && <Projector className="w-3 h-3 inline mr-1" />}
                                {f === 'Desktop Computers' && <Monitor className="w-3 h-3 inline mr-1" />}
                                {f}
                              </span>
                            ))}
                            {room.facilities.length > 2 && <span className="px-2 py-0.5 text-[10px] bg-white/5 text-slate-400 rounded">+{room.facilities.length - 2}</span>}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {room.isActive ? (
                            <span className="flex items-center gap-1 text-sm text-green-400"><CheckCircle className="w-4 h-4" />Active</span>
                          ) : (
                            <span className="flex items-center gap-1 text-sm text-red-400"><XCircle className="w-4 h-4" />Inactive</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm text-purple-400">{room._count?.Meetings || 0}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setScheduleRoomId(room.id); setActiveTab('schedules'); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="View Schedules">
                              <Calendar className="w-4 h-4 text-purple-400" />
                            </button>
                            <button onClick={() => openCreateSchedule(room.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Add Schedule">
                              <Plus className="w-4 h-4 text-cyan-400" />
                            </button>
                            <button onClick={() => openEditRoom(room)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Edit Room">
                              <Edit className="w-4 h-4 text-amber-400" />
                            </button>
                            <button onClick={() => handleDeleteRoom(room.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Delete Room">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rooms.length === 0 && (
                  <div className="text-center py-16">
                    <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No rooms found. Add your first room!</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ═══ SCHEDULES TAB ═══ */}
        {activeTab === 'schedules' && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <select value={scheduleRoomId} onChange={e => setScheduleRoomId(e.target.value)}
                    className="appearance-none w-full px-4 py-3 pr-10 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 cursor-pointer">
                    <option value="">Select a room to view schedules...</option>
                    {rooms.filter(r => r.isActive).map(r => <option key={r.id} value={r.id}>{r.name} — {r.building}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)}
                  className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500" />
                <button onClick={() => openCreateSchedule(scheduleRoomId)}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:brightness-110 transition-all whitespace-nowrap">
                  <Plus className="w-5 h-5" /> Add Schedule
                </button>
              </div>
            </div>

            {!scheduleRoomId ? (
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-2">Select a Room</h3>
                <p className="text-slate-500">Choose a room above to view and manage its schedules.</p>
              </div>
            ) : loadingMeetings ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    Schedules for {rooms.find(r => r.id === scheduleRoomId)?.name || 'Room'}
                  </h3>
                  <span className="text-sm text-slate-400">{roomMeetings.length} entries</span>
                </div>

                {roomMeetings.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No schedules found for this date.</p>
                    <button onClick={() => openCreateSchedule(scheduleRoomId)}
                      className="mt-3 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-colors text-sm">
                      Add first schedule
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {roomMeetings.map(meeting => (
                      <div key={meeting.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                        <div className="w-16 text-center">
                          <p className="text-cyan-400 font-mono text-sm">{formatTime(meeting.startTime)}</p>
                          <p className="text-slate-500 text-[10px]">to</p>
                          <p className="text-cyan-400 font-mono text-sm">{formatTime(meeting.endTime)}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white">{meeting.title}</p>
                          {meeting.description && <p className="text-xs text-slate-500 truncate">{meeting.description}</p>}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded">{meeting.meetingType}</span>
                            <span className={`px-2 py-0.5 text-[10px] rounded ${meeting.status === 'SCHEDULED' ? 'bg-green-500/20 text-green-400' : meeting.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                              {meeting.status}
                            </span>
                            {meeting.isRecurring && <span className="px-2 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-400 rounded">Recurring</span>}
                          </div>
                          {meeting.Organizer && <p className="text-[10px] text-slate-500 mt-1">By: {meeting.Organizer.firstName} {meeting.Organizer.lastName}</p>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditSchedule(meeting, scheduleRoomId)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                            <Edit className="w-4 h-4 text-amber-400" />
                          </button>
                          <button onClick={() => handleDeleteMeeting(meeting.id)} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══ ROOM MODAL ═══ */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) { setShowRoomModal(false); resetRoomForm(); } }}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{editingRoom ? 'Edit Room' : 'Create New Room'}</h3>
                <button onClick={() => { setShowRoomModal(false); resetRoomForm(); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSaveRoom} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Room Name *</label>
                    <input type="text" required value={roomForm.name} onChange={e => setRoomForm({ ...roomForm, name: e.target.value })}
                      placeholder="e.g., CS-101" className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Building *</label>
                    <input type="text" required value={roomForm.building} onChange={e => setRoomForm({ ...roomForm, building: e.target.value })}
                      placeholder="e.g., Computer Science Building" className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Floor</label>
                    <input type="number" value={roomForm.floor} onChange={e => setRoomForm({ ...roomForm, floor: e.target.value })}
                      placeholder="1" className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Capacity *</label>
                    <input type="number" required value={roomForm.capacity} onChange={e => setRoomForm({ ...roomForm, capacity: e.target.value })}
                      placeholder="30" className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Type *</label>
                    <div className="relative">
                      <select value={roomForm.type} onChange={e => setRoomForm({ ...roomForm, type: e.target.value })}
                        className="appearance-none w-full px-4 py-3 pr-10 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 cursor-pointer">
                        {ROOM_TYPES.map(t => <option key={t} value={t}>{ROOM_TYPE_LABELS[t]}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Facilities</label>
                  <div className="grid grid-cols-3 gap-2">
                    {COMMON_FACILITIES.map(f => (
                      <label key={f} className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                        <input type="checkbox" checked={roomForm.facilities.includes(f)} onChange={() => toggleFacility(f)}
                          className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-700" />
                        <span className="text-sm text-slate-300">{f}</span>
                      </label>
                    ))}
                  </div>
                  {/* Custom facilities that were added */}
                  {roomForm.facilities.filter(f => !COMMON_FACILITIES.includes(f)).length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-slate-500 mb-2">Custom Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {roomForm.facilities.filter(f => !COMMON_FACILITIES.includes(f)).map(f => (
                          <span key={f} className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm border border-purple-500/30">
                            {f}
                            <button type="button" onClick={() => toggleFacility(f)} className="ml-1 hover:text-red-400 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Add custom facility */}
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={customFacility}
                      onChange={e => setCustomFacility(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && customFacility.trim()) {
                          e.preventDefault();
                          if (!roomForm.facilities.includes(customFacility.trim())) {
                            setRoomForm(prev => ({ ...prev, facilities: [...prev.facilities, customFacility.trim()] }));
                          }
                          setCustomFacility('');
                        }
                      }}
                      placeholder="Add custom facility..."
                      className="flex-1 px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customFacility.trim() && !roomForm.facilities.includes(customFacility.trim())) {
                          setRoomForm(prev => ({ ...prev, facilities: [...prev.facilities, customFacility.trim()] }));
                          setCustomFacility('');
                        }
                      }}
                      className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Item
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                  <span className="text-sm font-medium text-slate-300">Room Status</span>
                  <button type="button" onClick={() => setRoomForm({ ...roomForm, isActive: !roomForm.isActive })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${roomForm.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                    {roomForm.isActive ? <><Eye className="w-4 h-4" />Active</> : <><EyeOff className="w-4 h-4" />Inactive</>}
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingRoom ? 'Update Room' : 'Create Room'}
                  </button>
                  <button type="button" onClick={() => { setShowRoomModal(false); resetRoomForm(); }}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCHEDULE MODAL ═══ */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) { setShowScheduleModal(false); resetScheduleForm(); } }}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{editingMeeting ? 'Edit Schedule' : 'Create Schedule'}</h3>
                <button onClick={() => { setShowScheduleModal(false); resetScheduleForm(); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={handleSaveSchedule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                  <input type="text" required value={scheduleForm.title} onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                    placeholder="e.g., Data Structures Lecture" className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <textarea value={scheduleForm.description} onChange={e => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    placeholder="Optional description..." rows={2}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Room *</label>
                    <div className="relative">
                      <select value={scheduleForm.roomId} onChange={e => setScheduleForm({ ...scheduleForm, roomId: e.target.value })} required
                        className="appearance-none w-full px-4 py-3 pr-10 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 cursor-pointer">
                        <option value="">Select room...</option>
                        {rooms.filter(r => r.isActive).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Type *</label>
                    <div className="relative">
                      <select value={scheduleForm.meetingType} onChange={e => setScheduleForm({ ...scheduleForm, meetingType: e.target.value })}
                        className="appearance-none w-full px-4 py-3 pr-10 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 cursor-pointer">
                        {MEETING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Start Date *</label>
                    <input type="date" required value={scheduleForm.startDate} onChange={e => setScheduleForm({ ...scheduleForm, startDate: e.target.value, endDate: scheduleForm.endDate || e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Start Time *</label>
                    <input type="time" required value={scheduleForm.startTime} onChange={e => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
                    <input type="date" value={scheduleForm.endDate} onChange={e => setScheduleForm({ ...scheduleForm, endDate: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">End Time *</label>
                    <input type="time" required value={scheduleForm.endTime} onChange={e => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer px-3 py-3 bg-slate-800/30 rounded-xl">
                  <input type="checkbox" checked={scheduleForm.isRecurring} onChange={e => setScheduleForm({ ...scheduleForm, isRecurring: e.target.checked })}
                    className="rounded border-slate-600 text-cyan-500 focus:ring-cyan-500 bg-slate-700" />
                  <span className="text-sm text-slate-300">Recurring Schedule</span>
                </label>
                {scheduleForm.isRecurring && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Recurrence Rule</label>
                    <input type="text" value={scheduleForm.recurrenceRule} onChange={e => setScheduleForm({ ...scheduleForm, recurrenceRule: e.target.value })}
                      placeholder="e.g., FREQ=WEEKLY;BYDAY=MO,WE,FR" className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" />
                    <p className="text-[10px] text-slate-500 mt-1">Use iCalendar RRULE format</p>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingMeeting ? 'Update Schedule' : 'Create Schedule'}
                  </button>
                  <button type="button" onClick={() => { setShowScheduleModal(false); resetScheduleForm(); }}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
