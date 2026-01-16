// client/src/pages/AITutor.tsx
import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { Send, Bot, User, Plus, Trash2, X, Menu, MessageSquare } from 'lucide-react'; // Re-added Menu icon
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSidebar } from '../contexts/SidebarContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTranslation } from '../lib/translations';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: string | number;
}

export default function AITutor() {
  const { settings: accessibilitySettings } = useAccessibility();
  const t = useTranslation(accessibilitySettings.language);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Re-added: to control main navigation sidebar from Layout.tsx
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setSidebarOpen } = useSidebar();
  
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find(c => c.id === currentChatId) ?? null;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate smart title from first message
  const generateTitle = (text: string) => {
    const clean = text.replace(/[^\w\s]/gi, '').trim();
    const base = clean.substring(0, 40) || (accessibilitySettings.language === 'fil' ? 'Bagong Chat' : 'New Chat');
    return base + (clean.length > 40 ? '...' : '');
  };

  // Load chats on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/chat-sessions');
        const serverChats: Chat[] = Array.isArray(res.data) ? res.data : [];
        setChats(serverChats);

        if (serverChats.length > 0) {
          setCurrentChatId(serverChats[0].id);
          setMessages(serverChats[0].messages ?? []);
        }
      } catch (err) {
        console.error('Failed to load chat sessions', err);
      }
    };
    load();
  }, []);

  const startNewChat = async () => {
    try {
      const res = await api.post('/chat-sessions', { title: accessibilitySettings.language === 'fil' ? 'Bagong Chat' : 'New Chat', messages: [] });
      const created: Chat = res.data;
      setChats(prev => [created, ...prev]);
      setCurrentChatId(created.id);
      setMessages([]);
      setChatHistoryOpen(false);
    } catch (err) {
      console.error('startNewChat error', err);
    }
  };

  const selectChat = async (chat: Chat) => {
    setCurrentChatId(chat.id);
    setMessages(chat.messages ?? []);
    setChatHistoryOpen(false);
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

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    const tempMessages = [...messages, userMsg];
    setMessages(tempMessages);
    setInput('');
    setLoading(true);

    try {
      const title = messages.length === 0 ? generateTitle(userMsg.content) : currentChat?.title || (accessibilitySettings.language === 'fil' ? 'Bagong Chat' : 'New Chat');
      let chatId = currentChatId;

      if (!chatId) {
        const createRes = await api.post('/chat-sessions', { title, messages: tempMessages });
        chatId = createRes.data.id;
        setCurrentChatId(chatId);
        setChats(prev => [createRes.data, ...prev]);
      } else {
        await api.put(`/chat-sessions/${chatId}`, { title, messages: tempMessages });
        setChats(prev =>
          prev
            .map(c => (c.id === chatId ? { ...c, messages: tempMessages, title, updatedAt: Date.now() } : c))
            .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt))
        );
      }

      const res = await api.post('/ai-tutor/ask', { message: userMsg.content, type: 'QUESTION' });
      const aiText = res.data?.response ?? '*No response*';
      const aiMsg: Message = { role: 'ai', content: aiText };
      const finalMessages = [...tempMessages, aiMsg];

      setMessages(finalMessages);

      if (chatId) {
        await api.put(`/chat-sessions/${chatId}`, { title, messages: finalMessages });
        setChats(prev => {
          const updated = prev.map(c => (c.id === chatId ? { ...c, messages: finalMessages, title, updatedAt: Date.now() } : c));
          return [...updated].sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt));
        });
      }
    } catch (err) {
      console.error('sendMessage error', err);
      const errorMsg: Message = { role: 'ai', content: accessibilitySettings.language === 'fil' ? '*Paumanhin, may naganap na error. Pakisubukan muli.*' : '*Sorry, I encountered an error. Please try again.*' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
      
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

      {/* Mobile Overlay for Chat History */}
      {chatHistoryOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setChatHistoryOpen(false)}
        />
      )}

      {/* Mobile Overlay for Main Navigation Sidebar */}
      {/* {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )} */}

      {/* Sidebar - Chat History (unchanged) */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50 w-72 lg:w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800
        shadow-2xl transform transition-transform duration-300 ease-out
        ${chatHistoryOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* ... entire sidebar content unchanged ... */}
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {accessibilitySettings.language === 'fil' ? 'Kasaysayan ng Chat' : 'Chat History'}
              </h2>
              <button 
                onClick={() => setChatHistoryOpen(false)} 
                className="lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/30 transform hover:scale-[1.02] transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              {accessibilitySettings.language === 'fil' ? 'Bagong Chat' : 'New Chat'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-cyberpunk p-3 space-y-2">
            {chats.length === 0 ? (
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">{accessibilitySettings.language === 'fil' ? 'Wala pang mga chat' : 'No chats yet'}</p>
            ) : (
              chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`p-3 rounded-lg cursor-pointer transition-all group relative
                    ${chat.id === currentChatId
                      ? 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                    }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {editingChatId === chat.id ? (
                        <input
                          type="text"
                          value={tempTitle}
                          autoFocus
                          onChange={(e) => setTempTitle(e.target.value)}
                          onBlur={async () => {
                            if (tempTitle.trim().length > 0) {
                              await renameChat(chat.id, tempTitle.trim());
                            }
                            setEditingChatId(null);
                            setTempTitle('');
                          }}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                            if (e.key === 'Escape') {
                              setEditingChatId(null);
                              setTempTitle('');
                            }
                          }}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm text-slate-900 dark:text-white font-medium truncate focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      ) : (
                        <p
                          className="text-sm font-medium text-slate-900 dark:text-white truncate cursor-text"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChatId(chat.id);
                            setTempTitle(chat.title);
                          }}
                          title={chat.title}
                        >
                          {chat.title}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat Area - Layout preserved exactly */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Mobile Header - Now with hamburger menu on left */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
          
          {/* NEW: Hamburger menu to open main navigation */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-900 dark:text-white"
            title="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Title - centered */}
          <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-48">
            {currentChat?.title || 'TISA AI Tutor'}
          </h1>

          {/* Chat History button */}
          <button
            onClick={() => setChatHistoryOpen(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-900 dark:text-white"
            title="Chat History"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>

        {/* Messages Container - unchanged */}
        <div className="flex-1 overflow-y-auto scrollbar-cyberpunk pt-16 lg:pt-0">
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
                  Your Student Assistant. Ask anything about College of Science.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-lg
                      ${msg.role === 'ai' 
                        ? 'bg-gradient-to-br from-cyan-500 to-purple-600' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-600'
                      }`}
                    >
                      {msg.role === 'ai' ? (
                        <Bot className="w-5 h-5 text-white" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>

                    <div className={`flex-1 min-w-0 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                      <div className={`inline-block max-w-full px-4 py-3 rounded-2xl shadow-md
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
                            [&>ul]:text-slate-900 dark:[&>ul]:text-slate-100
                            [&>ol]:text-slate-900 dark:[&>ol]:text-slate-100
                            [&>h1]:text-slate-900 dark:[&>h1]:text-white
                            [&>h2]:text-slate-900 dark:[&>h2]:text-white
                            [&>h3]:text-slate-900 dark:[&>h3]:text-white
                          ">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-base lg:text-[17px] leading-relaxed text-slate-900 dark:text-slate-100">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

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
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar - unchanged */}
        <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex gap-3 items-end">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={accessibilitySettings.language === 'fil' ? 'Magtanong kay TISA ng kahit ano...' : 'Ask TISA anything...'}
                className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base lg:text-[17px] text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-sm"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/30 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
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