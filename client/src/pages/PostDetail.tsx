import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Send,
  Clock,
  Lock,
  Pin,
  Loader2,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Share2,
} from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  slug: string;
  type: string;
  visibility: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  Author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  Community?: {
    id: string;
    name: string;
    slug: string;
    avatar?: string;
  };
  Category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  Media?: Array<{
    id: string;
    type: string;
    url: string;
    thumbnailUrl?: string;
  }>;
  isBookmarked?: boolean;
  userReaction?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  likeCount: number;
  Author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  replies?: Comment[];
  userReaction?: string;
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const { showToast } = useToast();
  const isFilipino = settings.language === 'fil';

  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await api.get(`/forums/posts/${id}`);
      const postData = response.data.post || response.data;
      setPost(postData);
    } catch (error: any) {
      console.error('Failed to fetch post:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: isFilipino ? 'Hindi makuha ang post' : 'Failed to fetch post',
      });
      navigate('/forums');
    } finally {
      setLoading(false);
    }
  }, [id, isFilipino, showToast, navigate]);

  const fetchComments = useCallback(async () => {
    if (!id) return;
    try {
      setCommentsLoading(true);
      const response = await api.get(`/forums/posts/${id}/comments`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    if (post) {
      fetchComments();
    }
  }, [post, fetchComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content || !id) return;

    try {
      setSubmittingComment(true);
      const response = await api.post(`/forums/posts/${id}/comments`, { content });
      const newCommentData = response.data.comment || response.data;
      
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
      
      if (post) {
        setPost({ ...post, commentCount: post.commentCount + 1 });
      }

      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Naidagdag ang komento' : 'Comment added',
      });
    } catch (error: any) {
      console.error('Failed to submit comment:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || (isFilipino ? 'Hindi maidagdag ang komento' : 'Failed to add comment'),
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikePost = async () => {
    if (!post) return;
    try {
      await api.post(`/forums/posts/${post.id}/react`, { type: 'LIKE' });
      const wasLiked = post.userReaction === 'LIKE';
      setPost({
        ...post,
        likeCount: wasLiked ? post.likeCount - 1 : post.likeCount + 1,
        userReaction: wasLiked ? undefined : 'LIKE',
      });
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleBookmarkPost = async () => {
    if (!post) return;
    try {
      await api.post(`/forums/posts/${post.id}/bookmark`);
      setPost({ ...post, isBookmarked: !post.isBookmarked });
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: post.isBookmarked 
          ? (isFilipino ? 'Tinanggal sa bookmark' : 'Removed from bookmarks')
          : (isFilipino ? 'Naidagdag sa bookmark' : 'Added to bookmarks'),
      });
    } catch (error) {
      console.error('Failed to bookmark post:', error);
    }
  };

  const handleDeletePost = async () => {
    if (!post || !window.confirm(isFilipino ? 'Sigurado ka bang gusto mong tanggalin ang post na ito?' : 'Are you sure you want to delete this post?')) return;
    
    try {
      await api.delete(`/forums/posts/${post.id}`);
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Tinanggal ang post' : 'Post deleted',
      });
      navigate('/forums');
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || (isFilipino ? 'Hindi matanggal ang post' : 'Failed to delete post'),
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return isFilipino ? 'Ngayon lang' : 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isFilipino ? 'Hindi nahanap ang post' : 'Post not found'}
        </h2>
        <Link to="/forums" className="mt-4 text-cyan-400 hover:underline">
          {isFilipino ? 'Bumalik sa Forums' : 'Back to Forums'}
        </Link>
      </div>
    );
  }

  const canEdit = user?.id === post.Author.id;
  const canDelete = user?.id === post.Author.id || user?.role === 'ADMIN';

  return (
    <div className="py-10 lg:py-16 max-w-4xl mx-auto px-6">
      <Link
        to="/forums"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        {isFilipino ? 'Bumalik sa Forums' : 'Back to Forums'}
      </Link>

      <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 lg:p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-cyan-500/20">
                {post.Author.avatar ? (
                  <img src={post.Author.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  `${post.Author.firstName[0]}${post.Author.lastName[0]}`
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-900 dark:text-white">
                    {post.Author.firstName} {post.Author.lastName}
                  </span>
                  {post.isPinned && (
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs rounded flex items-center gap-1">
                      <Pin className="w-3 h-3" />
                      {isFilipino ? 'Naka-pin' : 'Pinned'}
                    </span>
                  )}
                  {post.isLocked && (
                    <Lock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(post.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {post.viewCount} {isFilipino ? 'views' : 'views'}
                  </span>
                  {post.Community && (
                    <>
                      <span>•</span>
                      <Link
                        to={`/forums/c/${post.Community.slug}`}
                        className="text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        {post.Community.name}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {(canEdit || canDelete) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-400" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-white/10 rounded-xl shadow-xl z-10">
                    {canEdit && (
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        {isFilipino ? 'I-edit' : 'Edit'}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDeletePost}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isFilipino ? 'Tanggalin' : 'Delete'}
                      </button>
                    )}
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      {isFilipino ? 'I-report' : 'Report'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {post.title}
          </h1>

          <div className="prose prose-slate dark:prose-invert max-w-none mb-6">
            <p className="text-slate-600 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {post.Media && post.Media.length > 0 && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl overflow-hidden">
              {post.Media.map((media) => (
                <div key={media.id} className="relative aspect-video bg-white/5">
                  {media.type === 'IMAGE' ? (
                    <img
                      src={media.url}
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : media.type === 'VIDEO' ? (
                    <video
                      src={media.url}
                      controls
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 text-sm rounded-lg font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-6 border-t border-white/10">
            <button
              onClick={handleLikePost}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                post.userReaction === 'LIKE'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${post.userReaction === 'LIKE' ? 'fill-current' : ''}`} />
              <span>{post.likeCount}</span>
            </button>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{post.commentCount}</span>
            </button>
            <button
              onClick={handleBookmarkPost}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                post.isBookmarked
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30'
              }`}
            >
              {post.isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-gray-400 hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30 transition-all ml-auto">
              <Share2 className="w-5 h-5" />
              {isFilipino ? 'Ibahagi' : 'Share'}
            </button>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/[0.02] p-6 lg:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            {isFilipino ? 'Mga Komento' : 'Comments'} ({post.commentCount})
          </h2>

          {user && !post.isLocked && (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user.firstName?.[0] || 'U'}
                </div>
                <div className="flex-1 flex gap-2">
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder={isFilipino ? 'Mag-komento...' : 'Write a comment...'}
                    rows={3}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingComment}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2 font-medium"
                >
                  {submittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isFilipino ? 'Mag-komento' : 'Comment'}
                </button>
              </div>
            </form>
          )}

          {post.isLocked && (
            <div className="flex items-center gap-2 text-amber-400 text-sm mb-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Lock className="w-4 h-4" />
              {isFilipino ? 'Naka-lock ang mga komento sa post na ito' : 'Comments are locked on this post'}
            </div>
          )}

          {commentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {comment.Author.avatar ? (
                      <img src={comment.Author.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      comment.Author.firstName[0]
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {comment.Author.firstName} {comment.Author.lastName}
                        </span>
                        <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-slate-600 dark:text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">
              {isFilipino ? 'Walang komento pa. Maging una na mag-komento!' : 'No comments yet. Be the first to comment!'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
