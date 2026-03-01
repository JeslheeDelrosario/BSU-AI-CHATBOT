// client/src/pages/AITutor.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../lib/api';
import { 
  Send, Bot, User, Plus, Trash2, X, Menu, MessageSquare, MoreVertical, 
  Star, Edit2, ArrowDown, Search, AlertTriangle, Smile, Pin, PinOff,
  Palette, Bell, Clock, Sparkles, Calendar,
  CheckCircle2, XCircle, WifiOff, Copy, Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSidebar } from '../contexts/SidebarContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import QuizCard from '../components/QuizCard';
import QuizSidePanel from '../components/QuizSidePanel';
import ConsultationBookingCard from '../components/ConsultationBookingCard';
import BookingConfirmationCard from '../components/BookingConfirmationCard';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp?: string;
  quizData?: any;
  isPinned?: boolean;
  consultationData?: {
    faculty: any[];
    selectedFaculty?: any;
    existingBookings?: any[];
  };
  showConsultationBooking?: boolean;
  showBookingConfirmation?: boolean;
  pendingBooking?: {
    facultyId: string;
    facultyName: string;
    date: string;
    startTime: string;
    endTime: string;
    dayName: string;
  };
  bookingConfirmed?: boolean;
  bookingCancelled?: boolean;
  showLeaderboard?: boolean;
  leaderboardData?: Array<{
    name: string;
    metric: string;
    icon: string;
    topUsers: Array<{ rank: number; name: string; value: number; avatar: string | null }>;
  }>;
  showAchievements?: boolean;
  achievementData?: {
    earned: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      icon: string;
      points: number;
      earnedAt: string;
    }>;
    totalPoints: number;
    totalEarned: number;
    totalAvailable: number;
    nextToEarn: Array<{
      type: string;
      title: string;
      description: string;
      icon: string;
      points: number;
    }>;
  };
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string | number;
  isStarred: boolean;
}

// Common emoji set for quick reactions
const EMOJI_OPTIONS = ['👍', '👎', '❤️', '😂', '🤔', '🎉', '💡', '✅'];

// Chat background options
const BG_OPTIONS = [
  { id: 'default', label: 'Default', class: 'bg-slate-50 dark:bg-slate-950' },
  { id: 'dots', label: 'Dots', class: 'bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(circle,_rgba(6,182,212,0.05)_1px,_transparent_1px)] bg-[length:20px_20px]' },
  { id: 'grid', label: 'Grid', class: 'bg-slate-50 dark:bg-slate-950 bg-[linear-gradient(rgba(6,182,212,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.04)_1px,transparent_1px)] bg-[length:32px_32px]' },
  { id: 'gradient', label: 'Gradient', class: 'bg-gradient-to-br from-slate-50 via-cyan-50/30 to-purple-50/20 dark:from-slate-950 dark:via-cyan-950/20 dark:to-purple-950/10' },
];

// Utility function to format timestamp
const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

// Utility function to get message divider label
const getMessageDivider = (timestamp?: string, language: string = 'en') => {
  if (!timestamp) return null;
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isToday = messageDate.toDateString() === today.toDateString();
  const isYesterday = messageDate.toDateString() === yesterday.toDateString();
  
  if (isToday) return language === 'fil' ? 'Ngayon' : 'Today';
  if (isYesterday) return language === 'fil' ? 'Kahapon' : 'Yesterday';
  return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function AITutor() {
  const { settings: accessibilitySettings } = useAccessibility();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showGreeting, setShowGreeting] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentExam, setCurrentExam] = useState<any>(null);
  
  const { setSidebarOpen } = useSidebar();
  
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New feature states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatBg, setChatBg] = useState(() => localStorage.getItem('tisaChatBg') || 'default');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [systemBanner, setSystemBanner] = useState<{ message: string; type: 'info' | 'warning' | 'success' } | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);
  const [hoveredMsgIdx, setHoveredMsgIdx] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentChat = chats.find(c => c.id === currentChatId) ?? null;
  const pinnedMessages = messages.filter(m => m.isPinned);
  const currentBgClass = BG_OPTIONS.find(b => b.id === chatBg)?.class || BG_OPTIONS[0].class;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect scroll position to show/hide scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Persist chat background preference
  useEffect(() => {
    localStorage.setItem('tisaChatBg', chatBg);
  }, [chatBg]);

  // Copy message to clipboard
  const copyMessage = useCallback((content: string, idx: number) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMsgIdx(idx);
      setTimeout(() => setCopiedMsgIdx(null), 2000);
    });
  }, []);

  // Toggle pin on a message and persist to DB
  const togglePinMessage = useCallback((idx: number) => {
    setMessages(prev => {
      const updated = prev.map((m, i) => i === idx ? { ...m, isPinned: !m.isPinned } : m);
      // Persist updated messages to DB (fire-and-forget)
      if (currentChatId) {
        api.put(`/chat-sessions/${currentChatId}`, { messages: updated }).catch(console.error);
      }
      return updated;
    });
  }, [currentChatId]);

  // Get session status indicator
  const getSessionStatus = useCallback((chat: Chat): { label: string; color: string } => {
    if (!chat.messages || chat.messages.length === 0) {
      return { label: accessibilitySettings.language === 'fil' ? 'Bago' : 'New', color: 'text-emerald-500' };
    }
    const lastMsg = chat.messages[chat.messages.length - 1];
    if (lastMsg?.timestamp) {
      const hoursSince = (Date.now() - new Date(lastMsg.timestamp).getTime()) / (1000 * 60 * 60);
      if (hoursSince < 1) return { label: accessibilitySettings.language === 'fil' ? 'Aktibo' : 'Active', color: 'text-cyan-500' };
    }
    return { label: accessibilitySettings.language === 'fil' ? 'Natapos' : 'Ended', color: 'text-slate-400' };
  }, [accessibilitySettings.language]);

  // Load chats on mount — runs only once, language change does NOT reload chats
  useEffect(() => {
    const load = async () => {
      setIsLoadingChats(true);
      try {
        const res = await api.get('/chat-sessions');
        const serverChats: Chat[] = Array.isArray(res.data) ? res.data : [];
        setChats(serverChats);
        setConnectionError(false);

        if (serverChats.length > 0) {
          const firstChat = serverChats[0];
          setCurrentChatId(firstChat.id);
          setMessages(firstChat.messages ?? []);
          // If the first chat is empty, show greeting
          if (!firstChat.messages || firstChat.messages.length === 0) {
            setShowGreeting(true);
            api.get('/ai-tutor/greeting').then(r => {
              setGreeting(r.data.greeting);
              setSuggestions(r.data.suggestions || []);
            }).catch(console.error);
          } else {
            setShowGreeting(false);
          }
        } else {
          // No chats at all — show greeting for new user
          setShowGreeting(true);
          api.get('/ai-tutor/greeting').then(r => {
            setGreeting(r.data.greeting);
            setSuggestions(r.data.suggestions || []);
          }).catch(console.error);
        }
      } catch (err) {
        console.error('Failed to load chat sessions', err);
        setConnectionError(true);
        setSystemBanner({ message: 'Unable to connect to server. Please try again.', type: 'warning' });
      } finally {
        setIsLoadingChats(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startNewChat = async () => {
    try {
      // Check if current chat is already empty - don't create duplicate
      if (currentChatId && messages.length === 0) {
        // Already have an empty chat, fetch new randomized suggestions
        setShowGreeting(true);
        setChatHistoryOpen(false);
        
        // Fetch fresh randomized suggestions
        try {
          const greetingRes = await api.get('/ai-tutor/greeting');
          setGreeting(greetingRes.data.greeting);
          setSuggestions(greetingRes.data.suggestions || []);
        } catch (err) {
          console.error('Failed to fetch greeting', err);
        }
        return;
      }

      // Clear current chat and prepare for new one (don't create in DB yet)
      setCurrentChatId(null);
      setMessages([]);
      setShowGreeting(true);
      setChatHistoryOpen(false);
      
      // Fetch greeting and randomized conversation starters for new chat
      try {
        const greetingRes = await api.get('/ai-tutor/greeting');
        setGreeting(greetingRes.data.greeting);
        setSuggestions(greetingRes.data.suggestions || []);
      } catch (err) {
        console.error('Failed to fetch greeting', err);
      }
    } catch (err) {
      console.error('startNewChat error', err);
    }
  };

  const selectChat = async (chat: Chat) => {
    setCurrentChatId(chat.id);
    const chatMessages = chat.messages ?? [];
    setMessages(chatMessages);
    setChatHistoryOpen(false);
    // Show greeting with fresh suggestions when switching to an empty chat
    if (chatMessages.length === 0) {
      setShowGreeting(true);
      api.get('/ai-tutor/greeting').then(r => {
        setGreeting(r.data.greeting);
        setSuggestions(r.data.suggestions || []);
      }).catch(console.error);
    } else {
      setShowGreeting(false);
      setSuggestions([]);
    }
  };

  const deleteChat = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.delete(`/chat-sessions/${id}`);
      setChats(prev => prev.filter(c => c.id !== id));
      if (currentChatId === id) {
        const remaining = chats.filter(c => c.id !== id);
        if (remaining.length > 0) {
          selectChat(remaining[0]);
        } else {
          setCurrentChatId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('deleteChat error', err);
    }
  };

  const renameChat = async (id: string, newTitle: string) => {
    try {
      const res = await api.put(`/chat-sessions/${id}/rename`, { title: newTitle });
      const updated = res.data;

      setChats(prev =>
        prev.map(c => (c.id === id ? { ...c, title: updated.title } : c))
      );
    } catch (err) {
      console.error("renameChat error", err);
    }
  };

  const toggleStarChat = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const res = await api.put(`/chat-sessions/${id}/star`);
      const updated = res.data;

      setChats(prev =>
        prev.map(c => (c.id === id ? { ...c, isStarred: updated.isStarred } : c))
      );
      setOpenMenuId(null);
    } catch (err) {
      console.error("toggleStarChat error", err);
    }
  };

  const sendMessage = async (overrideText?: string) => {
    const messageText = overrideText !== undefined ? overrideText : input;
    if (!messageText.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: messageText, timestamp: new Date().toISOString() };
    const tempMessages = [...messages, userMsg];
    setMessages(tempMessages);
    if (overrideText === undefined) setInput('');
    setLoading(true);

    try {
      const tempTitle = accessibilitySettings.language === 'fil' ? 'Bagong Chat' : 'New Chat';
      let chatId = currentChatId;
      let isNewChat = false;
      let existingTitle = currentChat?.title || '';

      if (!chatId) {
        isNewChat = true;
        const createRes = await api.post('/chat-sessions', { title: tempTitle, messages: tempMessages });
        chatId = createRes.data.id;
        existingTitle = tempTitle;
        setCurrentChatId(chatId);
        setChats(prev => [createRes.data, ...prev]);
      } else {
        existingTitle = currentChat?.title || tempTitle;
        await api.put(`/chat-sessions/${chatId}`, { title: existingTitle, messages: tempMessages });
        setChats(prev =>
          prev
            .map(c => (c.id === chatId ? { ...c, messages: tempMessages, updatedAt: Date.now() } : c))
            .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt))
        );
      }

      const res = await api.post('/ai-tutor/ask', { 
        message: userMsg.content, 
        type: 'QUESTION',
        chatSessionId: chatId 
      });

      // Resolve title: always prefer AI-generated title, especially for new chats
      // For existing chats, only update if the current title is still the temp title
      const generatedTitle = res.data?.generatedTitle;
      let finalTitle = existingTitle;
      if (generatedTitle) {
        finalTitle = generatedTitle;
      } else if (isNewChat || existingTitle === tempTitle || existingTitle === 'New Chat' || existingTitle === 'Bagong Chat') {
        // Backend didn't return a title — use a fallback from the user message (Title Case)
        const words = userMsg.content.replace(/[^\w\s]/gi, '').trim().split(/\s+/).filter(w => w.length > 2).slice(0, 5);
        finalTitle = words.length > 0
          ? words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
          : tempTitle;
        if (finalTitle.length > 50) finalTitle = finalTitle.substring(0, 47) + '...';
      }
      
      // Check if AI wants to generate a quiz
      if (res.data?.generateQuiz && res.data?.quiz) {
        console.log('[Quiz] Quiz generated by backend:', res.data.quiz);
        
        const exam = {
          id: res.data.quiz.id,
          title: res.data.quiz.title,
          description: res.data.quiz.description,
          subject: res.data.quizParams?.topic || 'General',
          difficulty: 'Mixed',
          totalQuestions: res.data.quiz.totalQuestions,
          estimatedTime: res.data.quiz.estimatedTime,
          questions: res.data.quiz.questions,
          createdAt: res.data.quiz.createdAt
        };
        
        const aiMsg: Message = { 
          role: 'ai', 
          content: `__QUIZ_CARD__${exam.id}__${res.data.response}`,
          timestamp: new Date().toISOString(),
          quizData: exam
        };
        const finalMessages = [...tempMessages, aiMsg];
        setMessages(finalMessages);
        
        if (chatId) {
          await api.put(`/chat-sessions/${chatId}`, { title: finalTitle, messages: finalMessages });
          setChats(prev => {
            const updated = prev.map(c => (c.id === chatId ? { ...c, messages: finalMessages, title: finalTitle, updatedAt: Date.now() } : c));
            return [...updated].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
          });
        }
        
        setLoading(false);
        return;
      }

      // Check if AI response includes booking confirmation (direct booking with date + time)
      console.log('[BookingConfirmation] Response data:', { 
        showBookingConfirmation: res.data?.showBookingConfirmation, 
        pendingBooking: res.data?.pendingBooking 
      });
      if (res.data?.showBookingConfirmation && res.data?.pendingBooking) {
        console.log('[BookingConfirmation] Creating message with booking confirmation');
        const aiMsg: Message = { 
          role: 'ai', 
          content: res.data.response,
          timestamp: new Date().toISOString(),
          showBookingConfirmation: true,
          pendingBooking: res.data.pendingBooking,
          consultationData: res.data.consultationData
        };
        const finalMessages = [...tempMessages, aiMsg];
        setMessages(finalMessages);
        
        if (res.data?.suggestions) {
          setSuggestions(res.data.suggestions);
        }
        setShowGreeting(false);
        
        if (chatId) {
          await api.put(`/chat-sessions/${chatId}`, { title: finalTitle, messages: finalMessages });
          setChats(prev => {
            const updated = prev.map(c => (c.id === chatId ? { ...c, messages: finalMessages, title: finalTitle, updatedAt: Date.now() } : c));
            return [...updated].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
          });
        }
        
        setLoading(false);
        return;
      }

      // Check if AI response includes consultation booking UI
      if (res.data?.showConsultationBooking && res.data?.consultationData) {
        const aiMsg: Message = { 
          role: 'ai', 
          content: res.data.response,
          timestamp: new Date().toISOString(),
          showConsultationBooking: true,
          consultationData: res.data.consultationData
        };
        const finalMessages = [...tempMessages, aiMsg];
        setMessages(finalMessages);
        
        if (res.data?.suggestions) {
          setSuggestions(res.data.suggestions);
        }
        setShowGreeting(false);
        
        if (chatId) {
          await api.put(`/chat-sessions/${chatId}`, { title: finalTitle, messages: finalMessages });
          setChats(prev => {
            const updated = prev.map(c => (c.id === chatId ? { ...c, messages: finalMessages, title: finalTitle, updatedAt: Date.now() } : c));
            return [...updated].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
          });
        }
        
        setLoading(false);
        return;
      }

      // Check if AI response includes leaderboard UI
      if (res.data?.showLeaderboard && res.data?.leaderboardData) {
        const aiMsg: Message = { 
          role: 'ai', 
          content: res.data.response,
          timestamp: new Date().toISOString(),
          showLeaderboard: true,
          leaderboardData: res.data.leaderboardData
        };
        const finalMessages = [...tempMessages, aiMsg];
        setMessages(finalMessages);
        
        if (res.data?.suggestions) {
          setSuggestions(res.data.suggestions);
        }
        setShowGreeting(false);
        
        if (chatId) {
          await api.put(`/chat-sessions/${chatId}`, { title: finalTitle, messages: finalMessages });
          setChats(prev => {
            const updated = prev.map(c => (c.id === chatId ? { ...c, messages: finalMessages, title: finalTitle, updatedAt: Date.now() } : c));
            return [...updated].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
          });
        }
        
        setLoading(false);
        return;
      }

      // Check if AI response includes achievements UI
      if (res.data?.showAchievements && res.data?.achievementData) {
        const aiMsg: Message = { 
          role: 'ai', 
          content: res.data.response,
          timestamp: new Date().toISOString(),
          showAchievements: true,
          achievementData: res.data.achievementData
        };
        const finalMessages = [...tempMessages, aiMsg];
        setMessages(finalMessages);
        
        if (res.data?.suggestions) {
          setSuggestions(res.data.suggestions);
        }
        setShowGreeting(false);
        
        if (chatId) {
          await api.put(`/chat-sessions/${chatId}`, { title: finalTitle, messages: finalMessages });
          setChats(prev => {
            const updated = prev.map(c => (c.id === chatId ? { ...c, messages: finalMessages, title: finalTitle, updatedAt: Date.now() } : c));
            return [...updated].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
          });
        }
        
        setLoading(false);
        return;
      }
      
      const aiText = res.data?.response ?? '*No response*';
      const aiMsg: Message = { role: 'ai', content: aiText, timestamp: new Date().toISOString() };
      const finalMessages = [...tempMessages, aiMsg];
      
      if (res.data?.suggestions) {
        setSuggestions(res.data.suggestions);
      }
      setShowGreeting(false);

      setMessages(finalMessages);

      if (chatId) {
        await api.put(`/chat-sessions/${chatId}`, { title: finalTitle, messages: finalMessages });
        setChats(prev => {
          const updated = prev.map(c => (c.id === chatId ? { ...c, messages: finalMessages, title: finalTitle, updatedAt: Date.now() } : c));
          return [...updated].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
        });
      }
    } catch (err: any) {
      console.error('sendMessage error', err);
      const isNetwork = !err?.response;
      setConnectionError(isNetwork);
      const errorContent = isNetwork
        ? (accessibilitySettings.language === 'fil' ? '__ERROR__NETWORK__Hindi makakonekta sa server. Suriin ang iyong internet connection.' : '__ERROR__NETWORK__Unable to connect to server. Check your internet connection.')
        : (accessibilitySettings.language === 'fil' ? '__ERROR__SERVER__Paumanhin, may naganap na error. Pakisubukan muli.' : '__ERROR__SERVER__Sorry, I encountered an error. Please try again.');
      const errorMsg: Message = { role: 'ai', content: errorContent, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    // Allow Shift+Enter for new lines in textarea
  };

  const renderChatItem = (chat: Chat) => {
    const status = getSessionStatus(chat);
    return (
      <div
        key={chat.id}
        onClick={() => selectChat(chat)}
        className={`p-3 rounded-xl cursor-pointer transition-all group relative
          ${chat.id === currentChatId
            ? 'bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border border-cyan-500/30 dark:border-cyan-500/40 shadow-sm'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
          }`}
      >
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <MessageSquare className={`w-4 h-4 flex-shrink-0 ${chat.id === currentChatId ? 'text-cyan-500' : 'text-slate-400'}`} />
            <div className="flex-1 min-w-0">
              {editingChatId === chat.id ? (
                <input
                  type="text"
                  value={tempTitle}
                  autoFocus
                  onChange={(e) => setTempTitle(e.target.value)}
                  onBlur={async () => {
                    if (tempTitle.trim().length > 0) await renameChat(chat.id, tempTitle.trim());
                    setEditingChatId(null);
                    setTempTitle('');
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                    if (e.key === 'Escape') { setEditingChatId(null); setTempTitle(''); }
                  }}
                  className="w-full bg-white dark:bg-slate-950 border border-cyan-500 rounded-lg px-2 py-1 text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={chat.title}>
                    {chat.isStarred && <Star className="w-3 h-3 inline-block mr-1 fill-yellow-400 text-yellow-400 -mt-0.5" />}
                    {chat.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-medium ${status.color}`}>{status.label}</span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-400">{chat.messages?.length || 0} msgs</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === chat.id ? null : chat.id); }}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
              title={accessibilitySettings.language === 'fil' ? 'Mga pagpipilian' : 'Options'}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {openMenuId === chat.id && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }} />
                <div className="absolute right-0 top-8 z-50 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1">
                  <button onClick={(e) => toggleStarChat(chat.id, e)} className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5">
                    <Star className={`w-4 h-4 ${chat.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    {chat.isStarred ? (accessibilitySettings.language === 'fil' ? 'Alisin sa star' : 'Unstar') : (accessibilitySettings.language === 'fil' ? 'I-star' : 'Star')}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setEditingChatId(chat.id); setTempTitle(chat.title); }} className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5">
                    <Edit2 className="w-4 h-4" />
                    {accessibilitySettings.language === 'fil' ? 'Palitan ang pangalan' : 'Rename'}
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                  <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setShowDeleteConfirm(chat.id); }} className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2.5">
                    <Trash2 className="w-4 h-4" />
                    {accessibilitySettings.language === 'fil' ? 'Tanggalin' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      
      {/* Quiz Side Panel - appears on RIGHTMOST position (after main chat area) */}
      {showQuiz && currentExam && (
        <div 
          className="hidden lg:flex w-[320px] flex-shrink-0 border-l border-slate-700 bg-slate-900 z-30 order-last relative"
        >
          {/* Resize handle on LEFT edge */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-2 bg-transparent hover:bg-cyan-500/30 cursor-col-resize transition-colors z-10 group"
            onMouseDown={(e) => {
              e.preventDefault();
              const panel = e.currentTarget.parentElement;
              if (!panel) return;
              const startX = e.clientX;
              const startWidth = panel.offsetWidth;
              
              const onMouseMove = (moveEvent: MouseEvent) => {
                const diff = startX - moveEvent.clientX;
                const newWidth = Math.min(Math.max(startWidth + diff, 280), 500);
                panel.style.width = `${newWidth}px`;
              };
              
              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };
              
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <QuizSidePanel
            exam={currentExam}
            onClose={() => {
              setShowQuiz(false);
              setCurrentExam(null);
            }}
            onComplete={(results) => {
              setShowQuiz(false);
              setCurrentExam(null);
              const lang = accessibilitySettings.language;
              const completionMsg: Message = {
                role: 'ai',
                content: lang === 'fil'
                  ? `🎉 Natapos mo ang quiz! Nakakuha ka ng **${results.score}%** (${results.correctCount}/${results.totalQuestions} tama). ${results.score >= 70 ? 'Pumasa ka!' : 'Subukan muli para mas mapabuti!'}`
                  : `🎉 Quiz completed! You scored **${results.score}%** (${results.correctCount}/${results.totalQuestions} correct). ${results.score >= 70 ? 'You passed!' : 'Try again to improve!'}`,
                timestamp: new Date().toISOString()
              };
              // Use functional updater to avoid stale closure over messages
              setMessages(prev => {
                const updated = [...prev, completionMsg];
                if (currentChatId) {
                  api.put(`/chat-sessions/${currentChatId}`, { messages: updated }).catch(console.error);
                }
                return updated;
              });
            }}
          />
        </div>
      )}

      {/* Mobile Quiz Modal - for smaller screens */}
      {showQuiz && currentExam && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900">
          <QuizSidePanel
            exam={currentExam}
            onClose={() => {
              setShowQuiz(false);
              setCurrentExam(null);
            }}
            onComplete={(results) => {
              setShowQuiz(false);
              setCurrentExam(null);
              const lang = accessibilitySettings.language;
              const completionMsg: Message = {
                role: 'ai',
                content: lang === 'fil'
                  ? `🎉 Natapos mo ang quiz! Nakakuha ka ng **${results.score}%** (${results.correctCount}/${results.totalQuestions} tama). ${results.score >= 70 ? 'Pumasa ka!' : 'Subukan muli para mas mapabuti!'}`
                  : `🎉 Quiz completed! You scored **${results.score}%** (${results.correctCount}/${results.totalQuestions} correct). ${results.score >= 70 ? 'You passed!' : 'Try again to improve!'}`,
                timestamp: new Date().toISOString()
              };
              // Use functional updater to avoid stale closure over messages
              setMessages(prev => {
                const updated = [...prev, completionMsg];
                if (currentChatId) {
                  api.put(`/chat-sessions/${currentChatId}`, { messages: updated }).catch(console.error);
                }
                return updated;
              });
            }}
          />
        </div>
      )}

      <style>{`
        .scrollbar-cyberpunk::-webkit-scrollbar { width: 6px; }
        .scrollbar-cyberpunk::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-cyberpunk::-webkit-scrollbar-thumb { 
          background: linear-gradient(180deg, #06b6d4, #a855f7); 
          border-radius: 3px; 
        }
        .scrollbar-cyberpunk::-webkit-scrollbar-thumb:hover { 
          background: linear-gradient(180deg, #0891b2, #9333ea); 
        }
        @keyframes bounce-delay-100 {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @keyframes bounce-delay-200 {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .animate-bounce-delay-100 {
          animation: bounce-delay-100 1.4s infinite ease-in-out;
          animation-delay: 0.16s;
        }
        .animate-bounce-delay-200 {
          animation: bounce-delay-200 1.4s infinite ease-in-out;
          animation-delay: 0.32s;
        }
      `}</style>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {accessibilitySettings.language === 'fil' ? 'Tanggalin ang Chat?' : 'Delete Chat?'}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {accessibilitySettings.language === 'fil' ? 'Hindi na ito maibabalik. Sigurado ka ba?' : 'This action cannot be undone. Are you sure?'}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                {accessibilitySettings.language === 'fil' ? 'Kanselahin' : 'Cancel'}
              </button>
              <button onClick={() => { deleteChat(showDeleteConfirm); setShowDeleteConfirm(null); }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg">
                {accessibilitySettings.language === 'fil' ? 'Tanggalin' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Chat Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {accessibilitySettings.language === 'fil' ? 'I-clear ang Chat?' : 'Clear Chat?'}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {accessibilitySettings.language === 'fil' ? 'Mababura ang lahat ng mensahe sa chat na ito.' : 'All messages in this chat will be removed.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                {accessibilitySettings.language === 'fil' ? 'Kanselahin' : 'Cancel'}
              </button>
              <button onClick={() => { setMessages([]); setShowClearConfirm(false); if (currentChatId) api.put(`/chat-sessions/${currentChatId}`, { messages: [] }).catch(console.error); }} className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors shadow-lg">
                {accessibilitySettings.language === 'fil' ? 'I-clear' : 'Clear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay for Chat History */}
      {chatHistoryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setChatHistoryOpen(false)} />
      )}

      {/* ===== REDESIGNED SIDEBAR (LEFT SIDE) ===== */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-slate-900 border-r border-slate-800
        shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
        ${chatHistoryOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* TISA Branding Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                TISA
              </span>
            </div>
            <button 
              onClick={() => setChatHistoryOpen(false)} 
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={accessibilitySettings.language === 'fil' ? 'Isara' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            title={accessibilitySettings.language === 'fil' ? 'Gumawa ng bagong chat' : 'Start a new conversation'}
          >
            <Plus className="w-4 h-4" />
            {accessibilitySettings.language === 'fil' ? 'Bagong Chat' : 'New Chat'}
          </button>

          {/* Search Bar */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={accessibilitySettings.language === 'fil' ? 'Maghanap ng chat...' : 'Search chats...'}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="Clear search">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-cyberpunk p-2 space-y-1">
          {isLoadingChats ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-2.5 p-3 rounded-xl">
                  <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (() => {
            const filteredChats = searchQuery.trim()
              ? chats.filter(chat => 
                  chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  chat.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
                )
              : chats;

            return filteredChats.length === 0 ? (
              <div className="text-center mt-12 px-4">
                <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {searchQuery.trim() 
                    ? (accessibilitySettings.language === 'fil' ? 'Walang nahanap' : 'No results found')
                    : (accessibilitySettings.language === 'fil' ? 'Wala pang mga chat' : 'No chats yet')
                  }
                </p>
                {!searchQuery.trim() && (
                  <p className="text-xs text-slate-400 mt-1">{accessibilitySettings.language === 'fil' ? 'Magsimula ng bagong usapan' : 'Start a new conversation'}</p>
                )}
              </div>
            ) : (
              <>
                {filteredChats.filter(c => c.isStarred).length > 0 && (
                  <>
                    <div className="px-3 py-2">
                      <h3 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {accessibilitySettings.language === 'fil' ? 'Naka-star' : 'Starred'}
                      </h3>
                    </div>
                    {filteredChats.filter(c => c.isStarred).map(chat => renderChatItem(chat))}
                  </>
                )}
                {filteredChats.filter(c => !c.isStarred).length > 0 && (
                  <>
                    <div className="px-3 py-2 mt-2">
                      <h3 className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {accessibilitySettings.language === 'fil' ? 'Kamakailan' : 'Recents'}
                      </h3>
                    </div>
                    {filteredChats.filter(c => !c.isStarred).map(chat => renderChatItem(chat))}
                  </>
                )}
              </>
            );
          })()}
        </div>
      </aside>

      {/* ===== MAIN CHAT AREA ===== */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-900 dark:text-white" title={accessibilitySettings.language === 'fil' ? 'Buksan ang menu' : 'Open menu'}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-48">
            {currentChat?.title || 'TISA AI Tutor'}
          </h1>
          <button onClick={() => setChatHistoryOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-900 dark:text-white" title={accessibilitySettings.language === 'fil' ? 'Kasaysayan ng chat' : 'Chat history'}>
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>

        {/* Desktop Conversation Header Bar */}
        <div className="hidden lg:flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex-shrink-0 relative z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white">{currentChat?.title || 'TISA AI Tutor'}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {loading 
                  ? (accessibilitySettings.language === 'fil' ? 'Nagta-type...' : 'Typing...') 
                  : (accessibilitySettings.language === 'fil' ? 'Online · Handa na tumulong' : 'Online · Ready to help')
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Background Customization */}
            <div className="relative">
              <button onClick={() => setShowBgPicker(!showBgPicker)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title={accessibilitySettings.language === 'fil' ? 'Baguhin ang background' : 'Change background'}>
                <Palette className="w-4 h-4" />
              </button>
              {showBgPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowBgPicker(false)} />
                  <div className="absolute right-0 top-10 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 w-44">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Background</p>
                    <div className="grid grid-cols-2 gap-2">
                      {BG_OPTIONS.map(bg => (
                        <button key={bg.id} onClick={() => { setChatBg(bg.id); setShowBgPicker(false); }} className={`px-3 py-2 text-xs rounded-lg border transition-all ${chatBg === bg.id ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 font-medium' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300'}`}>
                          {bg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            {messages.length > 0 && (
              <button onClick={() => setShowClearConfirm(true)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title={accessibilitySettings.language === 'fil' ? 'I-clear ang chat' : 'Clear chat'}>
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* System Notification Banner */}
        {systemBanner && (
          <div className={`flex-shrink-0 px-4 py-2.5 flex items-center justify-between gap-3 text-sm ${
            systemBanner.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-b border-amber-200 dark:border-amber-800' :
            systemBanner.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-b border-emerald-200 dark:border-emerald-800' :
            'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-b border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-center gap-2">
              {systemBanner.type === 'warning' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : systemBanner.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <Bell className="w-4 h-4 flex-shrink-0" />}
              <span>{systemBanner.message}</span>
            </div>
            <button onClick={() => setSystemBanner(null)} className="p-0.5 hover:opacity-70 transition-opacity flex-shrink-0" title={accessibilitySettings.language === 'fil' ? 'I-dismiss' : 'Dismiss'}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Pinned Messages Area */}
        {pinnedMessages.length > 0 && (
          <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-900/10 px-4 py-2">
            <div className="max-w-3xl mx-auto flex items-center gap-2">
              <Pin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200 truncate">{pinnedMessages[pinnedMessages.length - 1].content.substring(0, 100)}{pinnedMessages[pinnedMessages.length - 1].content.length > 100 ? '...' : ''}</p>
              <span className="text-[10px] text-amber-500 flex-shrink-0">({pinnedMessages.length})</span>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto scrollbar-cyberpunk pt-16 lg:pt-0 relative ${currentBgClass}`}>
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center mt-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-full mb-6 shadow-xl border border-cyan-500/30">
                  <Bot className="w-12 h-12 text-cyan-400" />
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-3">
                  TISA AI Tutor
                </h2>
                <p className="text-base text-slate-600 dark:text-slate-400">
                  {accessibilitySettings.language === 'fil' 
                    ? 'Ang iyong Student Assistant. Magtanong tungkol sa College of Science.'
                    : 'Your Student Assistant. Ask anything about College of Science.'}
                </p>
                
                {/* Connection Error State */}
                {connectionError && (
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                    <WifiOff className="w-4 h-4" />
                    {accessibilitySettings.language === 'fil' ? 'Hindi makakonekta sa server' : 'Unable to connect to server'}
                    <button onClick={() => window.location.reload()} className="ml-2 px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/40 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors" title="Retry">
                      Retry
                    </button>
                  </div>
                )}
                
                {/* Greeting Message */}
                {showGreeting && greeting && (
                  <div className="mt-8 max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-left">
                        <div className="text-slate-900 dark:text-slate-100 whitespace-pre-line">
                          {greeting.split('**').map((part, i) => 
                            i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Smart Suggestions Bubbles */}
                {suggestions.length > 0 && (
                  <div className="mt-6 max-w-2xl mx-auto">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
                      {accessibilitySettings.language === 'fil' ? 'Mga mungkahing tanong:' : 'Suggested questions:'}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInput('');
                            sendMessage(suggestion);
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 hover:from-cyan-500/20 hover:to-purple-600/20 border border-cyan-500/30 dark:border-cyan-500/40 rounded-full text-sm text-slate-900 dark:text-slate-100 transition-all hover:scale-105 shadow-sm hover:shadow-md"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {messages.map((msg, i) => {
                  const showDivider = i === 0 || 
                    (msg.timestamp && messages[i-1]?.timestamp && 
                     getMessageDivider(msg.timestamp, accessibilitySettings.language) !== 
                     getMessageDivider(messages[i-1].timestamp, accessibilitySettings.language));
                  const dividerLabel = showDivider ? getMessageDivider(msg.timestamp, accessibilitySettings.language) : null;
                  const isError = msg.content.startsWith('__ERROR__');
                  
                  return (
                    <div key={i}>
                      {dividerLabel && (
                        <div className="flex items-center justify-center my-6">
                          <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
                          <span className="px-4 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-full">{dividerLabel}</span>
                          <div className="flex-1 border-t border-slate-200 dark:border-slate-700"></div>
                        </div>
                      )}
                      
                      {/* Error/Status Message UI */}
                      {isError ? (
                        <div className="flex justify-center my-4">
                          <div className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm shadow-sm ${
                            msg.content.includes('NETWORK') 
                              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                              : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                          }`}>
                            {msg.content.includes('NETWORK') ? <WifiOff className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                            <span>{msg.content.split('__').pop()}</span>
                            <button onClick={() => setMessages(prev => prev.filter((_, idx) => idx !== i))} className="p-0.5 hover:opacity-70" title={accessibilitySettings.language === 'fil' ? 'I-dismiss' : 'Dismiss'}>
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                      <div 
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} group/msg`}
                        onMouseEnter={() => setHoveredMsgIdx(i)}
                        onMouseLeave={() => setHoveredMsgIdx(null)}
                      >
                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-lg
                          ${msg.role === 'ai' ? 'bg-gradient-to-br from-cyan-500 to-purple-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'}`}
                        >
                          {msg.role === 'ai' ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                        </div>

                        <div className={`flex-1 min-w-0 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                          {msg.role === 'ai' && msg.content.startsWith('__QUIZ_CARD__') ? (
                            <div className="space-y-3">
                              {(() => {
                                const parts = msg.content.split('__');
                                const responseText = parts.slice(3).join('__');
                                const exam = msg.quizData;
                                return (
                                  <>
                                    {responseText && (
                                      <div className="inline-block max-w-full px-4 py-3 rounded-2xl shadow-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{responseText}</ReactMarkdown>
                                        </div>
                                      </div>
                                    )}
                                    {exam && <QuizCard exam={exam} onClick={() => { setCurrentExam(exam); setShowQuiz(true); }} />}
                                  </>
                                );
                              })()}
                            </div>
                          ) : msg.role === 'ai' && msg.content.startsWith('__BOOKING_CONFIRMED__') ? (
                            // Confirmed booking - render success state
                            (() => {
                              const parts = msg.content.split('__');
                              // Format: __BOOKING_CONFIRMED__facultyName__date__startTime__endTime__dayName__
                              const facultyName = parts[2] || 'Faculty';
                              const date = parts[3] || '';
                              const startTime = parts[4] || '';
                              const endTime = parts[5] || '';
                              const dayName = parts[6] || '';
                              
                              const formatTime12h = (time: string) => {
                                if (!time) return '';
                                const [h, m] = time.split(':').map(Number);
                                const ampm = h >= 12 ? 'PM' : 'AM';
                                const hour = h % 12 || 12;
                                return `${hour}:${m?.toString().padStart(2, '0') || '00'} ${ampm}`;
                              };
                              
                              const formatDate = (dateStr: string) => {
                                if (!dateStr) return '';
                                const d = new Date(dateStr);
                                return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
                              };
                              
                              return (
                                <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-2xl p-5 max-w-md">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                      <CheckCircle2 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-green-800 dark:text-green-200">Booking Confirmed!</h4>
                                      <p className="text-sm text-green-600 dark:text-green-300">Consultation with {facultyName}</p>
                                    </div>
                                  </div>
                                  <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                    <p className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      {formatDate(date)} {dayName && `(${dayName})`}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      {formatTime12h(startTime)} - {formatTime12h(endTime)}
                                    </p>
                                  </div>
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-3">
                                    Please wait for confirmation from the faculty.
                                  </p>
                                </div>
                              );
                            })()
                          ) : msg.role === 'ai' && msg.content.startsWith('__BOOKING_CANCELLED__') ? (
                            // Cancelled booking - render cancelled state
                            (() => {
                              const parts = msg.content.split('__');
                              const facultyName = parts[2] || 'Faculty';
                              
                              return (
                                <div className="mt-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 max-w-md">
                                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <XCircle className="w-5 h-5" />
                                    <span className="text-sm">Booking with {facultyName} cancelled</span>
                                  </div>
                                </div>
                              );
                            })()
                          ) : msg.role === 'ai' && (msg.showBookingConfirmation || msg.content.startsWith('__BOOKING_CONFIRM__')) ? (
                            <div className="space-y-3 max-w-lg">
                              <BookingConfirmationCard 
                                pendingBooking={(() => {
                                  // Parse pendingBooking from content marker if not in message object
                                  if (msg.pendingBooking) return msg.pendingBooking;
                                  
                                  if (msg.content.startsWith('__BOOKING_CONFIRM__')) {
                                    const parts = msg.content.split('__');
                                    // Format: __BOOKING_CONFIRM__facultyId__date__startTime__endTime__facultyName__dayName__content
                                    // parts[0]="" parts[1]="BOOKING_CONFIRM" parts[2]=facultyId etc.
                                    if (parts.length >= 8) {
                                      return {
                                        facultyId: parts[2],
                                        date: parts[3],
                                        startTime: parts[4],
                                        endTime: parts[5],
                                        facultyName: parts[6],
                                        dayName: parts[7]
                                      };
                                    }
                                  }
                                  // Fallback
                                  return {
                                    facultyId: '',
                                    date: '',
                                    startTime: '',
                                    endTime: '',
                                    facultyName: 'Unknown',
                                    dayName: ''
                                  };
                                })()}
                                language={accessibilitySettings.language}
                                isConfirmed={msg.bookingConfirmed}
                                isCancelled={msg.bookingCancelled}
                                onConfirm={() => {
                                  const msgIndex = messages.indexOf(msg);
                                  // Parse booking data for success message
                                  let facultyName = msg.pendingBooking?.facultyName || 'Faculty';
                                  let date = msg.pendingBooking?.date || '';
                                  let startTime = msg.pendingBooking?.startTime || '';
                                  let endTime = msg.pendingBooking?.endTime || '';
                                  let dayName = msg.pendingBooking?.dayName || '';
                                  
                                  if (msg.content.startsWith('__BOOKING_CONFIRM__')) {
                                    const parts = msg.content.split('__');
                                    if (parts.length >= 8) {
                                      facultyName = parts[6];
                                      date = parts[3];
                                      startTime = parts[4];
                                      endTime = parts[5];
                                      dayName = parts[7];
                                    }
                                  }
                                  
                                  // Update message content to use CONFIRMED marker (persists to DB)
                                  const confirmedContent = `__BOOKING_CONFIRMED__${facultyName}__${date}__${startTime}__${endTime}__${dayName}__`;
                                  const updatedMessages = messages.map((m, mi) => 
                                    mi === msgIndex ? { ...m, content: confirmedContent, bookingConfirmed: true } : m
                                  );
                                  setMessages(updatedMessages);
                                  
                                  // Persist to database
                                  if (currentChatId) {
                                    api.put(`/chat-sessions/${currentChatId}`, { messages: updatedMessages }).catch(console.error);
                                  }
                                }}
                                onCancel={() => {
                                  const msgIndex = messages.indexOf(msg);
                                  // Parse booking data
                                  let facultyName = msg.pendingBooking?.facultyName || 'Faculty';
                                  if (msg.content.startsWith('__BOOKING_CONFIRM__')) {
                                    const parts = msg.content.split('__');
                                    if (parts.length >= 7) facultyName = parts[6];
                                  }
                                  
                                  // Update message content to use CANCELLED marker (persists to DB)
                                  const cancelledContent = `__BOOKING_CANCELLED__${facultyName}__`;
                                  const updatedMessages = messages.map((m, mi) => 
                                    mi === msgIndex ? { ...m, content: cancelledContent, bookingCancelled: true } : m
                                  );
                                  setMessages(updatedMessages);
                                  
                                  // Persist to database
                                  if (currentChatId) {
                                    api.put(`/chat-sessions/${currentChatId}`, { messages: updatedMessages }).catch(console.error);
                                  }
                                }}
                              />
                            </div>
                          ) : msg.role === 'ai' && msg.showConsultationBooking && msg.consultationData ? (
                            <div className="space-y-3 max-w-lg">
                              <div className="inline-block max-w-full px-4 py-3 rounded-2xl shadow-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <div className="prose prose-sm dark:prose-invert max-w-none
                                  [&>p]:text-slate-900 dark:[&>p]:text-slate-100 [&>p]:leading-relaxed
                                  [&>strong]:text-slate-900 dark:[&>strong]:text-white [&>strong]:font-semibold
                                  [&>ul]:text-slate-900 dark:[&>ul]:text-slate-100
                                ">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                </div>
                                {msg.timestamp && (
                                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTimestamp(msg.timestamp)}
                                  </div>
                                )}
                              </div>
                              <ConsultationBookingCard 
                                faculty={msg.consultationData.faculty}
                                selectedFaculty={msg.consultationData.selectedFaculty}
                                language={accessibilitySettings.language}
                              />
                            </div>
                          ) : msg.role === 'ai' && msg.showLeaderboard && msg.leaderboardData ? (
                            <div className="space-y-3 max-w-xl">
                              <div className="inline-block max-w-full px-4 py-3 rounded-2xl shadow-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                </div>
                              </div>
                              {/* Leaderboard Cards */}
                              <div className="grid gap-3">
                                {msg.leaderboardData.map((board, idx) => (
                                  <div key={idx} className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/30 rounded-xl p-4 shadow-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className="text-2xl">{board.icon}</span>
                                      <h4 className="font-bold text-slate-900 dark:text-white">{board.name}</h4>
                                    </div>
                                    <div className="space-y-2">
                                      {board.topUsers.slice(0, 5).map((user, uidx) => (
                                        <div key={uidx} className="flex items-center gap-3 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                          <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                            user.rank === 1 ? 'bg-amber-400 text-amber-900' :
                                            user.rank === 2 ? 'bg-slate-300 text-slate-700' :
                                            user.rank === 3 ? 'bg-orange-400 text-orange-900' :
                                            'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                          }`}>
                                            {user.rank}
                                          </span>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                                          </div>
                                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{user.value} pts</span>
                                        </div>
                                      ))}
                                    </div>
                                    <a href="/leaderboard" className="mt-3 inline-flex items-center gap-1 text-sm text-cyan-600 dark:text-cyan-400 hover:underline">
                                      View full leaderboard →
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : msg.role === 'ai' && msg.showAchievements && msg.achievementData ? (
                            <div className="space-y-3 max-w-xl">
                              <div className="inline-block max-w-full px-4 py-3 rounded-2xl shadow-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                </div>
                              </div>
                              {/* Achievement Cards */}
                              <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/30 rounded-xl p-4 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="text-2xl">🎖️</span> Your Achievements
                                  </h4>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{msg.achievementData.totalPoints}</p>
                                    <p className="text-xs text-slate-500">Total Points</p>
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600 dark:text-slate-400">Progress</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{msg.achievementData.totalEarned}/{msg.achievementData.totalAvailable}</span>
                                  </div>
                                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                      style={{ width: `${(msg.achievementData.totalEarned / msg.achievementData.totalAvailable) * 100}%` }}
                                    />
                                  </div>
                                </div>
                                {msg.achievementData.earned.length > 0 && (
                                  <div className="space-y-2 mb-3">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Recent Achievements</p>
                                    {msg.achievementData.earned.slice(0, 3).map((ach, aidx) => (
                                      <div key={aidx} className="flex items-center gap-3 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                                        <span className="text-2xl">{ach.icon}</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-slate-900 dark:text-white">{ach.title}</p>
                                          <p className="text-xs text-slate-500 truncate">{ach.description}</p>
                                        </div>
                                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">+{ach.points}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {msg.achievementData.nextToEarn.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Next to Earn</p>
                                    {msg.achievementData.nextToEarn.slice(0, 2).map((ach, aidx) => (
                                      <div key={aidx} className="flex items-center gap-3 p-2 bg-slate-100/50 dark:bg-slate-900/50 rounded-lg opacity-70">
                                        <span className="text-2xl grayscale">{ach.icon}</span>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-slate-700 dark:text-slate-300">{ach.title}</p>
                                          <p className="text-xs text-slate-500 truncate">{ach.description}</p>
                                        </div>
                                        <span className="text-sm text-slate-400">+{ach.points}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <a href="/achievements" className="mt-3 inline-flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:underline">
                                  View all achievements →
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="relative inline-block max-w-full">
                              <div className={`px-4 py-3 rounded-2xl shadow-md ${msg.isPinned ? 'ring-2 ring-amber-400/50' : ''}
                                ${msg.role === 'ai'
                                  ? 'bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'
                                  : 'bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border border-cyan-500/20 dark:border-cyan-500/30'
                                }`}
                              >
                                {msg.role === 'ai' ? (
                                  <div className="prose prose-sm lg:prose-base dark:prose-invert max-w-none
                                    [&>p]:text-slate-900 dark:[&>p]:text-slate-100 [&>p]:leading-relaxed
                                    [&>strong]:text-slate-900 dark:[&>strong]:text-white [&>strong]:font-semibold
                                    [&>em]:text-slate-700 dark:[&>em]:text-slate-300
                                    [&>code]:text-slate-900 dark:[&>code]:text-slate-100 [&>code]:bg-slate-100 dark:[&>code]:bg-slate-900 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded
                                    [&>pre]:bg-slate-100 dark:[&>pre]:bg-slate-900 [&>pre]:border [&>pre]:border-slate-200 dark:[&>pre]:border-slate-700
                                    [&>ul]:text-slate-900 dark:[&>ul]:text-slate-100 [&>ol]:text-slate-900 dark:[&>ol]:text-slate-100
                                    [&>h1]:text-slate-900 dark:[&>h1]:text-white [&>h2]:text-slate-900 dark:[&>h2]:text-white [&>h3]:text-slate-900 dark:[&>h3]:text-white
                                  ">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                  </div>
                                ) : (
                                  <p className="text-base lg:text-[17px] leading-relaxed text-slate-900 dark:text-slate-100">{msg.content}</p>
                                )}
                                {msg.timestamp && (
                                  <div className={`text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    <Clock className="w-3 h-3" />
                                    {formatTimestamp(msg.timestamp)}
                                    {msg.isPinned && <Pin className="w-3 h-3 text-amber-500 ml-1" />}
                                  </div>
                                )}
                              </div>
                              {/* Message Action Toolbar */}
                              {hoveredMsgIdx === i && (
                                <div className={`absolute -top-8 ${msg.role === 'user' ? 'right-0' : 'left-0'} flex items-center gap-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-1 py-0.5 z-10`}>
                                  <button onClick={() => copyMessage(msg.content, i)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title={accessibilitySettings.language === 'fil' ? 'Kopyahin' : 'Copy'}>
                                    {copiedMsgIdx === i ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                  <button onClick={() => togglePinMessage(i)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title={msg.isPinned ? (accessibilitySettings.language === 'fil' ? 'I-unpin' : 'Unpin') : (accessibilitySettings.language === 'fil' ? 'I-pin' : 'Pin')}>
                                    {msg.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 shadow-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl shadow-md">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce-delay-100"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce-delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Smart Follow-up Suggestions After Messages */}
                {!loading && messages.length > 0 && suggestions.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                      {accessibilitySettings.language === 'fil' ? 'Susunod na tanong:' : 'Follow-up questions:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInput('');
                            sendMessage(suggestion);
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 hover:from-cyan-500/20 hover:to-purple-600/20 border border-cyan-500/30 dark:border-cyan-500/40 rounded-full text-xs text-slate-900 dark:text-slate-100 transition-all hover:scale-105 shadow-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-24 right-8 z-30 p-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
              aria-label="Scroll to bottom"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Input Bar with Emoji Picker */}
        <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex gap-3 items-end">
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  title={accessibilitySettings.language === 'fil' ? 'Emoji' : 'Emoji'}
                >
                  <Smile className="w-5 h-5" />
                </button>
                {showEmojiPicker && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowEmojiPicker(false)} />
                    <div className="absolute bottom-14 left-0 z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3">
                      <div className="grid grid-cols-4 gap-1">
                        {EMOJI_OPTIONS.map(emoji => (
                          <button key={emoji} onClick={() => { setInput(prev => prev + emoji); setShowEmojiPicker(false); }} className="w-10 h-10 flex items-center justify-center text-xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={accessibilitySettings.language === 'fil' ? 'Magtanong kay TISA ng kahit ano...' : 'Ask TISA anything...'}
                className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base lg:text-[17px] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-sm resize-none overflow-hidden min-h-[48px] max-h-[200px]"
                disabled={loading}
                rows={1}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/30 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                title={accessibilitySettings.language === 'fil' ? 'Ipadala' : 'Send'}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{accessibilitySettings.language === 'fil' ? 'Ipadala' : 'Send'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}