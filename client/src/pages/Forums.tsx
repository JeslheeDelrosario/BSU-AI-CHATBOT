// Forums Page - Professional UI/UX Design
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import {
  Search,
  Plus,
  Filter,
  MessageSquare,
  Users,
  Heart,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  Pin,
  Lock,
  Globe,
  Shield,
  Crown,
  Video,
  X,
  Clock,
  TrendingUp,
  Sparkles,
  Hash,
  Send,
  Loader2,
  CheckCircle,
  UserPlus,
  LogOut,
  Flame,
  BookOpen,
  GraduationCap,
  Zap,
  ArrowUp,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TrendingTopic {
  tag: string;
  count: number;
  trend: 'up' | 'stable' | 'new';
}

interface PopularCourse {
  id: string;
  title: string;
  mentionCount: number;
}

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

interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  coverImage?: string;
  visibility: string;
  joinPolicy: string;
  memberCount: number;
  postCount: number;
  isMember?: boolean;
  userRole?: string;
  Creator: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export default function Forums() {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const { showToast } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<'feed' | 'communities' | 'bookmarks'>('feed');
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<ForumPost[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [popularCourses, setPopularCourses] = useState<PopularCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCommunity] = useState<string | null>(null);

  // Create post modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'DISCUSSION',
    visibility: 'PUBLIC',
    communityId: '',
    tags: '',
  });

  // Create community modal
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [creatingCommunity, setCreatingCommunity] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    visibility: 'PUBLIC',
    joinPolicy: 'OPEN',
    tags: '',
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Comments state for inline commenting
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  const isFilipino = settings.language === 'fil';

  // Fetch posts
  const fetchPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      const params = new URLSearchParams();
      params.set('page', reset ? '1' : page.toString());
      params.set('limit', '20');
      params.set('sort', sortBy);
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCommunity) params.set('communityId', selectedCommunity);

      const response = await api.get(`/forums/posts?${params.toString()}`);
      const newPosts = response.data.posts || [];

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      setHasMore(response.data.pagination?.hasMore || false);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      showToast({
        type: 'error',
        title: isFilipino ? 'Error' : 'Error',
        message: isFilipino ? 'Hindi makuha ang mga post' : 'Failed to fetch posts',
      });
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, searchQuery, selectedCommunity, isFilipino, showToast]);

  // Fetch communities
  const fetchCommunities = useCallback(async () => {
    try {
      const response = await api.get('/forums/communities?limit=50');
      setCommunities(response.data.communities || []);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    }
  }, []);

  // Fetch trending topics from real data
  const fetchTrendingTopics = useCallback(async () => {
    try {
      const response = await api.get('/forums/trending');
      setTrendingTopics(response.data.topics || []);
      setPopularCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch trending:', error);
      setTrendingTopics([]);
      setPopularCourses([]);
    }
  }, []);

  // Fetch bookmarked posts
  const fetchBookmarks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await api.get('/forums/bookmarks');
      setBookmarkedPosts(response.data.bookmarks || []);
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      setBookmarkedPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'bookmarks') {
      fetchBookmarks();
    } else if (activeTab === 'feed') {
      fetchPosts(true);
    }
    fetchCommunities();
    fetchTrendingTopics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sortBy, searchQuery, selectedCommunity]);

  // Create post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      showToast({
        type: 'warning',
        title: isFilipino ? 'Kulang' : 'Missing Fields',
        message: isFilipino ? 'Kailangan ang titulo at nilalaman' : 'Title and content are required',
      });
      return;
    }

    setCreating(true);
    try {
      const payload = {
        ...newPost,
        communityId: newPost.communityId || null,
        tags: newPost.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      await api.post('/forums/posts', payload);
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', type: 'DISCUSSION', visibility: 'PUBLIC', communityId: '', tags: '' });
      fetchPosts(true);
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Na-post na!' : 'Post created successfully!',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: isFilipino ? 'Error' : 'Error',
        message: error.response?.data?.error || 'Failed to create post',
      });
    } finally {
      setCreating(false);
    }
  };

  // Create community
  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunity.name.trim()) {
      showToast({
        type: 'warning',
        title: isFilipino ? 'Kulang' : 'Missing Fields',
        message: isFilipino ? 'Kailangan ang pangalan ng community' : 'Community name is required',
      });
      return;
    }

    setCreatingCommunity(true);
    try {
      const payload = {
        ...newCommunity,
        tags: newCommunity.tags.split(',').map(t => t.trim()).filter(t => t),
      };

      await api.post('/forums/communities', payload);
      setShowCommunityModal(false);
      setNewCommunity({ name: '', description: '', visibility: 'PUBLIC', joinPolicy: 'OPEN', tags: '' });
      fetchCommunities();
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Nagawa na ang community!' : 'Community created successfully!',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: isFilipino ? 'Error' : 'Error',
        message: error.response?.data?.error || 'Failed to create community',
      });
    } finally {
      setCreatingCommunity(false);
    }
  };

  // Toggle bookmark
  const handleBookmark = async (postId: string) => {
    try {
      const response = await api.post(`/forums/posts/${postId}/bookmark`);
      setPosts(prev =>
        prev.map(p =>
          p.id === postId ? { ...p, isBookmarked: response.data.bookmarked } : p
        )
      );
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  // React to post
  const handleReact = async (postId: string, type: string = 'LIKE') => {
    try {
      const response = await api.post(`/forums/posts/${postId}/react`, { type });
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
                ...p,
                userReaction: response.data.action === 'added' ? type : undefined,
                likeCount: p.likeCount + (response.data.action === 'added' ? 1 : -1),
              }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId: string) => {
    try {
      setCommentsLoading(prev => ({ ...prev, [postId]: true }));
      const response = await api.get(`/forums/posts/${postId}/comments`);
      setComments(prev => ({ ...prev, [postId]: response.data.comments || [] }));
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Toggle comments section
  const toggleComments = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) {
        fetchComments(postId);
      }
    }
  };

  // Submit comment
  const handleSubmitComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content) return;

    try {
      setSubmittingComment(prev => ({ ...prev, [postId]: true }));
      const response = await api.post(`/forums/posts/${postId}/comments`, { content });
      const newCommentData = response.data.comment || response.data;
      
      setComments(prev => ({
        ...prev,
        [postId]: [newCommentData, ...(prev[postId] || [])],
      }));
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p
      ));

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
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Join community
  const handleJoinCommunity = async (communityId: string) => {
    try {
      const response = await api.post(`/forums/communities/${communityId}/join`);
      setCommunities(prev =>
        prev.map(c =>
          c.id === communityId
            ? { ...c, isMember: response.data.status === 'joined', memberCount: c.memberCount + 1 }
            : c
        )
      );
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: response.data.message,
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: isFilipino ? 'Error' : 'Error',
        message: error.response?.data?.error || 'Failed to join community',
      });
    }
  };

  // Leave community
  const handleLeaveCommunity = async (communityId: string) => {
    try {
      await api.post(`/forums/communities/${communityId}/leave`);
      setCommunities(prev =>
        prev.map(c =>
          c.id === communityId
            ? { ...c, isMember: false, userRole: undefined, memberCount: c.memberCount - 1 }
            : c
        )
      );
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Umalis ka na sa community' : 'Left community successfully',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: isFilipino ? 'Error' : 'Error',
        message: error.response?.data?.error || 'Failed to leave community',
      });
    }
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!confirm(isFilipino ? 'Sigurado ka bang gusto mong tanggalin ang post na ito?' : 'Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await api.delete(`/forums/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Na-delete na ang post' : 'Post deleted successfully',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: isFilipino ? 'Error' : 'Error',
        message: error.response?.data?.error || 'Failed to delete post',
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  // Render post card
  const renderPostCard = (post: ForumPost) => (
    <div
      key={post.id}
      className={`backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-cyan-500/30 transition-all duration-300 group ${
        post.isPinned ? 'ring-2 ring-amber-500/30 bg-amber-500/5' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20">
            {post.Author.avatar ? (
              <img src={post.Author.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              `${post.Author.firstName[0]}${post.Author.lastName[0]}`
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {post.Author.firstName} {post.Author.lastName}
              </span>
              {post.isPinned && (
                <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs rounded flex items-center gap-1">
                  <Pin className="w-3 h-3" />
                  {isFilipino ? 'Naka-pin' : 'Pinned'}
                </span>
              )}
              {post.isLocked && (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatDate(post.createdAt)}</span>
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
        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <Link to={`/forums/post/${post.id}`} className="block">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-cyan-400 transition-colors">
          {post.title}
        </h3>
        <p className="text-slate-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-4">
          {post.content}
        </p>
      </Link>

      {/* Media preview */}
      {post.Media && post.Media.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
          {post.Media.slice(0, 4).map((media, idx) => (
            <div
              key={media.id}
              className={`relative aspect-video bg-white/5 ${
                post.Media!.length === 1 ? 'col-span-2' : ''
              }`}
            >
              {media.type === 'IMAGE' ? (
                <img
                  src={media.thumbnailUrl || media.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : media.type === 'VIDEO' ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Video className="w-10 h-10 text-purple-400" />
                </div>
              ) : null}
              {idx === 3 && post.Media!.length > 4 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
                  +{post.Media!.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 5).map(tag => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-3 py-1 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 text-xs rounded-full transition-all"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleReact(post.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              post.userReaction
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.userReaction ? 'fill-current' : ''}`} />
            <span>{post.likeCount}</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleComments(post.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              expandedPost === post.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentCount}</span>
            {expandedPost === post.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBookmark(post.id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              post.isBookmarked
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30'
            }`}
          >
            {post.isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            <span>{isFilipino ? 'I-save' : 'Save'}</span>
          </button>
        </div>
        {/* Delete button - only show for post author or admin */}
        {user && (user.id === post.Author.id || user.role === 'ADMIN') && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeletePost(post.id);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isFilipino ? 'Tanggalin' : 'Delete'}</span>
          </button>
        )}
      </div>

      {/* Inline Comments Section */}
      {expandedPost === post.id && (
        <div className="border-t border-white/10 bg-white/[0.02] p-5 mt-4">
          {/* Comment Input */}
          {user && !post.isLocked && (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.firstName?.[0] || 'U'}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment[post.id] || ''}
                  onChange={e => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmitComment(post.id)}
                  placeholder={isFilipino ? 'Mag-komento...' : 'Write a comment...'}
                  className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleSubmitComment(post.id)}
                  disabled={!newComment[post.id]?.trim() || submittingComment[post.id]}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2"
                >
                  {submittingComment[post.id] ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {post.isLocked && (
            <div className="flex items-center gap-2 text-amber-400 text-sm mb-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Lock className="w-4 h-4" />
              {isFilipino ? 'Naka-lock ang mga komento sa post na ito' : 'Comments are locked on this post'}
            </div>
          )}

          {/* Comments List */}
          {commentsLoading[post.id] ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : comments[post.id]?.length > 0 ? (
            <div className="space-y-3">
              {comments[post.id].map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {comment.Author?.avatar ? (
                      <img src={comment.Author.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      comment.Author?.firstName?.[0] || '?'
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white/5 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {comment.Author?.firstName} {comment.Author?.lastName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4">
              {isFilipino ? 'Walang komento pa' : 'No comments yet'}
            </p>
          )}
        </div>
      )}
    </div>
  );

  // Render community card
  const renderCommunityCard = (community: Community) => (
    <Link
      to={`/forums/c/${community.slug}`}
      key={community.id}
      className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 group block cursor-pointer"
    >
      {/* Cover */}
      <div className="h-28 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 relative">
        {community.coverImage && (
          <img src={community.coverImage} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute -bottom-7 left-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-slate-900 flex items-center justify-center text-xl font-bold text-cyan-400 shadow-xl">
            {community.avatar ? (
              <img src={community.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              community.name[0]
            )}
          </div>
        </div>
        {/* Visibility badge */}
        <div className="absolute top-3 right-3">
          {community.visibility === 'PRIVATE' ? (
            <span className="px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1.5 font-medium">
              <Lock className="w-3 h-3" />
              {isFilipino ? 'Pribado' : 'Private'}
            </span>
          ) : community.visibility === 'HIDDEN' ? (
            <span className="px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1.5 font-medium">
              <Shield className="w-3 h-3" />
              {isFilipino ? 'Nakatago' : 'Hidden'}
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1.5 font-medium">
              <Globe className="w-3 h-3" />
              {isFilipino ? 'Pampubliko' : 'Public'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pt-10">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
          {community.name}
        </h3>
        {community.description && (
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
            {community.description}
          </p>
        )}
        <div className="flex items-center gap-4 mt-4 text-xs">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Users className="w-4 h-4" />
            <span className="text-slate-600 dark:text-gray-400">{community.memberCount} {isFilipino ? 'miyembro' : 'members'}</span>
          </span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <MessageSquare className="w-4 h-4" />
            <span className="text-slate-600 dark:text-gray-400">{community.postCount} {isFilipino ? 'post' : 'posts'}</span>
          </span>
        </div>

        {/* Action button */}
        <div className="mt-5">
          {community.isMember ? (
            <div className="flex items-center gap-2">
              <span className="flex-1 px-4 py-2.5 bg-green-500/20 text-green-400 text-sm font-bold rounded-xl text-center flex items-center justify-center gap-2 border border-green-500/30">
                <CheckCircle className="w-4 h-4" />
                {community.userRole === 'OWNER' && <Crown className="w-4 h-4 text-amber-400" />}
                {isFilipino ? 'Miyembro' : 'Member'}
              </span>
              {community.userRole !== 'OWNER' && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLeaveCommunity(community.id); }}
                  className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl transition-all"
                  title={isFilipino ? 'Umalis' : 'Leave'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleJoinCommunity(community.id); }}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              {community.joinPolicy === 'APPROVAL'
                ? isFilipino ? 'Mag-request' : 'Request to Join'
                : isFilipino ? 'Sumali' : 'Join'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="py-10 lg:py-16">
      {/* Welcome Header - Matching Dashboard Style */}
      <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 mb-12 shadow-2xl max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl">
                <MessageSquare className="w-10 h-10 text-cyan-400" />
              </div>
              {isFilipino ? 'Forums' : 'Forums'}
            </h1>
            <p className="text-xl text-slate-700 dark:text-gray-300 mt-4 font-light tracking-wide">
              {isFilipino 
                ? 'Makipag-usap, magtanong, at matuto kasama ang komunidad' 
                : 'Connect, discuss, and learn with the community'}
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCommunityModal(true)}
                className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl transition-all flex items-center gap-2 text-slate-700 dark:text-gray-300"
              >
                <Users className="w-5 h-5 text-purple-400" />
                <span className="hidden sm:inline font-medium">{isFilipino ? 'Gumawa ng Community' : 'Create Community'}</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-2xl transition-all flex items-center gap-2 font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">{isFilipino ? 'Mag-post' : 'New Post'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Bar - Matching Courses Style */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={isFilipino ? 'Maghanap ng mga post, topics, o keywords...' : 'Search posts, topics, or keywords...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="latest">{isFilipino ? 'Pinakabago' : 'Latest'}</option>
              <option value="popular">{isFilipino ? 'Sikat' : 'Popular'}</option>
              <option value="trending">{isFilipino ? 'Trending' : 'Trending'}</option>
              <option value="comments">{isFilipino ? 'Maraming komento' : 'Most Comments'}</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl transition-all ${
                showFilters
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {searchQuery && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
            <Search className="w-4 h-4" />
            <span>{isFilipino ? `Naghahanap ng "${searchQuery}"` : `Searching for "${searchQuery}"`}</span>
            <button
              onClick={() => setSearchQuery('')}
              className="ml-2 text-cyan-400 hover:underline flex items-center gap-1"
            >
              <X className="w-4 h-4" /> {isFilipino ? 'I-clear' : 'Clear'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs - Professional Style */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="flex items-center gap-1 p-1.5 bg-white/5 border border-white/10 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'feed'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {isFilipino ? 'Feed' : 'Feed'}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'communities'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {isFilipino ? 'Mga Community' : 'Communities'}
            </span>
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'bookmarks'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                {isFilipino ? 'Mga Bookmark' : 'Bookmarks'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-6">
          {/* Main feed */}
          <div className="flex-1">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10" />
                      <div className="flex-1">
                        <div className="h-4 bg-white/10 rounded-lg w-32 mb-2" />
                        <div className="h-3 bg-white/10 rounded-lg w-24" />
                      </div>
                    </div>
                    <div className="h-6 bg-white/10 rounded-lg w-3/4 mb-3" />
                    <div className="h-4 bg-white/10 rounded-lg w-full mb-2" />
                    <div className="h-4 bg-white/10 rounded-lg w-2/3 mb-4" />
                    <div className="flex gap-4">
                      <div className="h-8 bg-white/10 rounded-lg w-16" />
                      <div className="h-8 bg-white/10 rounded-lg w-16" />
                      <div className="h-8 bg-white/10 rounded-lg w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === 'feed' ? (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center">
                      <MessageSquare className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                      {isFilipino ? 'Walang post pa' : 'No posts yet'}
                    </h3>
                    <p className="text-slate-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {isFilipino ? 'Maging una na mag-post at simulan ang diskusyon!' : 'Be the first to post and start the conversation!'}
                    </p>
                    {user && (
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {isFilipino ? 'Gumawa ng Post' : 'Create Post'}
                      </button>
                    )}
                  </div>
                ) : (
                  posts.map(renderPostCard)
                )}
                {hasMore && (
                  <button
                    onClick={() => {
                      setPage(p => p + 1);
                      fetchPosts();
                    }}
                    className="w-full py-3 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors text-sm font-medium"
                  >
                    {isFilipino ? 'Mag-load pa' : 'Load more'}
                  </button>
                )}
              </div>
            ) : activeTab === 'communities' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {communities.length === 0 ? (
                  <div className="col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 text-center">
                    <Users className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {isFilipino ? 'Walang community pa' : 'No communities yet'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                      {isFilipino ? 'Gumawa ng unang community!' : 'Create the first community!'}
                    </p>
                    {user && (
                      <button
                        onClick={() => setShowCommunityModal(true)}
                        className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {isFilipino ? 'Gumawa ng Community' : 'Create Community'}
                      </button>
                    )}
                  </div>
                ) : (
                  communities.map(renderCommunityCard)
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {bookmarkedPosts.length === 0 ? (
                  <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center shadow-2xl">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center">
                      <Bookmark className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                      {isFilipino ? 'Walang naka-save na post' : 'No saved posts yet'}
                    </h3>
                    <p className="text-slate-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {isFilipino 
                        ? 'I-click ang bookmark icon sa mga post para i-save sila dito' 
                        : 'Click the bookmark icon on posts to save them here'}
                    </p>
                    <button
                      onClick={() => setActiveTab('feed')}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-2xl transition-all font-bold"
                    >
                      {isFilipino ? 'Mag-browse ng posts' : 'Browse Posts'}
                    </button>
                  </div>
                ) : (
                  bookmarkedPosts.map(renderPostCard)
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
            {/* Trending Topics - Professional Design */}
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl">
                  <Flame className="w-5 h-5 text-cyan-400" />
                </div>
                {isFilipino ? 'Trending Topics' : 'Trending Topics'}
              </h3>
              <div className="space-y-2">
                {trendingTopics.length > 0 ? (
                  trendingTopics.slice(0, 8).map((topic, idx) => (
                    <button
                      key={topic.tag}
                      onClick={() => setSearchQuery(topic.tag)}
                      className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-cyan-400 w-5">#{idx + 1}</span>
                          <Hash className="w-4 h-4 text-purple-400" />
                          <span className="text-slate-700 dark:text-gray-200 font-medium group-hover:text-cyan-400 transition-colors">
                            {topic.tag}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-gray-500">{topic.count} posts</span>
                          {topic.trend === 'up' && <ArrowUp className="w-3 h-3 text-green-400" />}
                          {topic.trend === 'new' && <Zap className="w-3 h-3 text-amber-400" />}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <TrendingUp className="w-10 h-10 text-slate-600 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-gray-500">
                      {isFilipino ? 'Wala pang trending topics' : 'No trending topics yet'}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-gray-600 mt-1">
                      {isFilipino ? 'Mag-post para magsimula!' : 'Start posting to see trends!'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Popular Courses Being Discussed */}
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                {isFilipino ? 'Hot na Kurso' : 'Hot Courses'}
              </h3>
              <div className="space-y-2">
                {popularCourses.length > 0 ? (
                  popularCourses.slice(0, 5).map((course) => (
                    <Link
                      key={course.id}
                      to={`/courses/${course.id}`}
                      className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-2xl transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-gray-200 truncate group-hover:text-purple-400 transition-colors">
                          {course.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-500">
                          {course.mentionCount} {isFilipino ? 'diskusyon' : 'discussions'}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <GraduationCap className="w-10 h-10 text-slate-600 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-gray-500">
                      {isFilipino ? 'Walang kurso na pinag-uusapan' : 'No courses being discussed'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Your Communities */}
            {user && (
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
                <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  {isFilipino ? 'Mga Community Mo' : 'Your Communities'}
                </h3>
                <div className="space-y-2">
                  {communities.filter(c => c.isMember).slice(0, 5).map(community => (
                    <Link
                      key={community.id}
                      to={`/forums/c/${community.slug}`}
                      className="flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {community.avatar ? (
                          <img src={community.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          community.name[0]
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 dark:text-gray-200 truncate group-hover:text-cyan-400 transition-colors">
                          {community.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-gray-500">
                          {community.memberCount} {isFilipino ? 'miyembro' : 'members'}
                        </p>
                      </div>
                      {community.userRole === 'OWNER' && (
                        <Crown className="w-4 h-4 text-amber-400" />
                      )}
                    </Link>
                  ))}
                  {communities.filter(c => c.isMember).length === 0 && (
                    <div className="text-center py-6">
                      <Users className="w-10 h-10 text-slate-600 dark:text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 dark:text-gray-500">
                        {isFilipino ? 'Hindi ka pa miyembro' : 'No communities joined yet'}
                      </p>
                      <button
                        onClick={() => setActiveTab('communities')}
                        className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {isFilipino ? 'Mag-explore ng communities' : 'Explore communities →'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-slate-900/90 border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {isFilipino ? 'Gumawa ng Post' : 'Create Post'}
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isFilipino ? 'Titulo' : 'Title'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder={isFilipino ? 'Ano ang gusto mong itanong o ibahagi?' : 'What do you want to ask or share?'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isFilipino ? 'Nilalaman' : 'Content'} <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={newPost.content}
                  onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder={isFilipino ? 'Isulat ang detalye dito...' : 'Write your post content here...'}
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isFilipino ? 'Uri' : 'Type'}
                  </label>
                  <select
                    value={newPost.type}
                    onChange={e => setNewPost({ ...newPost, type: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  >
                    <option value="DISCUSSION">{isFilipino ? 'Diskusyon' : 'Discussion'}</option>
                    <option value="QUESTION">{isFilipino ? 'Tanong' : 'Question'}</option>
                    <option value="ANNOUNCEMENT">{isFilipino ? 'Anunsyo' : 'Announcement'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isFilipino ? 'Visibility' : 'Visibility'}
                  </label>
                  <select
                    value={newPost.visibility}
                    onChange={e => setNewPost({ ...newPost, visibility: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                  >
                    <option value="PUBLIC">{isFilipino ? 'Pampubliko' : 'Public'}</option>
                    <option value="MEMBERS_ONLY">{isFilipino ? 'Miyembro lang' : 'Members Only'}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isFilipino ? 'Community (opsyonal)' : 'Community (optional)'}
                </label>
                <select
                  value={newPost.communityId}
                  onChange={e => setNewPost({ ...newPost, communityId: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                >
                  <option value="">{isFilipino ? 'Walang community' : 'No community (Global)'}</option>
                  {communities.filter(c => c.isMember).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isFilipino ? 'Mga Tag (comma-separated)' : 'Tags (comma-separated)'}
                </label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={e => setNewPost({ ...newPost, tags: e.target.value })}
                  placeholder="programming, help, question"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium"
                >
                  {isFilipino ? 'Kanselahin' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl transition-all flex items-center gap-2 font-bold shadow-lg shadow-cyan-500/20"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isFilipino ? 'I-post' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Community Modal */}
      {showCommunityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-slate-900/90 border border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {isFilipino ? 'Gumawa ng Community' : 'Create Community'}
                </h2>
              </div>
              <button
                onClick={() => setShowCommunityModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreateCommunity} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isFilipino ? 'Pangalan ng Community' : 'Community Name'} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={e => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  placeholder={isFilipino ? 'Halimbawa: CS Students Hub' : 'e.g., CS Students Hub'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isFilipino ? 'Paglalarawan' : 'Description'}
                </label>
                <textarea
                  value={newCommunity.description}
                  onChange={e => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  placeholder={isFilipino ? 'Tungkol saan ang community na ito?' : 'What is this community about?'}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isFilipino ? 'Visibility' : 'Visibility'}
                  </label>
                  <select
                    value={newCommunity.visibility}
                    onChange={e => setNewCommunity({ ...newCommunity, visibility: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  >
                    <option value="PUBLIC">{isFilipino ? 'Pampubliko' : 'Public'}</option>
                    <option value="PRIVATE">{isFilipino ? 'Pribado' : 'Private'}</option>
                    <option value="HIDDEN">{isFilipino ? 'Nakatago' : 'Hidden'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {isFilipino ? 'Pagsali' : 'Join Policy'}
                  </label>
                  <select
                    value={newCommunity.joinPolicy}
                    onChange={e => setNewCommunity({ ...newCommunity, joinPolicy: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  >
                    <option value="OPEN">{isFilipino ? 'Bukas' : 'Open'}</option>
                    <option value="APPROVAL">{isFilipino ? 'Kailangan ng Approval' : 'Requires Approval'}</option>
                    <option value="INVITE_ONLY">{isFilipino ? 'Invite lang' : 'Invite Only'}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {isFilipino ? 'Mga Tag (comma-separated)' : 'Tags (comma-separated)'}
                </label>
                <input
                  type="text"
                  value={newCommunity.tags}
                  onChange={e => setNewCommunity({ ...newCommunity, tags: e.target.value })}
                  placeholder="programming, study group, help"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCommunityModal(false)}
                  className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium"
                >
                  {isFilipino ? 'Kanselahin' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={creatingCommunity}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 text-white rounded-xl transition-all flex items-center gap-2 font-bold shadow-lg shadow-purple-500/20"
                >
                  {creatingCommunity ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                  {isFilipino ? 'Gumawa' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
