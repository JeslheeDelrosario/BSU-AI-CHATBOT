// client/src/pages/AITutor.tsx
import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { Send, Bot, User, Menu, Plus, Trash2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find(c => c.id === currentChatId) ?? null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateTitle = (text: string) => {
    const clean = text.replace(/[^\w\s]/gi, '').trim();
    const base = clean.substring(0, 40) || 'New Chat';
    return base + (clean.length > 40 ? '...' : '');
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/chat-sessions');
        const serverChats: Chat[] = Array.isArray(res.data) ? res.data : [];
        setChats(serverChats);

        if (serverChats.length > 0) {
          setCurrentChatId(serverChats[0].id);
          setMessages(serverChats[0].messages ?? []);
        } else {
          const createRes = await api.post('/chat-sessions', { title: 'New Chat', messages: [] });
          const created: Chat = createRes.data;
          setChats([created]);
          setCurrentChatId(created.id);
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to load chat sessions', err);
      }
    };
    load();
  }, []);

  const startNewChat = async () => {
    try {
      const res = await api.post('/chat-sessions', { title: 'New Chat', messages: [] });
      const created: Chat = res.data;
      setChats(prev => [created, ...prev]);
      setCurrentChatId(created.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch (err) {
      console.error('startNewChat error', err);
    }
  };

  const selectChat = async (chat: Chat) => {
    setCurrentChatId(chat.id);
    setMessages(chat.messages ?? []);
    setSidebarOpen(false);
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

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    const tempMessages = [...messages, userMsg];
    setMessages(tempMessages);
    setInput('');
    setLoading(true);

    try {
      const title = messages.length === 0 ? generateTitle(userMsg.content) : currentChat?.title || 'New Chat';
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
      const errorMsg: Message = { role: 'ai', content: '*Sorry, I encountered an error. Please try again.*' };
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

  const ChatItem: React.FC<{ chat: Chat }> = ({ chat }) => {
    const isSelected = chat.id === currentChatId;
    return (
      <div
        onClick={() => selectChat(chat)}
        className={`p-4 rounded-xl cursor-pointer transition-all group ${isSelected ? 'bg-green-700/70 border border-green-500 shadow-lg' : 'hover:bg-green-800/50'}`}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-green-100 font-medium truncate text-sm sm:text-base">{chat.title}</p>
            <p className="text-green-400 text-xs mt-1">{new Date(chat.updatedAt).toLocaleDateString()}</p>
          </div>
          <button
            onClick={(e) => deleteChat(chat.id, e)}
            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] flex flex-col lg:flex-row">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-full sm:w-80 bg-green-900/90 backdrop-blur-2xl border-r border-green-700/60 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-4 sm:p-6 border-b border-green-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-green-100">Chat History</h2>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-green-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-green-950 font-bold rounded-xl shadow-lg hover:from-green-400 hover:to-emerald-500 transform hover:scale-105 transition-all text-sm sm:text-base"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chats.length === 0 ? (
              <p className="text-center text-green-400 mt-10">No chats yet</p>
            ) : (
              chats.map(chat => <ChatItem key={chat.id} chat={chat} />)
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-green-900/90 backdrop-blur-2xl border-b border-green-700/60 px-4 py-5 sm:py-6 flex items-center justify-between gap-4 shadow-2xl">
        {/* Mobile Menu Button */}
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="lg:hidden text-green-300 hover:text-green-100 transition-colors"
        >
          <Menu className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        {/* Centered Title */}
        <div className="flex-1 flex justify-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-50 tracking-tight text-center">
            {currentChat?.title || 'TISA Tutor'}
          </h1>
        </div>

        {/* Spacer to balance the layout (keeps title perfectly centered) */}
        <div className="w-10 h-10 lg:hidden" />
      </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
          {messages.length === 0 ? (
            <div className="text-center mt-20 sm:mt-32">
              <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 bg-green-800/60 rounded-full mb-8 shadow-2xl border-4 border-green-600/50">
                <Bot className="w-14 h-14 sm:w-16 sm:h-16 text-green-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-green-100 mb-3">TISA Tutor</h2>
              <p className="text-green-300 text-base sm:text-lg max-w-xl mx-auto px-4">
                Your personal learning assistant — ask anything!
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 sm:gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                  )}

                  <div className={`max-w-xs sm:max-w-2xl md:max-w-4xl p-4 sm:p-6 rounded-2xl shadow-xl border ${
                    msg.role === 'ai'
                      ? 'bg-green-800/70 border-green-600/60 text-green-50'
                      : 'bg-emerald-700/80 border-emerald-600/70 text-green-50'
                  }`}>
                    {msg.role === 'ai' ? (
                      <div className="prose prose-invert prose-sm sm:prose-lg max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-base sm:text-lg font-medium leading-relaxed">{msg.content}</p>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-lime-500 to-green-600 shadow-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 sm:gap-5">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="bg-green-800/70 border border-green-600/60 p-4 sm:p-6 rounded-2xl shadow-xl">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-green-700/50 p-4 bg-green-900/90 backdrop-blur-2xl">
          <div className="max-w-5xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask TISA anything..."
              className="flex-1 px-5 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-4 focus:ring-green-500/60 text-base sm:text-lg transition-all"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-4 sm:px-8 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-green-950 font-bold rounded-2xl shadow-xl hover:shadow-green-500/60 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}