import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, Users, Activity, 
  MessageCircle, Send, MapPin, Settings, Plus,
  RotateCcw, Trash2, Lock, Unlock, Move, ZoomIn, ZoomOut,
  Palette, Grid3X3
} from 'lucide-react';
import api from '../lib/api';

// Types
interface Furniture {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string | null;
  zIndex: number;
  isLocked: boolean;
}

interface RoomLayout {
  id: string;
  roomId: string;
  width: number;
  height: number;
  wallColor: string;
  floorColor: string;
  floorPattern: string;
  backgroundSound: string | null;
  Furniture: Furniture[];
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  isSystem: boolean;
  createdAt: string;
  User?: {
    firstName: string;
    lastName: string;
  };
}

interface VirtualUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
  x: number;
  y: number;
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
  currentStatus: string;
  onlineCount?: number;
  currentMeeting?: {
    title: string;
    startTime: string;
    endTime: string;
  };
  Meetings: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
  }>;
}

interface Room3DFloorPlanProps {
  room: Room;
  virtualUsers: VirtualUser[];
  userName: string;
  userInitial: string;
  isAdmin?: boolean;
  onClose: () => void;
}

// Furniture rendering configurations
const FURNITURE_STYLES: Record<string, { icon: string; defaultColor: string; label: string }> = {
  CHAIR: { icon: 'C', defaultColor: '#1f2937', label: 'Chair' },
  TABLE: { icon: 'T', defaultColor: '#78350f', label: 'Table' },
  DESK: { icon: 'D', defaultColor: '#374151', label: 'Desk' },
  WHITEBOARD: { icon: 'W', defaultColor: '#f8fafc', label: 'Whiteboard' },
  PROJECTOR_SCREEN: { icon: 'P', defaultColor: '#f8fafc', label: 'Projector' },
  COMPUTER: { icon: 'PC', defaultColor: '#1e3a5f', label: 'Computer' },
  BOOKSHELF: { icon: 'B', defaultColor: '#78350f', label: 'Bookshelf' },
  DOOR: { icon: 'EXIT', defaultColor: '#78350f', label: 'Door' },
  WINDOW: { icon: 'WIN', defaultColor: '#60a5fa', label: 'Window' },
  PODIUM: { icon: 'POD', defaultColor: '#78350f', label: 'Podium' },
  CABINET: { icon: 'CAB', defaultColor: '#6b7280', label: 'Cabinet' },
  PLANT: { icon: 'PLT', defaultColor: '#22c55e', label: 'Plant' },
  CLOCK: { icon: 'CLK', defaultColor: '#f8fafc', label: 'Clock' },
  BOARD: { icon: 'BRD', defaultColor: '#92400e', label: 'Board' },
  CUSTOM: { icon: '?', defaultColor: '#6b7280', label: 'Custom' }
};

// Floor patterns
const FLOOR_PATTERNS: Record<string, string> = {
  grid: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
  dots: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
  lines: 'linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
  solid: 'none'
};

// Background sounds
const BACKGROUND_SOUNDS: Record<string, { label: string; url: string }> = {
  ambient_classroom: { label: 'Classroom Ambience', url: '/sounds/classroom-ambient.mp3' },
  library_quiet: { label: 'Library Quiet', url: '/sounds/library-quiet.mp3' },
  nature_birds: { label: 'Nature & Birds', url: '/sounds/nature-birds.mp3' },
  rain_soft: { label: 'Soft Rain', url: '/sounds/rain-soft.mp3' },
  white_noise: { label: 'White Noise', url: '/sounds/white-noise.mp3' },
  focus_music: { label: 'Focus Music', url: '/sounds/focus-music.mp3' }
};

// Wall color presets
const WALL_COLORS = [
  { name: 'Slate', color: '#1e293b' },
  { name: 'Dark Blue', color: '#1e3a5f' },
  { name: 'Dark Green', color: '#14532d' },
  { name: 'Dark Purple', color: '#3b0764' },
  { name: 'Dark Red', color: '#7f1d1d' },
  { name: 'Charcoal', color: '#18181b' }
];

// Floor color presets
const FLOOR_COLORS = [
  { name: 'Dark Slate', color: '#0f172a' },
  { name: 'Navy', color: '#172554' },
  { name: 'Forest', color: '#052e16' },
  { name: 'Midnight', color: '#020617' },
  { name: 'Graphite', color: '#27272a' },
  { name: 'Charcoal', color: '#09090b' }
];

export default function Room3DFloorPlan({ 
  room, 
  virtualUsers, 
  userName, 
  userInitial, 
  isAdmin = false,
  onClose 
}: Room3DFloorPlanProps) {
  // State
  const [layout, setLayout] = useState<RoomLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [myPos, setMyPos] = useState({ x: 300, y: 220 });
  const [users, setUsers] = useState<VirtualUser[]>(virtualUsers);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatFocused, setIsChatFocused] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const [draggedFurniture, setDraggedFurniture] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [showFurniturePanel, setShowFurniturePanel] = useState(false);
  const [furnitureTemplates, setFurnitureTemplates] = useState<any[]>([]);
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Format time helper
  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Fetch room layout
  const fetchLayout = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/rooms/${room.id}/layout`);
      setLayout(res.data);
    } catch (err) {
      console.error('Failed to fetch room layout:', err);
      // Create default layout structure if API fails
      setLayout({
        id: 'default',
        roomId: room.id,
        width: 600,
        height: 400,
        wallColor: '#1e293b',
        floorColor: '#0f172a',
        floorPattern: 'grid',
        backgroundSound: null,
        Furniture: []
      });
    } finally {
      setLoading(false);
    }
  }, [room.id]);

  // Fetch chat messages
  const fetchChatMessages = useCallback(async () => {
    try {
      const res = await api.get(`/rooms/${room.id}/chat`);
      setChatMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch chat messages:', err);
    }
  }, [room.id]);

  // Fetch furniture templates
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await api.get('/rooms/templates');
      setFurnitureTemplates(res.data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchLayout();
    fetchChatMessages();
    fetchTemplates();
  }, [fetchLayout, fetchChatMessages, fetchTemplates]);

  // Animate virtual users
  useEffect(() => {
    if (paused || editMode) return;
    const interval = setInterval(() => {
      setUsers(prev => prev.map(u => ({
        ...u,
        x: u.isMoving ? Math.max(20, Math.min((layout?.width || 580) - 20, u.x + (Math.random() - 0.5) * 12)) : u.x,
        y: u.isMoving ? Math.max(50, Math.min((layout?.height || 360) - 20, u.y + (Math.random() - 0.5) * 12)) : u.y,
        isMoving: Math.random() > 0.85 ? !u.isMoving : u.isMoving
      })));
    }, 600);
    return () => clearInterval(interval);
  }, [paused, editMode, layout?.width, layout?.height]);

  // Keyboard movement
  useEffect(() => {
    if (isChatFocused || editMode) return;
    const onKey = (e: KeyboardEvent) => {
      const speed = 18;
      setMyPos(prev => {
        let { x, y } = prev;
        switch (e.key) {
          case 'ArrowUp': case 'w': case 'W': y = Math.max(50, y - speed); break;
          case 'ArrowDown': case 's': case 'S': y = Math.min((layout?.height || 360) - 20, y + speed); break;
          case 'ArrowLeft': case 'a': case 'A': x = Math.max(20, x - speed); break;
          case 'ArrowRight': case 'd': case 'D': x = Math.min((layout?.width || 580) - 20, x + speed); break;
          default: return prev;
        }
        e.preventDefault();
        return { x, y };
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isChatFocused, editMode, layout?.width, layout?.height]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Background sound
  useEffect(() => {
    if (soundOn && layout?.backgroundSound && BACKGROUND_SOUNDS[layout.backgroundSound]) {
      if (!audioRef.current) {
        audioRef.current = new Audio(BACKGROUND_SOUNDS[layout.backgroundSound].url);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
      }
      audioRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundOn, layout?.backgroundSound]);

  // Send chat message
  const sendChat = async () => {
    if (!chatInput.trim()) return;
    
    try {
      const res = await api.post(`/rooms/${room.id}/chat`, {
        message: chatInput,
        sender: userName
      });
      setChatMessages(prev => [...prev, res.data]);
      setChatInput('');
      chatInputRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message:', err);
      // Fallback to local message
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: userName,
        message: chatInput,
        isSystem: false,
        createdAt: new Date().toISOString()
      }]);
      setChatInput('');
    }
  };

  // Furniture drag handlers
  const handleFurnitureMouseDown = (e: React.MouseEvent, furnitureId: string) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    const furniture = layout?.Furniture.find(f => f.id === furnitureId);
    if (!furniture || furniture.isLocked) return;
    
    setSelectedFurniture(furnitureId);
    setDraggedFurniture(furnitureId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: (e.clientX - rect.left) / zoom - furniture.x,
        y: (e.clientY - rect.top) / zoom - furniture.y
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggedFurniture || !layout) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const newX = Math.max(0, Math.min(layout.width - 20, (e.clientX - rect.left) / zoom - dragOffset.x));
    const newY = Math.max(0, Math.min(layout.height - 20, (e.clientY - rect.top) / zoom - dragOffset.y));
    
    setLayout(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        Furniture: prev.Furniture.map(f => 
          f.id === draggedFurniture ? { ...f, x: newX, y: newY } : f
        )
      };
    });
  };

  const handleCanvasMouseUp = async () => {
    if (draggedFurniture && layout) {
      const furniture = layout.Furniture.find(f => f.id === draggedFurniture);
      if (furniture) {
        try {
          await api.put(`/rooms/furniture/${draggedFurniture}`, {
            x: furniture.x,
            y: furniture.y
          });
        } catch (err) {
          console.error('Failed to update furniture position:', err);
        }
      }
    }
    setDraggedFurniture(null);
  };

  // Add furniture
  const addFurniture = async (template: any) => {
    if (!layout) return;
    
    try {
      const res = await api.post(`/rooms/${room.id}/furniture`, {
        type: template.type,
        name: template.name,
        x: layout.width / 2 - template.width / 2,
        y: layout.height / 2 - template.height / 2,
        width: template.width,
        height: template.height,
        color: template.color
      });
      
      setLayout(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          Furniture: [...prev.Furniture, res.data]
        };
      });
    } catch (err) {
      console.error('Failed to add furniture:', err);
    }
  };

  // Delete furniture
  const deleteFurniture = async (furnitureId: string) => {
    try {
      await api.delete(`/rooms/furniture/${furnitureId}`);
      setLayout(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          Furniture: prev.Furniture.filter(f => f.id !== furnitureId)
        };
      });
      setSelectedFurniture(null);
    } catch (err) {
      console.error('Failed to delete furniture:', err);
    }
  };

  // Toggle furniture lock
  const toggleFurnitureLock = async (furnitureId: string) => {
    const furniture = layout?.Furniture.find(f => f.id === furnitureId);
    if (!furniture) return;
    
    try {
      await api.put(`/rooms/furniture/${furnitureId}`, {
        isLocked: !furniture.isLocked
      });
      setLayout(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          Furniture: prev.Furniture.map(f => 
            f.id === furnitureId ? { ...f, isLocked: !f.isLocked } : f
          )
        };
      });
    } catch (err) {
      console.error('Failed to toggle lock:', err);
    }
  };

  // Update layout settings
  const updateLayoutSettings = async (updates: Partial<RoomLayout>) => {
    if (!layout) return;
    
    setSaving(true);
    try {
      await api.put(`/rooms/${room.id}/layout`, updates);
      setLayout(prev => prev ? { ...prev, ...updates } : prev);
    } catch (err) {
      console.error('Failed to update layout:', err);
    } finally {
      setSaving(false);
    }
  };

  // Reset layout
  const resetLayout = async () => {
    if (!confirm('Are you sure you want to reset the room layout to default? This cannot be undone.')) return;
    
    try {
      const res = await api.post(`/rooms/${room.id}/layout/reset`);
      setLayout(res.data);
    } catch (err) {
      console.error('Failed to reset layout:', err);
    }
  };

  // Render furniture item
  const renderFurniture = (furniture: Furniture) => {
    const style = FURNITURE_STYLES[furniture.type] || FURNITURE_STYLES.CUSTOM;
    const isSelected = selectedFurniture === furniture.id;
    const isDragging = draggedFurniture === furniture.id;
    
    return (
      <div
        key={furniture.id}
        className={`absolute transition-shadow duration-150 ${editMode ? 'cursor-move' : ''} ${
          isSelected ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-transparent' : ''
        } ${isDragging ? 'opacity-80 scale-105' : ''} ${furniture.isLocked ? 'opacity-60' : ''}`}
        style={{
          left: furniture.x,
          top: furniture.y,
          width: furniture.width,
          height: furniture.height,
          backgroundColor: furniture.color || style.defaultColor,
          transform: `rotate(${furniture.rotation}deg)`,
          zIndex: furniture.zIndex + (isDragging ? 100 : 0),
          borderRadius: furniture.type === 'PLANT' ? '50%' : '4px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: isSelected ? '0 0 15px rgba(6,182,212,0.5)' : '0 2px 4px rgba(0,0,0,0.3)'
        }}
        onMouseDown={(e) => handleFurnitureMouseDown(e, furniture.id)}
        onClick={(e) => {
          e.stopPropagation();
          if (editMode) setSelectedFurniture(furniture.id);
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-white/70 text-[8px] font-bold select-none">
            {style.icon}
          </span>
        </div>
        {furniture.isLocked && editMode && (
          <Lock className="absolute -top-1 -right-1 w-3 h-3 text-amber-400" />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 rounded-full animate-spin border-t-cyan-500 mx-auto" />
          <p className="mt-4 text-slate-400">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-2 md:p-4" 
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-slate-900 rounded-2xl w-full max-w-7xl h-[95vh] overflow-hidden border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Grid3X3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {room.name}
                <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                  room.currentStatus === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {room.currentStatus === 'AVAILABLE' ? 'LIVE' : 'IN SESSION'}
                </span>
                {editMode && (
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-400">
                    EDIT MODE
                  </span>
                )}
              </h2>
              <p className="text-slate-400 text-xs flex items-center gap-2">
                <MapPin className="w-3 h-3" /> {room.building}
                <span className="text-cyan-400">|</span>
                <Users className="w-3 h-3" /> {room.onlineCount || 0} online
                <span className="text-cyan-400">|</span>
                Cap: {room.capacity}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <>
                <button 
                  onClick={() => setEditMode(!editMode)} 
                  className={`p-2 rounded-lg transition-colors ${editMode ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 hover:bg-white/10 text-slate-400'}`}
                  title={editMode ? 'Exit Edit Mode' : 'Edit Room Layout'}
                >
                  <Settings className="w-4 h-4" />
                </button>
                {editMode && (
                  <>
                    <button 
                      onClick={() => setShowFurniturePanel(!showFurniturePanel)} 
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      title="Add Furniture"
                    >
                      <Plus className="w-4 h-4 text-green-400" />
                    </button>
                    <button 
                      onClick={() => setShowSettings(!showSettings)} 
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      title="Room Settings"
                    >
                      <Palette className="w-4 h-4 text-purple-400" />
                    </button>
                    <button 
                      onClick={resetLayout} 
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      title="Reset Layout"
                    >
                      <RotateCcw className="w-4 h-4 text-red-400" />
                    </button>
                  </>
                )}
              </>
            )}
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button 
              onClick={() => setZoom(Math.min(2, zoom + 0.1))} 
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 text-slate-400" />
            </button>
            <button 
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} 
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 text-slate-400" />
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button 
              onClick={() => setPaused(!paused)} 
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" 
              title={paused ? 'Resume' : 'Pause'}
            >
              {paused ? <Play className="w-4 h-4 text-green-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
            </button>
            <button 
              onClick={() => setSoundOn(!soundOn)} 
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" 
              title={soundOn ? 'Mute' : 'Unmute'}
            >
              {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors" 
              title="Exit Room"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Furniture Panel (Edit Mode) */}
          {editMode && showFurniturePanel && (
            <div className="w-56 border-r border-white/10 bg-slate-800/50 flex flex-col overflow-hidden">
              <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between">
                <span className="font-medium text-white text-sm">Furniture Library</span>
                <button onClick={() => setShowFurniturePanel(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {Object.entries(
                  furnitureTemplates.reduce((acc: Record<string, any[]>, t) => {
                    const cat = t.category || 'Other';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(t);
                    return acc;
                  }, {})
                ).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 px-1">{category}</p>
                    <div className="space-y-1">
                      {items.map((template: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => addFurniture(template)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left"
                        >
                          <div 
                            className="w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold text-white/70"
                            style={{ backgroundColor: template.color }}
                          >
                            {FURNITURE_STYLES[template.type]?.icon || '?'}
                          </div>
                          <span className="text-xs text-slate-300">{template.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Room Visualization and Selected Item */}
          <div className="flex-1 p-4 flex flex-col min-w-0 overflow-hidden">
            {/* Settings Panel */}
            {editMode && showSettings && (
              <div className="mb-3 p-3 bg-slate-800/80 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-white text-sm">Room Settings</span>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {/* Wall Color */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Wall Color</p>
                    <div className="flex flex-wrap gap-1">
                      {WALL_COLORS.map(c => (
                        <button
                          key={c.color}
                          onClick={() => updateLayoutSettings({ wallColor: c.color })}
                          className={`w-6 h-6 rounded border-2 ${layout?.wallColor === c.color ? 'border-cyan-400' : 'border-transparent'}`}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Floor Color */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Floor Color</p>
                    <div className="flex flex-wrap gap-1">
                      {FLOOR_COLORS.map(c => (
                        <button
                          key={c.color}
                          onClick={() => updateLayoutSettings({ floorColor: c.color })}
                          className={`w-6 h-6 rounded border-2 ${layout?.floorColor === c.color ? 'border-cyan-400' : 'border-transparent'}`}
                          style={{ backgroundColor: c.color }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Floor Pattern */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Floor Pattern</p>
                    <div className="flex gap-1">
                      {Object.keys(FLOOR_PATTERNS).map(p => (
                        <button
                          key={p}
                          onClick={() => updateLayoutSettings({ floorPattern: p })}
                          className={`px-2 py-1 text-[10px] rounded ${layout?.floorPattern === p ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-400'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Background Sound */}
                <div className="mt-3">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Background Sound</p>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => updateLayoutSettings({ backgroundSound: null })}
                      className={`px-2 py-1 text-[10px] rounded ${!layout?.backgroundSound ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-400'}`}
                    >
                      None
                    </button>
                    {Object.entries(BACKGROUND_SOUNDS).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => updateLayoutSettings({ backgroundSound: key })}
                        className={`px-2 py-1 text-[10px] rounded ${layout?.backgroundSound === key ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-400'}`}
                      >
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>
                {saving && <p className="text-[10px] text-cyan-400 mt-2">Saving...</p>}
              </div>
            )}

            {/* Canvas */}
            <div 
              ref={canvasRef}
              className="relative flex-1 rounded-2xl border border-white/10 overflow-hidden"
              style={{
                backgroundColor: layout?.floorColor || '#0f172a',
                transform: `scale(${zoom})`,
                transformOrigin: 'center center'
              }}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onClick={() => editMode && setSelectedFurniture(null)}
            >
              {/* Floor Pattern */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: FLOOR_PATTERNS[layout?.floorPattern || 'grid'],
                  backgroundSize: layout?.floorPattern === 'dots' ? '20px 20px' : '30px 30px'
                }}
              />

              {/* Walls */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  boxShadow: `inset 0 0 0 8px ${layout?.wallColor || '#1e293b'}`,
                  borderRadius: '12px'
                }}
              />

              {/* Furniture */}
              {layout?.Furniture.map(renderFurniture)}

              {/* Virtual Users */}
              {!editMode && users.map(u => (
                <div 
                  key={u.id} 
                  className="absolute transition-all duration-500 ease-out cursor-pointer group" 
                  style={{ left: u.x, top: u.y }}
                >
                  <div 
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg ${u.isMoving ? 'animate-pulse' : ''}`}
                    style={{ backgroundColor: u.color, boxShadow: `0 0 12px ${u.color}40` }}
                  >
                    {u.avatar}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                      u.status === 'active' ? 'bg-green-500' : u.status === 'idle' ? 'bg-amber-500' : 'bg-slate-500'
                    }`} />
                  </div>
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 rounded text-[9px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {u.name}
                  </div>
                </div>
              ))}

              {/* My Character */}
              {!editMode && (
                <div className="absolute transition-all duration-150 ease-out z-10" style={{ left: myPos.x, top: myPos.y }}>
                  <div className="relative">
                    <div 
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-cyan-400/60"
                      style={{ boxShadow: '0 0 20px rgba(6,182,212,0.5)' }}
                    >
                      {userInitial}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900" />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-cyan-500 rounded text-[9px] text-white whitespace-nowrap font-semibold shadow-lg">
                      You
                    </div>
                  </div>
                </div>
              )}

              {/* Controls Hint */}
              {!editMode && (
                <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 rounded-lg text-[10px] text-slate-400 flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-mono">W A S D</kbd>
                  <span>or Arrow Keys to move</span>
                </div>
              )}

              {/* Edit Mode Hint */}
              {editMode && (
                <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-amber-500/20 rounded-lg text-[10px] text-amber-400 flex items-center gap-2">
                  <Move className="w-3 h-3" />
                  <span>Drag furniture to reposition</span>
                </div>
              )}

              {/* Room Stats */}
              <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 rounded-lg flex items-center gap-3 text-[10px] text-slate-300">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {room.capacity} max</span>
                <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-green-400" /> {(room.onlineCount || 0) + 1} here</span>
              </div>

              {/* Current Meeting Banner */}
              {room.currentMeeting && (
                <div className="absolute top-3 left-3 max-w-[250px] px-3 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                    <Activity className="w-3 h-3" /> IN SESSION
                  </p>
                  <p className="text-xs text-white truncate">{room.currentMeeting.title}</p>
                  <p className="text-[10px] text-slate-400">
                    {formatTime(room.currentMeeting.startTime)} - {formatTime(room.currentMeeting.endTime)}
                  </p>
                </div>
              )}
            </div>

            {/* Schedule Bar */}
            {room.Meetings.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {room.Meetings.map(m => (
                  <div key={m.id} className="flex-shrink-0 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs">
                    <span className="text-cyan-400 font-mono">{formatTime(m.startTime)}</span>
                    <span className="text-slate-500 mx-1">-</span>
                    <span className="text-white">{m.title}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Furniture Panel - Below Canvas */}
            {editMode && selectedFurniture && (
              <div className="mt-3 p-3 bg-slate-800/80 rounded-xl border border-white/10">
                <h4 className="font-medium text-white text-sm mb-3">Selected Item</h4>
                {(() => {
                  const furniture = layout?.Furniture.find(f => f.id === selectedFurniture);
                  if (!furniture) return null;
                  const style = FURNITURE_STYLES[furniture.type] || FURNITURE_STYLES.CUSTOM;
                  return (
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded flex items-center justify-center text-white/70 font-bold text-sm"
                          style={{ backgroundColor: furniture.color || style.defaultColor }}
                        >
                          {style.icon}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{furniture.name}</p>
                          <p className="text-[10px] text-slate-500">{style.label}</p>
                        </div>
                      </div>
                      <div className="flex-1 grid grid-cols-4 gap-2 text-[10px]">
                        <div className="bg-white/5 rounded p-2">
                          <span className="text-slate-500 block mb-1">X Position</span>
                          <span className="text-white font-mono">{Math.round(furniture.x)}</span>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                          <span className="text-slate-500 block mb-1">Y Position</span>
                          <span className="text-white font-mono">{Math.round(furniture.y)}</span>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                          <span className="text-slate-500 block mb-1">Width</span>
                          <span className="text-white font-mono">{furniture.width}</span>
                        </div>
                        <div className="bg-white/5 rounded p-2">
                          <span className="text-slate-500 block mb-1">Height</span>
                          <span className="text-white font-mono">{furniture.height}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleFurnitureLock(furniture.id)}
                          className={`flex items-center gap-1 px-3 py-2 rounded text-xs ${
                            furniture.isLocked ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-slate-400'
                          }`}
                        >
                          {furniture.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          {furniture.isLocked ? 'Locked' : 'Lock'}
                        </button>
                        <button
                          onClick={() => deleteFurniture(furniture.id)}
                          className="flex items-center gap-1 px-3 py-2 rounded bg-red-500/20 text-red-400 text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <div className="w-72 border-l border-white/10 flex flex-col bg-slate-800/50 flex-shrink-0">
            <div className="px-3 py-2.5 border-b border-white/10 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-cyan-400" />
              <span className="font-medium text-white text-sm">Room Chat</span>
              <span className="ml-auto px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full">
                {(room.onlineCount || 0) + 1} online
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
              {chatMessages.length === 0 && (
                <p className="text-[10px] text-slate-500 italic text-center py-4">
                  No messages yet. Start the conversation!
                </p>
              )}
              {chatMessages.map(msg => (
                <div key={msg.id}>
                  {msg.isSystem ? (
                    <p className="text-[10px] text-slate-500 italic text-center py-1">{msg.message}</p>
                  ) : (
                    <div className={`${msg.sender === userName ? 'ml-auto' : ''} max-w-[90%]`}>
                      <p className="text-[9px] text-slate-500 mb-0.5 flex items-center gap-1">
                        {msg.sender}
                        <span className="text-slate-600">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                      <div className={`px-3 py-1.5 rounded-xl text-sm ${
                        msg.sender === userName
                          ? 'bg-cyan-500 text-white rounded-br-sm'
                          : 'bg-white/10 text-slate-200 rounded-bl-sm'
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-2.5 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendChat(); }}
                  onFocus={() => setIsChatFocused(true)}
                  onBlur={() => setIsChatFocused(false)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button 
                  onClick={sendChat}
                  className="p-2 bg-cyan-500 hover:bg-cyan-600 rounded-xl transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
