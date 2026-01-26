import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Pin, PinOff, ThumbsUp, Smile, FileText, Calendar, Award, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface PostCardProps {
  post: any;
  onEdit: (post: any) => void;
  onDelete: (postId: string) => void;
  onPin: (postId: string, isPinned: boolean) => void;
  onReact: (postId: string, emoji: string) => void;
  onComment: (postId: string, content: string) => void;
  onClick: () => void;
  canEdit: boolean;
  canDelete: boolean;
  canPin: boolean;
  commentText: string;
  onCommentChange: (text: string) => void;
  submittingComment: boolean;
}

const POST_TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  ANNOUNCEMENT: { icon: '📢', color: 'bg-blue-500/20 text-blue-400', label: 'Announcement' },
  ASSIGNMENT: { icon: '✍️', color: 'bg-green-500/20 text-green-400', label: 'Assignment' },
  PROJECT: { icon: '📁', color: 'bg-purple-500/20 text-purple-400', label: 'Project' },
  CAPSTONE_PROJECT: { icon: '🎓', color: 'bg-indigo-500/20 text-indigo-400', label: 'Capstone' },
  THESIS: { icon: '📚', color: 'bg-pink-500/20 text-pink-400', label: 'Thesis' },
  QUIZ: { icon: '📝', color: 'bg-yellow-500/20 text-yellow-400', label: 'Quiz' },
  EXAMINATION: { icon: '📖', color: 'bg-red-500/20 text-red-400', label: 'Exam' },
  MIDTERM_EXAM: { icon: '📗', color: 'bg-orange-500/20 text-orange-400', label: 'Midterm' },
  FINAL_EXAM: { icon: '📕', color: 'bg-red-600/20 text-red-500', label: 'Finals' },
};

export default function PostCard({
  post,
  onEdit,
  onDelete,
  onPin,
  onReact,
  onComment,
  onClick,
  canEdit,
  canDelete,
  canPin,
  commentText,
  onCommentChange,
  submittingComment
}: PostCardProps) {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState(false);

  const typeConfig = POST_TYPE_CONFIG[post.type] || POST_TYPE_CONFIG.ANNOUNCEMENT;
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  // Group reactions by emoji
  const groupedReactions = (post.Reactions || []).reduce((acc: any, reaction: any) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction.User);
    return acc;
  }, {});

  const totalReactions = post.Reactions?.length || 0;
  const reactionEmojis = Object.keys(groupedReactions);

  const handleReaction = (emoji: string) => {
    onReact(post.id, emoji);
    setShowReactions(false);
  };

  const getDueDateStatus = () => {
    if (!post.dueDate) return null;
    const dueDate = new Date(post.dueDate);
    const now = new Date();
    const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 0) return { color: 'text-red-400', label: settings.language === 'fil' ? 'Nakaraan na' : 'Overdue' };
    if (diffHours < 24) return { color: 'text-orange-400', label: settings.language === 'fil' ? 'Bukas na' : 'Due Soon' };
    return { color: 'text-green-400', label: settings.language === 'fil' ? 'May oras pa' : 'Upcoming' };
  };

  const dueDateStatus = getDueDateStatus();

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group">
      {/* Post Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {post.Author.firstName[0]}{post.Author.lastName[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white">
              {post.Author.firstName} {post.Author.lastName}
            </p>
            
            {/* Post Type Badge */}
            <span className={`px-2 py-0.5 ${typeConfig.color} text-xs rounded-full flex items-center gap-1`}>
              <span>{typeConfig.icon}</span>
              <span>{typeConfig.label}</span>
            </span>

            {post.visibility === 'MODERATORS_ONLY' && (
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                {settings.language === 'fil' ? 'Mga Moderator' : 'Moderators'}
              </span>
            )}
            
            {post.isPinned && (
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full flex items-center gap-1">
                <Pin className="w-3 h-3" />
                <span>{settings.language === 'fil' ? 'Naka-pin' : 'Pinned'}</span>
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">
            {new Date(post.publishedAt).toLocaleDateString(settings.language === 'fil' ? 'fil-PH' : 'en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Actions Menu */}
        {(canEdit || canDelete || canPin) && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-10 min-w-[160px]">
                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(post);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 text-white flex items-center gap-2 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{settings.language === 'fil' ? 'I-edit' : 'Edit'}</span>
                  </button>
                )}
                {canPin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPin(post.id, !post.isPinned);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 text-white flex items-center gap-2 transition-colors"
                  >
                    {post.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                    <span>{post.isPinned ? (settings.language === 'fil' ? 'I-unpin' : 'Unpin') : (settings.language === 'fil' ? 'I-pin' : 'Pin')}</span>
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(settings.language === 'fil' ? 'Sigurado ka bang gusto mong tanggalin ang post na ito?' : 'Are you sure you want to delete this post?')) {
                        onDelete(post.id);
                      }
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{settings.language === 'fil' ? 'Tanggalin' : 'Delete'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Title */}
      {post.title && (
        <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
      )}

      {/* Post Content */}
      <div className="mb-4 cursor-pointer" onClick={onClick}>
        <p className="text-gray-200 whitespace-pre-wrap line-clamp-4">{post.content}</p>
      </div>

      {/* Post Metadata */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        {post.dueDate && dueDateStatus && (
          <div className={`flex items-center gap-1 text-sm ${dueDateStatus.color}`}>
            <Calendar className="w-4 h-4" />
            <span>{dueDateStatus.label}: {new Date(post.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        {post.points && (
          <div className="flex items-center gap-1 text-sm text-yellow-400">
            <Award className="w-4 h-4" />
            <span>{post.points} {settings.language === 'fil' ? 'puntos' : 'points'}</span>
          </div>
        )}
        {post.attachments && post.attachments.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-cyan-400">
            <FileText className="w-4 h-4" />
            <span>{post.attachments.length} {settings.language === 'fil' ? 'attachment' : 'attachment'}(s)</span>
          </div>
        )}
      </div>

      {/* Images Display */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {post.images.slice(0, 5).map((image: string, idx: number) => (
            <div
              key={idx}
              className={`relative rounded-xl overflow-hidden ${
                post.images.length === 1 ? 'col-span-2' : ''
              } ${
                post.images.length === 3 && idx === 0 ? 'col-span-2' : ''
              }`}
            >
              <img
                src={image}
                alt={`Post image ${idx + 1}`}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(image, '_blank');
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Attachments Display */}
      {post.attachments && Array.isArray(post.attachments) && post.attachments.length > 0 && (
        <div className="mb-4">
          <div className="space-y-2">
            {post.attachments.map((file: any, idx: number) => (
              <a
                key={idx}
                href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.path || file.url}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
              >
                <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{file.filename || file.name}</p>
                  {file.size && (
                    <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Reactions Bar */}
      <div className="flex items-center gap-4 text-sm text-gray-400 pb-4 border-b border-white/10">
        <div className="relative flex items-center gap-2">
          {/* Reaction Emojis Preview */}
          {reactionEmojis.length > 0 && (
            <div className="flex items-center -space-x-1">
              {reactionEmojis.slice(0, 3).map((emoji) => (
                <span key={emoji} className="text-lg bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center border border-white/10">
                  {emoji}
                </span>
              ))}
            </div>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (totalReactions > 0) {
                setShowReactionDetails(true);
              } else {
                setShowReactions(!showReactions);
              }
            }}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            {totalReactions === 0 && <ThumbsUp className="w-4 h-4" />}
            <span className="font-medium">{totalReactions}</span>
          </button>
          
          {/* Add Reaction Picker */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReactions(!showReactions);
            }}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Smile className="w-4 h-4" />
          </button>
          
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl p-2 flex gap-2 z-10">
              {reactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReaction(emoji);
                  }}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={onClick} className="hover:text-cyan-400 transition-colors">
          {post._count?.Comments || 0} {settings.language === 'fil' ? 'komento' : 'comments'}
        </button>
      </div>

      {/* Reaction Details Modal */}
      {showReactionDetails && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6"
          onClick={(e) => {
            e.stopPropagation();
            setShowReactionDetails(false);
          }}
        >
          <div
            className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {settings.language === 'fil' ? 'Mga Reaksyon' : 'Reactions'}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReactionDetails(false);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(groupedReactions).map(([emoji, users]: [string, any]) => (
                <div key={emoji} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-gray-400 text-sm">{users.length}</span>
                  </div>
                  <div className="space-y-2">
                    {users.map((user: any) => (
                      <div key={user.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <span className="text-white text-sm">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comments Preview */}
      <div className="mt-4 space-y-3">
        {post.Comments?.slice(0, 2).map((comment: any) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {comment.Author.firstName[0]}{comment.Author.lastName[0]}
            </div>
            <div className="flex-1 bg-white/5 rounded-xl p-3">
              <p className="text-sm font-semibold text-white mb-1">
                {comment.Author.firstName} {comment.Author.lastName}
              </p>
              <p className="text-sm text-gray-300">{comment.content}</p>
            </div>
          </div>
        ))}

        {/* Quick Comment */}
        <div className="flex gap-3 mt-4">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => {
                e.stopPropagation();
                onCommentChange(e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && commentText.trim()) {
                  e.stopPropagation();
                  onComment(post.id, commentText);
                }
              }}
              placeholder={settings.language === 'fil' ? 'Magkomento...' : 'Add a comment...'}
              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (commentText.trim()) {
                  onComment(post.id, commentText);
                }
              }}
              disabled={!commentText.trim() || submittingComment}
              className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-sm font-semibold hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingComment ? '...' : (settings.language === 'fil' ? 'I-post' : 'Post')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
