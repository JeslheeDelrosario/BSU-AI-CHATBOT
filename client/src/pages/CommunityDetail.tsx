// CommunityDetail Page - View community posts and interact
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Heart,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Plus,
  Send,
  Clock,
  Globe,
  Lock,
  Shield,
  Crown,
  UserPlus,
  LogOut,
  CheckCircle,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Community {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  coverImage?: string;
  visibility: string;
  joinPolicy: string;
  memberCount?: number;
  postCount?: number;
  _count?: {
    Members: number;
    Posts: number;
  };
  isMember?: boolean;
  userRole?: string;
  Creator?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
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
  };
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

export default function CommunityDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const { showToast } = useToast();
  const isFilipino = settings.language === 'fil';

  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);

  // Create post
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', type: 'DISCUSSION', tags: '' });

  // Comments
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  // Fetch community details
  const fetchCommunity = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const response = await api.get(`/forums/communities/${slug}`);
      // API returns { community: ... }
      const communityData = response.data.community || response.data;
      setCommunity(communityData);
    } catch (error: any) {
      console.error('Failed to fetch community:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: isFilipino ? 'Hindi makuha ang community' : 'Failed to fetch community',
      });
      navigate('/forums');
    } finally {
      setLoading(false);
    }
  }, [slug, isFilipino, showToast, navigate]);

  // Fetch community posts
  const fetchPosts = useCallback(async () => {
    if (!community?.id) return;
    try {
      setPostsLoading(true);
      const response = await api.get(`/forums/posts?communityId=${community.id}&limit=50`);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setPostsLoading(false);
    }
  }, [community?.id]);

  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]);

  useEffect(() => {
    if (community) {
      fetchPosts();
    }
  }, [community, fetchPosts]);

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
      
      // API returns { comment: ... }
      const newCommentData = response.data.comment || response.data;
      
      // Add new comment to the list
      setComments(prev => ({
        ...prev,
        [postId]: [newCommentData, ...(prev[postId] || [])],
      }));
      
      // Clear input
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      
      // Update comment count
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
  const handleJoinCommunity = async () => {
    if (!community) return;
    try {
      await api.post(`/forums/communities/${community.id}/join`);
      setCommunity(prev => prev ? { ...prev, isMember: true, memberCount: (prev.memberCount || prev._count?.Members || 0) + 1 } : null);
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Sumali ka na sa community' : 'You joined the community',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || (isFilipino ? 'Hindi makasali' : 'Failed to join'),
      });
    }
  };

  // Leave community
  const handleLeaveCommunity = async () => {
    if (!community) return;
    try {
      await api.post(`/forums/communities/${community.id}/leave`);
      setCommunity(prev => prev ? { ...prev, isMember: false, memberCount: (prev.memberCount || prev._count?.Members || 0) - 1 } : null);
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Umalis ka na sa community' : 'You left the community',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || (isFilipino ? 'Hindi makaalis' : 'Failed to leave'),
      });
    }
  };

  // Create post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!community || !newPost.title.trim() || !newPost.content.trim()) return;

    try {
      setCreating(true);
      const response = await api.post('/forums/posts', {
        ...newPost,
        communityId: community.id,
        tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      const newPostData = response.data.post || response.data;
      setPosts(prev => [newPostData, ...prev]);
      setShowCreateModal(false);
      setNewPost({ title: '', content: '', type: 'DISCUSSION', tags: '' });
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Nai-post na' : 'Post created',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || (isFilipino ? 'Hindi ma-post' : 'Failed to create post'),
      });
    } finally {
      setCreating(false);
    }
  };

  // Like post
  const handleLikePost = async (postId: string) => {
    try {
      await api.post(`/forums/posts/${postId}/react`, { type: 'LIKE' });
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const wasLiked = p.userReaction === 'LIKE';
          return {
            ...p,
            likeCount: wasLiked ? p.likeCount - 1 : p.likeCount + 1,
            userReaction: wasLiked ? undefined : 'LIKE',
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  // Bookmark post
  const handleBookmarkPost = async (postId: string) => {
    try {
      await api.post(`/forums/posts/${postId}/bookmark`);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
      ));
    } catch (error) {
      console.error('Failed to bookmark post:', error);
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

  if (!community) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isFilipino ? 'Hindi nahanap ang community' : 'Community not found'}
        </h2>
        <Link to="/forums" className="mt-4 text-cyan-400 hover:underline">
          {isFilipino ? 'Bumalik sa Forums' : 'Back to Forums'}
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 lg:py-16 max-w-5xl mx-auto px-6">
      {/* Back button */}
      <Link
        to="/forums"
        className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        {isFilipino ? 'Bumalik sa Forums' : 'Back to Forums'}
      </Link>

      {/* Community Header */}
      <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl mb-8">
        {/* Cover Image */}
        <div className="h-40 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 relative">
          {community.coverImage && (
            <img src={community.coverImage} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-slate-900 shadow-xl">
              {community.avatar ? (
                <img src={community.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                community.name[0]
              )}
            </div>
          </div>
          <div className="absolute top-3 right-3">
            {community.visibility === 'PRIVATE' ? (
              <span className="px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> {isFilipino ? 'Pribado' : 'Private'}
              </span>
            ) : community.visibility === 'HIDDEN' ? (
              <span className="px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> {isFilipino ? 'Nakatago' : 'Hidden'}
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> {isFilipino ? 'Pampubliko' : 'Public'}
              </span>
            )}
          </div>
        </div>

        {/* Community Info */}
        <div className="p-6 pt-14">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{community.name}</h1>
              {community.description && (
                <p className="text-slate-500 dark:text-gray-400 mt-2 max-w-2xl">{community.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Users className="w-4 h-4" />
                  <span className="text-slate-600 dark:text-gray-400">{community.memberCount || community._count?.Members || 0} {isFilipino ? 'miyembro' : 'members'}</span>
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-slate-600 dark:text-gray-400">{community.postCount || community._count?.Posts || 0} {isFilipino ? 'post' : 'posts'}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {community.isMember ? (
                <>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    {isFilipino ? 'Mag-post' : 'New Post'}
                  </button>
                  <span className="px-4 py-2.5 bg-green-500/20 text-green-400 text-sm font-bold rounded-xl flex items-center gap-2 border border-green-500/30">
                    <CheckCircle className="w-4 h-4" />
                    {community.userRole === 'OWNER' && <Crown className="w-4 h-4 text-amber-400" />}
                    {isFilipino ? 'Miyembro' : 'Member'}
                  </span>
                  {community.userRole !== 'OWNER' && (
                    <button
                      onClick={handleLeaveCommunity}
                      className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl transition-all"
                      title={isFilipino ? 'Umalis' : 'Leave'}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleJoinCommunity}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  {community.joinPolicy === 'APPROVAL'
                    ? isFilipino ? 'Mag-request' : 'Request to Join'
                    : isFilipino ? 'Sumali' : 'Join'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          {isFilipino ? 'Mga Post' : 'Posts'}
        </h2>

        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-24" />
                  </div>
                </div>
                <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
                <div className="h-4 bg-white/10 rounded w-full mb-2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {isFilipino ? 'Walang post pa' : 'No posts yet'}
            </h3>
            <p className="text-slate-500 dark:text-gray-400 mb-4">
              {isFilipino ? 'Maging una na mag-post!' : 'Be the first to post!'}
            </p>
            {community.isMember && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {isFilipino ? 'Gumawa ng Post' : 'Create Post'}
              </button>
            )}
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {/* Post Header */}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {post.Author.avatar ? (
                      <img src={post.Author.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      post.Author.firstName[0]
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {post.Author.firstName} {post.Author.lastName}
                      </span>
                      <span className="text-slate-500 dark:text-gray-500 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{post.title}</h3>
                    <p className="text-slate-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">{post.content}</p>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-lg">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      post.userReaction === 'LIKE'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.userReaction === 'LIKE' ? 'fill-current' : ''}`} />
                    <span>{post.likeCount}</span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
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
                    onClick={() => handleBookmarkPost(post.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      post.isBookmarked
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30'
                    }`}
                  >
                    {post.isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedPost === post.id && (
                <div className="border-t border-white/10 bg-white/[0.02] p-5">
                  {/* Comment Input */}
                  {user && community.isMember && !post.isLocked && (
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
                          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
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
                      {comments[post.id].map(comment => (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {comment.Author.avatar ? (
                              <img src={comment.Author.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              comment.Author.firstName[0]
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="bg-white/5 rounded-xl p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                  {comment.Author.firstName} {comment.Author.lastName}
                                </span>
                                <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
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
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {isFilipino ? 'Gumawa ng Post' : 'Create Post'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {isFilipino ? 'Pamagat' : 'Title'}
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={e => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  placeholder={isFilipino ? 'Pamagat ng post...' : 'Post title...'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {isFilipino ? 'Nilalaman' : 'Content'}
                </label>
                <textarea
                  value={newPost.content}
                  onChange={e => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder={isFilipino ? 'Ano ang gusto mong ibahagi?' : 'What do you want to share?'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {isFilipino ? 'Mga Tag (comma separated)' : 'Tags (comma separated)'}
                </label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={e => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  placeholder="programming, help, question"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400"
                >
                  {isFilipino ? 'Kanselahin' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={creating || !newPost.title.trim() || !newPost.content.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isFilipino ? 'I-post' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
