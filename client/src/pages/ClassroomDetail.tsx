import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Users, BookOpen, MessageSquare, ArrowLeft, Loader2, Edit, Shield, Crown, Plus } from 'lucide-react';
import api from '../lib/api';

interface ClassroomMember {
  id: string;
  role: string;
  User: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    role: string;
  };
}

interface Post {
  id: string;
  type: string;
  title?: string;
  content: string;
  visibility: string;
  isPinned: boolean;
  publishedAt: string;
  Author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  Comments: Comment[];
  _count: {
    Comments: number;
    Reactions: number;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  Author: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Classroom {
  id: string;
  name: string;
  section?: string;
  sections?: string;
  description?: string;
  inviteCode: string;
  Course: {
    id: string;
    title: string;
    description: string;
  };
  ClassroomMembers: ClassroomMember[];
}

export default function ClassroomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stream' | 'people' | 'about'>('stream');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', section: '', sections: '', description: '' });
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ content: '', visibility: 'ALL_STUDENTS' });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [commentText, setCommentText] = useState<{[key: string]: string}>({});
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);
  const [submittingComment, setSubmittingComment] = useState<{[key: string]: boolean}>({});
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [taskType, setTaskType] = useState('ANNOUNCEMENT');
  const [taskForm, setTaskForm] = useState({ title: '', content: '', dueDate: '', points: '' });

  const fetchClassroom = useCallback(async () => {
    try {
      const res = await api.get(`/classrooms/${id}`);
      setClassroom(res.data);
    } catch (error) {
      console.error('Failed to fetch classroom:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchPosts = useCallback(async () => {
    if (!id) return;
    setLoadingPosts(true);
    try {
      const res = await api.get(`/classrooms/${id}/posts`);
      setPosts(res.data.posts || res.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClassroom();
    fetchPosts();
  }, [fetchClassroom, fetchPosts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {settings.language === 'fil' ? 'Hindi Nahanap ang Classroom' : 'Classroom Not Found'}
          </h2>
          <button
            onClick={() => navigate('/classrooms')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold"
          >
            {settings.language === 'fil' ? 'Bumalik sa Classrooms' : 'Back to Classrooms'}
          </button>
        </div>
      </div>
    );
  }

  const teacher = classroom.ClassroomMembers.find(m => m.role === 'TEACHER');
  const currentMember = classroom.ClassroomMembers.find(m => m.User.id === user?.id);
  const isTeacher = currentMember?.role === 'TEACHER';
  const canPost = isTeacher || currentMember?.role === 'PRESIDENT' || currentMember?.role === 'VICE_PRESIDENT' || currentMember?.role === 'MODERATOR';
  
  const canViewPost = (post: Post) => {
    if (!currentMember) return false;
    if (post.visibility === 'ALL_STUDENTS') return true;
    if (post.visibility === 'MODERATORS_ONLY') {
      return ['TEACHER', 'PRESIDENT', 'VICE_PRESIDENT', 'MODERATOR'].includes(currentMember.role);
    }
    return true;
  };
  
  const visiblePosts = posts.filter(canViewPost);
  
  const students = classroom.ClassroomMembers.filter(m => 
    m.role === 'STUDENT' || m.role === 'PRESIDENT' || m.role === 'VICE_PRESIDENT' || m.role === 'MODERATOR'
  );

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await api.put(`/classrooms/${classroom.id}/members/${memberId}/role`, { role: newRole });
      fetchClassroom();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleEditClassroom = () => {
    setEditForm({
      name: classroom.name,
      section: classroom.section || '',
      sections: classroom.sections || '',
      description: classroom.description || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/classrooms/${classroom.id}/info`, editForm);
      setShowEditModal(false);
      fetchClassroom();
    } catch (error) {
      console.error('Failed to update classroom:', error);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (submittingAnnouncement) return;
    setSubmittingAnnouncement(true);
    try {
      // Use JSON for posts without files, FormData only when files are attached
      if (attachments.length === 0) {
        const postData: any = {
          type: taskType,
          content: announcementForm.content,
          visibility: announcementForm.visibility
        };
        
        if (taskType !== 'ANNOUNCEMENT') {
          postData.title = taskForm.title;
          if (taskForm.points) postData.points = parseInt(taskForm.points);
          if (taskForm.dueDate) postData.dueDate = new Date(taskForm.dueDate).toISOString();
        }
        
        if (meetingDate && meetingTime) {
          postData.meetingSchedule = {
            date: meetingDate,
            time: meetingTime
          };
        }

        await api.post(`/classrooms/${classroom.id}/posts`, postData);
      } else {
        // Use FormData when files are attached
        const formData = new FormData();
        formData.append('type', taskType);
        formData.append('content', announcementForm.content);
        formData.append('visibility', announcementForm.visibility);
        
        if (taskType !== 'ANNOUNCEMENT') {
          formData.append('title', taskForm.title);
          if (taskForm.points) formData.append('points', taskForm.points);
          if (taskForm.dueDate) formData.append('dueDate', new Date(taskForm.dueDate).toISOString());
        }
        
        if (meetingDate && meetingTime) {
          formData.append('meetingSchedule', JSON.stringify({
            date: meetingDate,
            time: meetingTime
          }));
        }
        
        attachments.forEach((file) => {
          formData.append('files', file);
        });

        await api.post(`/classrooms/${classroom.id}/posts`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      setShowAnnouncementModal(false);
      setAnnouncementForm({ content: '', visibility: 'ALL_STUDENTS' });
      setTaskForm({ title: '', content: '', dueDate: '', points: '' });
      setAttachments([]);
      setMeetingDate('');
      setMeetingTime('');
      setTaskType('ANNOUNCEMENT');
      fetchPosts();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentText[postId]?.trim();
    if (!content || submittingComment[postId]) return;
    
    setSubmittingComment({ ...submittingComment, [postId]: true });
    try {
      await api.post(`/classrooms/posts/${postId}/comments`, { content });
      setCommentText({ ...commentText, [postId]: '' });
      fetchPosts();
      if (selectedPost?.id === postId) {
        const updatedPost = posts.find(p => p.id === postId);
        if (updatedPost) setSelectedPost(updatedPost);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmittingComment({ ...submittingComment, [postId]: false });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const openPostModal = (post: Post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'TEACHER':
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">Teacher</span>;
      case 'PRESIDENT':
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3" /> President
          </span>
        );
      case 'VICE_PRESIDENT':
        return (
          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3" /> Vice President
          </span>
        );
      case 'MODERATOR':
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
            <Shield className="w-3 h-3" /> Moderator
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/classrooms')}
          className="flex items-center gap-2 text-slate-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {settings.language === 'fil' ? 'Bumalik sa Classrooms' : 'Back to Classrooms'}
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-purple-600 rounded-3xl p-8 mb-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-black mb-2">{classroom.name}</h1>
              {classroom.section && (
                <p className="text-xl text-cyan-100 mb-3">{classroom.section}</p>
              )}
              <p className="text-lg text-white/90 mb-4">{classroom.Course.title}</p>
              {teacher && (
                <p className="text-white/80">
                  {teacher.User.firstName} {teacher.User.lastName}
                </p>
              )}
            </div>
            {isTeacher && (
              <button 
                onClick={handleEditClassroom}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <Edit className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('stream')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'stream'
                ? 'text-cyan-500 border-b-2 border-cyan-500'
                : 'text-slate-600 dark:text-gray-400 hover:text-cyan-500'
            }`}
          >
            <MessageSquare className="w-5 h-5 inline mr-2" />
            {settings.language === 'fil' ? 'Stream' : 'Stream'}
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'people'
                ? 'text-cyan-500 border-b-2 border-cyan-500'
                : 'text-slate-600 dark:text-gray-400 hover:text-cyan-500'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            {settings.language === 'fil' ? 'Mga Tao' : 'People'}
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'about'
                ? 'text-cyan-500 border-b-2 border-cyan-500'
                : 'text-slate-600 dark:text-gray-400 hover:text-cyan-500'
            }`}
          >
            <BookOpen className="w-5 h-5 inline mr-2" />
            {settings.language === 'fil' ? 'Tungkol' : 'About'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'stream' && (
            <div className="space-y-6">
              {canPost && (
                <div className="relative">
                  <button
                    onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                    className="w-full flex items-center justify-between gap-3 px-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                        {settings.language === 'fil' ? 'Gumawa ng Task' : 'Create Task'}
                      </span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showTaskDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-10 max-h-96 overflow-y-auto">
                      <div className="p-2">
                        <button onClick={() => { setTaskType('ANNOUNCEMENT'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">
                          📢 {settings.language === 'fil' ? 'Anunsyo' : 'Announcement'}
                        </button>
                        
                        <div className="px-4 py-2 text-xs text-gray-500 font-semibold mt-2">{settings.language === 'fil' ? 'Pangunahing Gawain' : 'Major Academic Work'}</div>
                        <button onClick={() => { setTaskType('PROJECT'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">📁 Project</button>
                        <button onClick={() => { setTaskType('CAPSTONE_PROJECT'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">🎓 Capstone Project</button>
                        <button onClick={() => { setTaskType('THESIS'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">📚 Thesis</button>
                        <button onClick={() => { setTaskType('RESEARCH_PAPER'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">📄 Research Paper</button>
                        <button onClick={() => { setTaskType('CASE_STUDY'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">🔍 Case Study</button>
                        
                        <div className="px-4 py-2 text-xs text-gray-500 font-semibold mt-2">{settings.language === 'fil' ? 'Gawain sa Kurso' : 'Coursework'}</div>
                        <button onClick={() => { setTaskType('ASSIGNMENT'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">✍️ Assignment</button>
                        <button onClick={() => { setTaskType('HOMEWORK'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">📝 Homework</button>
                        <button onClick={() => { setTaskType('SEATWORK'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">🪑 Seatwork</button>
                        <button onClick={() => { setTaskType('WORKSHEET'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">📋 Worksheet</button>
                        
                        <div className="px-4 py-2 text-xs text-gray-500 font-semibold mt-2">{settings.language === 'fil' ? 'Aktibidad' : 'Activities'}</div>
                        <button onClick={() => { setTaskType('ACTIVITY'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">🎯 Activity</button>
                        <button onClick={() => { setTaskType('GROUP_ACTIVITY'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">👥 Group Activity</button>
                        <button onClick={() => { setTaskType('LABORATORY_ACTIVITY'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">🧪 Laboratory Activity</button>
                        
                        <div className="px-4 py-2 text-xs text-gray-500 font-semibold mt-2">{settings.language === 'fil' ? 'Pagsusulit' : 'Assessments'}</div>
                        <button onClick={() => { setTaskType('QUIZ'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">📝 Quiz</button>
                        <button onClick={() => { setTaskType('EXAMINATION'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">📖 Examination</button>
                        <button onClick={() => { setTaskType('MIDTERM_EXAM'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">📗 Midterm Exam</button>
                        <button onClick={() => { setTaskType('FINAL_EXAM'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">📕 Final Exam</button>
                        
                        <div className="px-4 py-2 text-xs text-gray-500 font-semibold mt-2">{settings.language === 'fil' ? 'Presentasyon' : 'Presentations'}</div>
                        <button onClick={() => { setTaskType('PRESENTATION'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">🎤 Presentation</button>
                        <button onClick={() => { setTaskType('ORAL_PRESENTATION'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">🗣️ Oral Presentation</button>
                        <button onClick={() => { setTaskType('VIDEO_PRESENTATION'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">🎥 Video Presentation</button>
                        
                        <div className="px-4 py-2 text-xs text-gray-500 font-semibold mt-2">{settings.language === 'fil' ? 'Online' : 'Online Tasks'}</div>
                        <button onClick={() => { setTaskType('ONLINE_ACTIVITY'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">💻 Online Activity</button>
                        <button onClick={() => { setTaskType('FORUM_POST'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-white/10 rounded-lg text-white transition-colors">💬 Forum Post</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {loadingPosts ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                </div>
              ) : visiblePosts.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-400 text-lg">
                      {settings.language === 'fil' 
                        ? 'Walang mga post pa. Magsimula ng pag-uusap!' 
                        : 'No posts yet. Start a conversation!'}
                    </p>
                    {!canPost && (
                      <p className="text-sm text-gray-500 mt-2">
                        {settings.language === 'fil'
                          ? 'Tanging mga guro at mga may espesyal na tungkulin ang maaaring mag-post'
                          : 'Only teachers and members with special roles can post'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {visiblePosts.map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => openPostModal(post)}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 cursor-pointer hover:bg-white/10 transition-all"
                    >
                      {/* Post Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {post.Author.firstName[0]}{post.Author.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">
                              {post.Author.firstName} {post.Author.lastName}
                            </p>
                            {post.visibility === 'MODERATORS_ONLY' && (
                              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                {settings.language === 'fil' ? 'Mga Moderator' : 'Moderators'}
                              </span>
                            )}
                            {post.isPinned && (
                              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                                {settings.language === 'fil' ? 'Naka-pin' : 'Pinned'}
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
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <p className="text-gray-200 whitespace-pre-wrap">{post.content}</p>
                      </div>

                      {/* Post Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-400 pb-4 border-b border-white/10">
                        <span>{post._count.Comments} {settings.language === 'fil' ? 'komento' : 'comments'}</span>
                      </div>

                      {/* Comments Section */}
                      <div className="mt-4 space-y-3">
                        {post.Comments.slice(0, 3).map((comment) => (
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

                        {/* Add Comment */}
                        <div className="flex gap-3 mt-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={commentText[post.id] || ''}
                              onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                              placeholder={settings.language === 'fil' ? 'Magkomento...' : 'Add a comment...'}
                              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={!commentText[post.id]?.trim()}
                              className="px-4 py-2 bg-cyan-500 text-white rounded-xl text-sm font-semibold hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {settings.language === 'fil' ? 'I-post' : 'Post'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'people' && (
            <div className="space-y-6">
              {/* Teacher Section */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  {settings.language === 'fil' ? 'Guro' : 'Teacher'}
                </h3>
                {teacher && (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {teacher.User.firstName[0]}{teacher.User.lastName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {teacher.User.firstName} {teacher.User.lastName}
                      </p>
                      <p className="text-sm text-gray-400">{teacher.User.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Students Section */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  {settings.language === 'fil' ? 'Mga Estudyante' : 'Students'} ({students.length})
                </h3>
                <div className="space-y-3">
                  {students.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {member.User.firstName[0]}{member.User.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {member.User.firstName} {member.User.lastName}
                          </p>
                          <p className="text-sm text-gray-400">{member.User.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getRoleBadge(member.role)}
                        {isTeacher && (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                          >
                            <option value="STUDENT">Student</option>
                            <option value="PRESIDENT">President</option>
                            <option value="VICE_PRESIDENT">Vice President</option>
                            <option value="MODERATOR">Moderator</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                {settings.language === 'fil' ? 'Tungkol sa Classroom' : 'About Classroom'}
              </h3>
              <div className="space-y-4 text-slate-700 dark:text-gray-300">
                <div>
                  <p className="font-semibold mb-1">{settings.language === 'fil' ? 'Kurso' : 'Course'}</p>
                  <p>{classroom.Course.title}</p>
                </div>
                {classroom.description && (
                  <div>
                    <p className="font-semibold mb-1">{settings.language === 'fil' ? 'Paglalarawan' : 'Description'}</p>
                    <p>{classroom.description}</p>
                  </div>
                )}
                {classroom.sections && (
                  <div>
                    <p className="font-semibold mb-1">{settings.language === 'fil' ? 'Mga Seksyon' : 'Sections'}</p>
                    <p className="whitespace-pre-wrap">{classroom.sections}</p>
                  </div>
                )}
                <div>
                  <p className="font-semibold mb-1">{settings.language === 'fil' ? 'Invite Code' : 'Invite Code'}</p>
                  <code className="px-4 py-2 bg-white/10 rounded-lg font-mono">{classroom.inviteCode}</code>
                </div>
                <div>
                  <p className="font-semibold mb-1">{settings.language === 'fil' ? 'Mga Miyembro' : 'Members'}</p>
                  <p>{classroom.ClassroomMembers.length} {settings.language === 'fil' ? 'miyembro' : 'members'}</p>
                </div>
              </div>

              {/* Google Meet Integration */}
              {isTeacher && (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mt-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {settings.language === 'fil' ? 'Google Meet' : 'Google Meet'}
                  </h3>
                  <div className="space-y-4">
                    <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15 12c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"/>
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
                      </svg>
                      {settings.language === 'fil' ? 'Gumawa ng Meeting' : 'Create Meeting'}
                    </button>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-sm text-gray-400 mb-2">
                        {settings.language === 'fil' ? 'Mga Nakaplanong Meeting' : 'Scheduled Meetings'}
                      </p>
                      <p className="text-gray-500 text-sm italic">
                        {settings.language === 'fil' 
                          ? 'Walang nakaplanong meeting. Gumawa ng meeting para sa iyong klase.' 
                          : 'No scheduled meetings. Create a meeting for your class.'}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                      <p className="text-sm text-blue-400">
                        <strong>{settings.language === 'fil' ? 'Tandaan:' : 'Note:'}</strong>{' '}
                        {settings.language === 'fil'
                          ? 'Ang Google Meet integration ay nangangailangan ng Google Calendar API setup.'
                          : 'Google Meet integration requires Google Calendar API setup.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Classroom Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold text-white mb-6">
                {settings.language === 'fil' ? 'I-edit ang Classroom' : 'Edit Classroom'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {settings.language === 'fil' ? 'Pangalan' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {settings.language === 'fil' ? 'Seksyon' : 'Section'}
                  </label>
                  <input
                    type="text"
                    value={editForm.section}
                    onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {settings.language === 'fil' ? 'Mga Seksyon (Detalye)' : 'Sections (Details)'}
                  </label>
                  <textarea
                    value={editForm.sections}
                    onChange={(e) => setEditForm({ ...editForm, sections: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    placeholder={settings.language === 'fil' ? 'Halimbawa: Lunes 8-10am, Miyerkules 2-4pm' : 'Example: Monday 8-10am, Wednesday 2-4pm'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {settings.language === 'fil' ? 'Paglalarawan' : 'Description'}
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {settings.language === 'fil' ? 'I-save' : 'Save'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  {settings.language === 'fil' ? 'Kanselahin' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post Detail Modal */}
        {showPostModal && selectedPost && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6" onClick={() => setShowPostModal(false)}>
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Post Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedPost.Author.firstName[0]}{selectedPost.Author.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-lg">
                    {selectedPost.Author.firstName} {selectedPost.Author.lastName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(selectedPost.publishedAt).toLocaleDateString(settings.language === 'fil' ? 'fil-PH' : 'en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Post Content */}
              <div className="mb-6">
                <p className="text-gray-200 text-lg whitespace-pre-wrap">{selectedPost.content}</p>
              </div>

              {/* Comments Section */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {selectedPost._count.Comments} {settings.language === 'fil' ? 'Komento' : 'Comments'}
                </h3>
                <div className="space-y-4 mb-6">
                  {selectedPost.Comments.map((comment) => (
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
                </div>

                {/* Add Comment */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={commentText[selectedPost.id] || ''}
                      onChange={(e) => setCommentText({ ...commentText, [selectedPost.id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(selectedPost.id)}
                      placeholder={settings.language === 'fil' ? 'Magkomento...' : 'Add a comment...'}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={() => handleAddComment(selectedPost.id)}
                      disabled={!commentText[selectedPost.id]?.trim() || submittingComment[selectedPost.id]}
                      className="px-4 py-2 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingComment[selectedPost.id] ? '...' : (settings.language === 'fil' ? 'I-post' : 'Post')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task/Announcement Modal */}
        {showAnnouncementModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">
                {taskType === 'ANNOUNCEMENT' 
                  ? (settings.language === 'fil' ? 'Anunsyo' : 'Announcement')
                  : taskType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-gray-300">
                    {settings.language === 'fil' ? 'Para sa' : 'For'}
                  </span>
                  <button
                    onClick={() => setAnnouncementForm({ ...announcementForm, visibility: 'ALL_STUDENTS' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      announcementForm.visibility === 'ALL_STUDENTS'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {settings.language === 'fil' ? 'Lahat ng Estudyante' : 'All students'}
                  </button>
                  <button
                    onClick={() => setAnnouncementForm({ ...announcementForm, visibility: 'MODERATORS_ONLY' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      announcementForm.visibility === 'MODERATORS_ONLY'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {settings.language === 'fil' ? 'Mga Moderator Lamang' : 'Moderators only'}
                  </button>
                </div>

                {/* Title field for tasks (not announcements) */}
                {taskType !== 'ANNOUNCEMENT' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">{settings.language === 'fil' ? 'Pamagat' : 'Title'}</label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder={settings.language === 'fil' ? 'Ilagay ang pamagat' : 'Enter title'}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-2">{settings.language === 'fil' ? 'Deskripsyon' : 'Description'}</label>
                  <textarea
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    rows={6}
                    placeholder={settings.language === 'fil' ? 'Ilagay ang detalye' : 'Enter details'}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Points and Due Date for tasks */}
                {taskType !== 'ANNOUNCEMENT' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">{settings.language === 'fil' ? 'Puntos' : 'Points'}</label>
                      <input
                        type="number"
                        value={taskForm.points}
                        onChange={(e) => setTaskForm({ ...taskForm, points: e.target.value })}
                        placeholder="100"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">{settings.language === 'fil' ? 'Deadline' : 'Due Date'}</label>
                      <input
                        type="datetime-local"
                        value={taskForm.dueDate}
                        onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}

                {/* Action Icons */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm text-gray-300">{settings.language === 'fil' ? 'File' : 'Attach'}</span>
                    <input type="file" multiple onChange={handleFileSelect} className="hidden" />
                  </label>
                  
                  <button 
                    onClick={() => document.getElementById('meeting-date')?.focus()}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-300">{settings.language === 'fil' ? 'Meeting' : 'Schedule'}</span>
                  </button>
                </div>

                {/* File Preview */}
                {attachments.length > 0 && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">{attachments.length} {settings.language === 'fil' ? 'file' : 'file(s)'}</p>
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((file, idx) => (
                        <span key={idx} className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                          {file.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meeting Schedule */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{settings.language === 'fil' ? 'Petsa' : 'Date'}</label>
                    <input
                      id="meeting-date"
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{settings.language === 'fil' ? 'Oras' : 'Time'}</label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateAnnouncement}
                  disabled={!announcementForm.content.trim() || submittingAnnouncement}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingAnnouncement ? (settings.language === 'fil' ? 'Nag-post...' : 'Posting...') : (settings.language === 'fil' ? 'I-post' : 'Post')}
                </button>
                <button
                  onClick={() => {
                    setShowAnnouncementModal(false);
                    setAnnouncementForm({ content: '', visibility: 'ALL_STUDENTS' });
                  }}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  {settings.language === 'fil' ? 'Kanselahin' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
