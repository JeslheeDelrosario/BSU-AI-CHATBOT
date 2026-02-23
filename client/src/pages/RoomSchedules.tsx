// client/src/pages/RoomSchedules.tsx
// Interactive Room & Schedule Simulation for College of Science

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { 
  Building2, Search, Calendar, Clock, Users, MapPin, 
  ChevronLeft, ChevronRight, CheckCircle, XCircle,
  Wifi, Monitor, Projector, Zap, Eye, Activity, RefreshCw,
  Grid3X3, List, ChevronDown, User, X, Radio, Sparkles
} from 'lucide-react';
import api from '../lib/api';
import Room3DFloorPlan from '../components/Room3DFloorPlan';

// ─── Types ───────────────────────────────────────────────
interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  Organizer: { id: string; firstName: string; lastName: string };
}

interface VirtualUser {
  id: string;
  name: string;
  avatar: string;
  x: number;
  y: number;
  color: string;
  isMoving: boolean;
  status: 'active' | 'idle' | 'away';
}

interface Room {
  id: string;
  name: string;
  building: string;
  floor?: number;
  capacity: number;
  type: string;
  facilities: string[];
  isActive: boolean;
  Meetings: Meeting[];
  currentStatus: 'AVAILABLE' | 'OCCUPIED';
  currentMeeting: Meeting | null;
  nextMeeting: Meeting | null;
  virtualUsers?: VirtualUser[];
  onlineCount?: number;
}


// ─── Constants ───────────────────────────────────────────
const ROOM_TYPE_LABELS: Record<string, string> = {
  CLASSROOM: 'Classroom', LABORATORY: 'Laboratory', CONFERENCE: 'Conference Room',
  LECTURE_HALL: 'Lecture Hall', COMPUTER_LAB: 'Computer Lab', LIBRARY: 'Library',
  STUDY_ROOM: 'Study Room', AUDITORIUM: 'Auditorium',
};

const ROOM_COLORS: Record<string, string> = {
  CLASSROOM: 'from-blue-500 to-cyan-500', LABORATORY: 'from-green-500 to-emerald-500',
  CONFERENCE: 'from-purple-500 to-pink-500', LECTURE_HALL: 'from-amber-500 to-orange-500',
  COMPUTER_LAB: 'from-cyan-500 to-blue-500', LIBRARY: 'from-indigo-500 to-purple-500',
  STUDY_ROOM: 'from-teal-500 to-green-500', AUDITORIUM: 'from-rose-500 to-red-500',
};

const AVATAR_COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'];

function generateVirtualUsers(roomId: string, count: number): VirtualUser[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${roomId}-user-${i}`,
    name: `Student ${i + 1}`,
    avatar: `S${i + 1}`,
    x: 50 + Math.random() * 500,
    y: 80 + Math.random() * 280,
    color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    isMoving: Math.random() > 0.6,
    status: (Math.random() > 0.3 ? 'active' : Math.random() > 0.5 ? 'idle' : 'away') as VirtualUser['status']
  }));
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// ─── Main Page Component ─────────────────────────────────
export default function RoomSchedules() {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const fil = settings.language === 'fil';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterType, setFilterType] = useState('');
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [simulationRoom, setSimulationRoom] = useState<Room | null>(null);
  
  // Debug: Log when simulationRoom changes
  useEffect(() => {
    console.log('🔄 simulationRoom state changed:', simulationRoom ? `${simulationRoom.name} (${simulationRoom.id})` : 'null');
  }, [simulationRoom]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  
  // Debug: Log when expandedRoom changes
  useEffect(() => {
    console.log('📅 expandedRoom state changed:', expandedRoom);
  }, [expandedRoom]);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = { date: formatDate(selectedDate) };
      if (filterBuilding) params.building = filterBuilding;
      if (filterType) params.type = filterType;

      const res = await api.get('/rooms/schedules', { params });
      const data = (res.data || []).map((room: Room) => ({
        ...room,
        onlineCount: Math.floor(Math.random() * Math.min(room.capacity, 15)),
        virtualUsers: generateVirtualUsers(room.id, Math.floor(Math.random() * 6) + 2)
      }));
      setRooms(data);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Failed to fetch rooms:', err);
      setError(err?.response?.data?.error || 'Failed to load rooms. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, filterBuilding, filterType]);

  const fetchFilters = useCallback(async () => {
    try {
      const [bRes, tRes] = await Promise.all([api.get('/rooms/buildings'), api.get('/rooms/types')]);
      setBuildings(bRes.data || []);
      setRoomTypes(tRes.data || []);
    } catch (err) {
      console.error('Failed to fetch filters:', err);
    }
  }, []);

  useEffect(() => { fetchFilters(); }, [fetchFilters]);
  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  useEffect(() => {
    if (!isAutoRefresh) return;
    const id = setInterval(fetchRooms, 30000);
    return () => clearInterval(id);
  }, [isAutoRefresh, fetchRooms]);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  const formatDateDisplay = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return fil ? 'Ngayon' : 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return fil ? 'Bukas' : 'Tomorrow';
    return date.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const filteredRooms = rooms.filter(room => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return room.name.toLowerCase().includes(q) || room.building.toLowerCase().includes(q) ||
      room.type.toLowerCase().includes(q) || (ROOM_TYPE_LABELS[room.type] || '').toLowerCase().includes(q);
  });

  const availableCount = filteredRooms.filter(r => r.currentStatus === 'AVAILABLE').length;
  const occupiedCount = filteredRooms.filter(r => r.currentStatus === 'OCCUPIED').length;
  const totalOnline = filteredRooms.reduce((sum, r) => sum + (r.onlineCount || 0), 0);

  return (
    <div className="min-h-screen py-6 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-cyan-400" />
              Virtual Room Hub
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              {fil ? 'Interactive room simulation ng College of Science' : 'Interactive room simulation for College of Science'}
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                <Radio className="w-3 h-3 animate-pulse" /> LIVE
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-300">{totalOnline} students online</span>
            </div>
            <button
              onClick={() => { setIsAutoRefresh(!isAutoRefresh); if (!isAutoRefresh) fetchRooms(); }}
              className={`p-2 rounded-xl transition-colors ${isAutoRefresh ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-400'}`}
              title={isAutoRefresh ? 'Auto-refresh ON (30s)' : 'Auto-refresh OFF'}
            >
              <RefreshCw className={`w-5 h-5 ${isAutoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: fil ? 'Kabuuang Silid' : 'Total Rooms', value: filteredRooms.length, icon: Building2, color: 'cyan' },
            { label: 'Available', value: availableCount, icon: CheckCircle, color: 'green' },
            { label: 'Occupied', value: occupiedCount, icon: XCircle, color: 'red' },
            { label: fil ? 'Online Ngayon' : 'Online Now', value: totalOnline, icon: Users, color: 'purple' },
          ].map(s => (
            <div key={s.label} className={`relative overflow-hidden bg-gradient-to-br from-${s.color}-500/10 to-${s.color}-500/5 border border-${s.color}-500/20 rounded-2xl p-5`}>
              <div className={`absolute top-0 right-0 w-20 h-20 bg-${s.color}-500/10 rounded-full blur-2xl`} />
              <div className="relative flex items-center gap-3">
                <div className={`p-3 bg-${s.color}-500/20 rounded-xl`}>
                  <s.icon className={`w-6 h-6 text-${s.color}-400`} />
                </div>
                <div>
                  <p className={`text-3xl font-bold ${s.color === 'cyan' ? 'text-white' : `text-${s.color}-400`}`}>{s.value}</p>
                  <p className="text-sm text-slate-400">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Date */}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-xl p-1">
              <button onClick={() => changeDate(-1)} className="p-2.5 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>
              <div className="px-4 py-2 min-w-[130px] text-center">
                <p className="font-semibold text-white text-sm">{formatDateDisplay(selectedDate)}</p>
                <p className="text-[10px] text-slate-500">{selectedDate.toLocaleDateString('en-PH')}</p>
              </div>
              <button onClick={() => changeDate(1)} className="p-2.5 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={fil ? 'Maghanap ng silid, building, o uri...' : 'Search rooms, buildings, or types...'}
                className="w-full pl-12 pr-10 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Building */}
            <div className="relative">
              <select value={filterBuilding} onChange={e => setFilterBuilding(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 cursor-pointer min-w-[150px]">
                <option value="">{fil ? 'Lahat ng Building' : 'All Buildings'}</option>
                {buildings.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Type */}
            <div className="relative">
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500 cursor-pointer min-w-[130px]">
                <option value="">{fil ? 'Lahat ng Uri' : 'All Types'}</option>
                {roomTypes.map(t => <option key={t} value={t}>{ROOM_TYPE_LABELS[t] || t}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-xl p-1">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:bg-white/10'}`} title="Grid">
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:bg-white/10'}`} title="List">
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
            <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            {searchQuery && <span className="text-cyan-400">{filteredRooms.length} result{filteredRooms.length !== 1 ? 's' : ''} for "{searchQuery}"</span>}
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="text-center py-20 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-300 mb-2">{fil ? 'May problema' : 'Error Loading Rooms'}</h3>
            <p className="text-slate-400 mb-4">{error}</p>
            <button onClick={() => fetchRooms()} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-colors">
              {fil ? 'Subukan Muli' : 'Try Again'}
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-cyan-500/30 rounded-full animate-spin border-t-cyan-500" />
              <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-cyan-400" />
            </div>
            <p className="mt-4 text-slate-400">Loading rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">{fil ? 'Walang nahanap na silid' : 'No rooms found'}</h3>
            <p className="text-slate-500 mb-4">{searchQuery ? `No results for "${searchQuery}".` : 'No rooms match your filters.'}</p>
            {(searchQuery || filterBuilding || filterType) && (
              <button onClick={() => { setSearchQuery(''); setFilterBuilding(''); setFilterType(''); }}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-colors">
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          /* ─── List View ─── */
          <div className="space-y-2">
            {filteredRooms.map(room => (
              <div key={room.id} className="group flex items-center gap-4 p-4 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl hover:border-cyan-500/40 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ROOM_COLORS[room.type] || 'from-cyan-500 to-blue-500'} flex items-center justify-center flex-shrink-0`}>
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white">{room.name}</h3>
                  <p className="text-xs text-slate-500">{room.building} • {ROOM_TYPE_LABELS[room.type]}</p>
                </div>
                <span className="text-sm text-slate-400 flex items-center gap-1"><Users className="w-4 h-4" /> {room.capacity}</span>
                <span className="text-sm text-cyan-400 flex items-center gap-1"><User className="w-4 h-4" /> {room.onlineCount || 0}</span>
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${room.currentStatus === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {room.currentStatus}
                </span>
                <button 
                  type="button"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    e.preventDefault(); 
                    console.log('🚪 List Enter clicked:', room.name, room); 
                    setSimulationRoom(room); 
                  }} 
                  className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-sm font-medium hover:bg-cyan-600 transition-colors cursor-pointer active:scale-95 pointer-events-auto">
                  Enter
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* ─── Grid View ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map(room => (
              <div key={room.id} className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10">
                <div className={`absolute inset-0 bg-gradient-to-br ${ROOM_COLORS[room.type] || 'from-cyan-500 to-blue-500'} opacity-0 group-hover:opacity-5 transition-opacity`} />

                {/* Header */}
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ROOM_COLORS[room.type] || 'from-cyan-500 to-blue-500'} flex items-center justify-center shadow-lg`}>
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{room.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{room.building}{room.floor ? `, F${room.floor}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 ${
                        room.currentStatus === 'AVAILABLE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${room.currentStatus === 'AVAILABLE' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                        {room.currentStatus === 'AVAILABLE' ? 'Available' : 'Occupied'}
                      </span>
                      {(room.onlineCount || 0) > 0 && (
                        <span className="text-[10px] text-cyan-400 flex items-center gap-1"><User className="w-3 h-3" /> {room.onlineCount} online</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg text-slate-300"><Users className="w-4 h-4 text-slate-400" />{room.capacity}</span>
                    <span className={`px-2 py-1 bg-gradient-to-r ${ROOM_COLORS[room.type] || 'from-cyan-500 to-blue-500'} bg-clip-text text-transparent text-xs font-medium border border-white/10 rounded-lg`}>
                      {ROOM_TYPE_LABELS[room.type] || room.type}
                    </span>
                  </div>

                  {room.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {room.facilities.slice(0, 3).map(f => (
                        <span key={f} className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-[10px] border border-cyan-500/20">
                          {f === 'WiFi' && <Wifi className="w-3 h-3" />}
                          {f === 'Projector' && <Projector className="w-3 h-3" />}
                          {f === 'Desktop Computers' && <Monitor className="w-3 h-3" />}
                          {f}
                        </span>
                      ))}
                      {room.facilities.length > 3 && <span className="px-2 py-1 bg-white/5 text-slate-400 rounded-lg text-[10px]">+{room.facilities.length - 3}</span>}
                    </div>
                  )}

                  {room.currentMeeting && (
                    <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                      <p className="text-[10px] font-semibold text-red-400 mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> IN SESSION</p>
                      <p className="text-sm text-white font-medium truncate">{room.currentMeeting.title}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" />{formatTime(room.currentMeeting.startTime)} - {formatTime(room.currentMeeting.endTime)}</p>
                    </div>
                  )}

                  {!room.currentMeeting && room.nextMeeting && (
                    <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                      <p className="text-[10px] font-semibold text-amber-400 mb-1">NEXT UP</p>
                      <p className="text-sm text-white font-medium truncate">{room.nextMeeting.title}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" />{formatTime(room.nextMeeting.startTime)}</p>
                    </div>
                  )}

                  {!room.currentMeeting && !room.nextMeeting && (
                    <p className="text-sm text-green-400 font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4" />{fil ? 'Walang booking ngayon' : 'No bookings today'}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 flex gap-2 relative z-10">
                  <button 
                    type="button"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      e.preventDefault(); 
                      console.log('🚪 Enter room clicked:', room.name, room); 
                      setSimulationRoom(room); 
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 pointer-events-auto">
                    <Eye className="w-4 h-4" /> Enter Room
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      e.preventDefault(); 
                      console.log('📅 Calendar clicked:', room.name, 'Current expanded:', expandedRoom); 
                      setExpandedRoom(expandedRoom === room.id ? null : room.id); 
                    }}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer active:scale-95 pointer-events-auto" 
                    title="View Schedule">
                    <Calendar className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Schedule Expand */}
                {expandedRoom === room.id && (
                  <div className="border-t border-white/5 p-4 bg-slate-900/50">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-cyan-400" />{fil ? 'Iskedyul Ngayon' : "Today's Schedule"}</h4>
                    {room.Meetings.length > 0 ? (
                      <div className="space-y-2">
                        {room.Meetings.map(m => (
                          <div key={m.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                            <div className="text-xs text-cyan-400 w-16 font-mono">{formatTime(m.startTime)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{m.title}</p>
                              <p className="text-[10px] text-slate-500">{m.Organizer.firstName} {m.Organizer.lastName}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No scheduled meetings</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3D Floor Plan Room Simulation */}
      {simulationRoom && (
        <Room3DFloorPlan
          key={simulationRoom.id}
          room={simulationRoom}
          virtualUsers={simulationRoom.virtualUsers || []}
          userName={user?.firstName || 'You'}
          userInitial={user?.firstName?.[0] || 'U'}
          isAdmin={user?.role === 'ADMIN'}
          onClose={() => {
            console.log('Closing room simulation');
            setSimulationRoom(null);
          }}
        />
      )}
    </div>
  );
}
