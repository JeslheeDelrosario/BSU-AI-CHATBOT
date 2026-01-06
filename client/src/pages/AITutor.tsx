// client/src/pages/AITutor.tsx
import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { Send, Bot, User, Plus, Trash2, X } from 'lucide-react';
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
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find(c => c.id === currentChatId) ?? null;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate smart title from first message
  const generateTitle = (text: string) => {
    const clean = text.replace(/[^\w\s]/gi, '').trim();
    const base = clean.substring(0, 40) || 'New Chat';
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

    const renameChat = async (id: string, newTitle: string) => {
    try {
      const res = await api.put(`/chat-sessions/${id}/rename`, { title: newTitle });
      const updated = res.data;

      setChats(prev =>
        prev.map(c => (c.id === id ? { ...c, title: updated.title } : c))
      );

      // Update title in the UI header
      if (currentChatId === id) {
        setChats(prev =>
          prev.map(c => (c.id === id ? { ...c, title: updated.title } : c))
        );
      }
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row relative overflow-hidden">

      {/* Animated Background Orbs (same as Layout) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Chat History */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-full lg:w-80 bg-black/70 backdrop-blur-2xl border-r border-white/10 
        shadow-2xl transform transition-transform duration-500 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Chat History
              </h2>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-cyan-400">
                <X className="w-7 h-7" />
              </button>
            </div>

            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-6 h-6" />
              New Chat
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chats.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">No chats yet</p>
            ) : (
              chats.map(chat => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all group relative overflow-hidden
                    ${chat.id === currentChatId
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 shadow-xl shadow-cyan-500/20'
                      : 'hover:bg-white/5 hover:border-white/10 border border-transparent'
                    }`}
                >
                  {chat.id === currentChatId && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-r-full"></div>
                  )}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0 flex items-center justify-between">
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
                          className="w-full bg-black/70 border border-white/20 rounded-xl px-2 py-1 text-white font-medium truncate focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      ) : (
                        <p
                          className="font-medium text-white truncate cursor-text"
                          onClick={() => {
                            setEditingChatId(chat.id);
                            setTempTitle(chat.title);
                          }}
                        >
                          {chat.title}
                        </p>
                      )}

                      {/* RENAME BUTTON */}
                      {editingChatId !== chat.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChatId(chat.id);
                            setTempTitle(chat.title);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-yellow-400 hover:text-yellow-300 transition-all ml-2"
                        >
                          ✏️
                        </button>
                      )}
                    </div>


                    {/* DELETE BUTTON */}
                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">

        {/* Header */}
        <header className="bg-black/60 backdrop-blur-2xl border-b border-white/10 px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-cyan-400 hover:text-white"
          >
            <Plus className="w-8 h-8" />
          </button>


          <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent text-center flex-1">
            {currentChat?.title || 'TISA AI Tutor'}
          </h1>

          <div className="w-10" />
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
          {messages.length === 0 ? (
            <div className="text-center mt-32">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-full mb-8 shadow-2xl border border-cyan-500/30">
                <Bot className="w-20 h-20 text-cyan-400" />
              </div>
              <h2 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                TISA AI Tutor
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Your Student Assistant . Ask anything about College of Science.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-2xl flex items-center justify-center flex-shrink-0">
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                  )}

                  <div className={`max-w-4xl p-6 rounded-3xl shadow-2xl border backdrop-blur-xl
                    ${msg.role === 'ai'
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border-cyan-500/30 text-white'
                    }`}
                  >
                    {msg.role === 'ai' ? (
                      <div className="prose prose-invert prose-lg max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-lg leading-relaxed">{msg.content}</p>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-2xl flex items-center justify-center flex-shrink-0">
                      <User className="w-7 h-7 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {loading && (
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-2xl flex items-center justify-center">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl shadow-2xl backdrop-blur-xl">
                    <div className="flex gap-3">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-white/10 bg-black/60 backdrop-blur-2xl p-6">
          <div className="max-w-5xl mx-auto flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask TISA anything..."
              className="flex-1 px-6 py-5 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 text-lg transition-all backdrop-blur-xl"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-8 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
            >
              <Send className="w-6 h-6" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}