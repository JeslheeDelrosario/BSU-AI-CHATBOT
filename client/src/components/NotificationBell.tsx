import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Loader2 } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllRead } = useNotifications();
  const { settings } = useAccessibility();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      fetchNotifications();
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, fetchNotifications]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      NEW_POST: '📄',
      NEW_COMMENT: '💬',
      ROLE_ASSIGNED: '👑',
      JOIN_REQUEST_APPROVED: '✅',
      JOIN_REQUEST_REJECTED: '❌',
      ASSIGNMENT_DUE: '⏰',
      MENTION: '🔔',
      CLASSROOM_INVITE: '📧',
      MEMBER_JOINED: '👋'
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return settings.language === 'fil' ? 'Ngayon lang' : 'Just now';
    if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      return settings.language === 'fil' ? `${mins} minuto ang nakalipas` : `${mins}m ago`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return settings.language === 'fil' ? `${hours} oras ang nakalipas` : `${hours}h ago`;
    }
    const days = Math.floor(seconds / 86400);
    return settings.language === 'fil' ? `${days} araw ang nakalipas` : `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-cyan-500/10 z-50 overflow-hidden flex flex-col max-h-[600px]">
          {/* Fixed Header - Always Visible */}
          <div className="sticky top-0 z-10 p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/95 backdrop-blur-xl">
            <div>
              <h3 className="text-lg font-bold text-white">
                {settings.language === 'fil' ? 'Mga Notipikasyon' : 'Notifications'}
              </h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-400">
                  {unreadCount} {settings.language === 'fil' ? 'hindi pa nabasa' : 'unread'}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                  title={settings.language === 'fil' ? 'Markahan lahat bilang nabasa' : 'Mark all as read'}
                >
                  <CheckCheck className="w-4 h-4 text-gray-400 group-hover:text-green-400" />
                </button>
              )}
              {notifications.some(n => n.isRead) && (
                <button
                  onClick={deleteAllRead}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
                  title={settings.language === 'fil' ? 'Tanggalin ang nabasa na' : 'Delete read'}
                >
                  <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors group"
              >
                <X className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </button>
            </div>
          </div>

          {/* Scrollable Notifications List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="w-16 h-16 text-gray-600 mb-4" />
                <p className="text-gray-400 text-center">
                  {settings.language === 'fil' ? 'Walang mga notipikasyon' : 'No notifications'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer group relative ${
                      !notification.isRead ? 'bg-cyan-500/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-white mb-1 line-clamp-1">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(notification.createdAt)}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                title={settings.language === 'fil' ? 'Markahan bilang nabasa' : 'Mark as read'}
                              >
                                <Check className="w-3 h-3 text-green-400" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                              title={settings.language === 'fil' ? 'Tanggalin' : 'Delete'}
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }
      `}</style>
    </div>
  );
}
