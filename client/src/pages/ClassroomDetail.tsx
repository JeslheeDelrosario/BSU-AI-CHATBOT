import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Users, BookOpen, MessageSquare, ArrowLeft, Loader2, Edit, Shield, Crown, Plus, Calendar, Clock, CheckCircle, XCircle, Upload, FileText, X } from 'lucide-react';
import api from '../lib/api';
import ClassroomCalendar from '../components/ClassroomCalendar';
import CreateMeetingModal from '../components/CreateMeetingModal';
import MeetingDetailsModal from '../components/MeetingDetailsModal';
import PostCard from '../components/PostCard';

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
  dueDate?: string;
  points?: number;
  attachments?: any[];
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
  Reactions?: any[];
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

interface JoinRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
}

interface Classroom {
  id: string;
  name: string;
  section?: string;
  sections?: string;
  description?: string;
  inviteCode?: string;
  Course: {
    id: string;
    title: string;
    description: string;
  };
  ClassroomMembers: ClassroomMember[];
  isMember?: boolean;
  joinRequest?: JoinRequest | null;
}

export default function ClassroomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stream' | 'people' | 'about' | 'calendar' | 'requests'>('stream');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [showMeetingDetailsModal, setShowMeetingDetailsModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [taskType, setTaskType] = useState('ANNOUNCEMENT');
  const [taskForm, setTaskForm] = useState({ title: '', content: '', dueDate: '', points: '' });
  const [joinRequestMessage, setJoinRequestMessage] = useState('');
  const [submittingJoinRequest, setSubmittingJoinRequest] = useState(false);
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [loadingJoinRequests, setLoadingJoinRequests] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editPostForm, setEditPostForm] = useState({ title: '', content: '', dueDate: '', points: '' });
  const [postFilter, setPostFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);

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

  const fetchPosts = useCallback(async (pageNum = 1, filterType = 'all', append = false) => {
    if (!id || !classroom?.isMember) return;
    if (!append) setLoadingPosts(true);
    else setLoadingMorePosts(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10'
      });
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      const res = await api.get(`/classrooms/${id}/posts?${params}`);
      const newPosts = res.data.posts || res.data;
      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      setHasMorePosts(newPosts.length === 10);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoadingPosts(false);
      setLoadingMorePosts(false);
    }
  }, [id, classroom?.isMember]);

  const fetchJoinRequests = useCallback(async () => {
    if (!id || !classroom?.isMember) return;
    setLoadingJoinRequests(true);
    try {
      const res = await api.get(`/classrooms/${id}/join-requests`);
      setJoinRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch join requests:', error);
    } finally {
      setLoadingJoinRequests(false);
    }
  }, [id, classroom?.isMember]);

  useEffect(() => {
    fetchClassroom();
  }, [fetchClassroom]);

  useEffect(() => {
    if (classroom?.isMember) {
      fetchPosts(1, 'all', false);
      const currentMember = classroom.ClassroomMembers.find(m => m.User.id === user?.id);
      const isTeacherRole = currentMember?.role === 'TEACHER' || user?.role === 'ADMIN';
      if (isTeacherRole) {
        fetchJoinRequests();
      }
    }
  }, [classroom?.isMember, classroom?.ClassroomMembers, user?.id, user?.role, fetchJoinRequests]);

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
  const isTeacher = currentMember?.role === 'TEACHER' || user?.role === 'ADMIN';
  const isMember = classroom.isMember !== false;
  const hasJoinRequest = classroom.joinRequest !== null && classroom.joinRequest !== undefined;
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
          formData.append('attachments', file);
        });
        
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });

        await api.post(`/classrooms/${classroom.id}/posts`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      setShowAnnouncementModal(false);
      setAnnouncementForm({ content: '', visibility: 'ALL_STUDENTS' });
      setTaskForm({ title: '', content: '', dueDate: '', points: '' });
      setAttachments([]);
      setImageFiles([]);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5);
      setImageFiles(files);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openPostModal = (post: Post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setEditPostForm({
      title: post.title || '',
      content: post.content,
      dueDate: post.dueDate ? new Date(post.dueDate).toISOString().slice(0, 16) : '',
      points: post.points?.toString() || ''
    });
    setShowEditPostModal(true);
  };

  const handleSaveEditPost = async () => {
    if (!editingPost) return;
    try {
      await api.put(`/classrooms/posts/${editingPost.id}`, {
        title: editPostForm.title,
        content: editPostForm.content,
        dueDate: editPostForm.dueDate ? new Date(editPostForm.dueDate).toISOString() : null,
        points: editPostForm.points ? parseInt(editPostForm.points) : null
      });
      setShowEditPostModal(false);
      setEditingPost(null);
      fetchPosts(page, postFilter, false);
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await api.delete(`/classrooms/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const handlePinPost = async (postId: string, isPinned: boolean) => {
    try {
      await api.put(`/classrooms/posts/${postId}`, { isPinned: !isPinned });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, isPinned: !isPinned } : p));
    } catch (error) {
      console.error('Failed to pin post:', error);
      alert('Failed to pin post');
    }
  };

  const handleReaction = async (postId: string, emoji: string) => {
    try {
      await api.post(`/classrooms/posts/${postId}/reactions`, { emoji });
      fetchPosts(page, postFilter, false);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, postFilter, true);
  };

  const handleFilterChange = (filter: string) => {
    setPostFilter(filter);
    setPage(1);
    fetchPosts(1, filter, false);
  };

  const handleSubmitJoinRequest = async () => {
    if (submittingJoinRequest) return;
    setSubmittingJoinRequest(true);
    try {
      const formData = new FormData();
      formData.append('classroomId', classroom.id);
      if (joinRequestMessage) {
        formData.append('message', joinRequestMessage);
      }
      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await api.post('/classrooms/join-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchClassroom();
      setJoinRequestMessage('');
      setUploadedFiles([]);
    } catch (error: any) {
      console.error('Failed to submit join request:', error);
      alert(error.response?.data?.error || 'Failed to submit join request');
    } finally {
      setSubmittingJoinRequest(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const isValidType = file.type === 'application/pdf' || 
                           file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                           file.type === 'application/msword';
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        if (!isValidType) {
          alert(`${file.name} is not a valid file type. Only PDF and DOCX are allowed.`);
          return false;
        }
        if (!isValidSize) {
          alert(`${file.name} is too large. Maximum file size is 5MB.`);
          return false;
        }
        return true;
      });
      setUploadedFiles(prev => [...prev, ...validFiles].slice(0, 3)); // Max 3 files
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleReviewJoinRequest = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.put(`/classrooms/join-requests/${requestId}/review`, { status, role: 'STUDENT' });
      await fetchJoinRequests();
      // Reload page to clear cache and show updated member list
      window.location.reload();
    } catch (error) {
      console.error('Failed to review join request:', error);
    }
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

  // If user is not a member, show join request form
  if (!isMember) {
    return (
      <div className="min-h-screen py-6 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/classrooms')}
            className="flex items-center gap-2 text-slate-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            {settings.language === 'fil' ? 'Bumalik sa Classrooms' : 'Back to Classrooms'}
          </button>

          <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {classroom.name}
              </h1>
              {classroom.section && (
                <p className="text-lg text-cyan-300 mb-2">{classroom.section}</p>
              )}
              <p className="text-gray-400">{classroom.Course.title}</p>
              {teacher && (
                <p className="text-sm text-gray-500 mt-2">
                  {settings.language === 'fil' ? 'Guro' : 'Teacher'}: {teacher.User.firstName} {teacher.User.lastName}
                </p>
              )}
            </div>

            {hasJoinRequest ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-center">
                  {classroom.joinRequest?.status === 'PENDING' && (
                    <>
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {settings.language === 'fil' ? 'Naghihintay ng Approval' : 'Pending Approval'}
                      </h3>
                      <p className="text-gray-400">
                        {settings.language === 'fil' 
                          ? 'Ang iyong kahilingan ay naghihintay ng pagsusuri ng guro.'
                          : 'Your join request is waiting for teacher approval.'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {settings.language === 'fil' ? 'Isinumite noong' : 'Submitted on'}: {new Date(classroom.joinRequest!.createdAt).toLocaleDateString()}
                      </p>
                    </>
                  )}
                  {classroom.joinRequest?.status === 'REJECTED' && (
                    <>
                      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {settings.language === 'fil' ? 'Tinanggihan ang Kahilingan' : 'Request Rejected'}
                      </h3>
                      <p className="text-gray-400 mb-4">
                        {settings.language === 'fil' 
                          ? 'Ang iyong kahilingan ay tinanggihan ng guro. Maaari kang magsumite ng bagong kahilingan.'
                          : 'Your join request was rejected. You can submit a new request.'}
                      </p>
                      <button
                        onClick={handleSubmitJoinRequest}
                        disabled={submittingJoinRequest}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50"
                      >
                        {submittingJoinRequest ? (
                          settings.language === 'fil' ? 'Isinusumite...' : 'Submitting...'
                        ) : (
                          settings.language === 'fil' ? 'Magsumite Ulit' : 'Resubmit Request'
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {settings.language === 'fil' ? 'Mensahe (Opsyonal)' : 'Message (Optional)'}
                  </label>
                  <textarea
                    value={joinRequestMessage}
                    onChange={(e) => setJoinRequestMessage(e.target.value)}
                    rows={4}
                    placeholder={settings.language === 'fil' 
                      ? 'Ipakilala ang iyong sarili o magbigay ng dahilan kung bakit gusto mong sumali...'
                      : 'Introduce yourself or provide a reason why you want to join...'}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {settings.language === 'fil' ? 'Mag-upload ng Proof of Enrollment (PDF/DOCX)' : 'Upload Proof of Enrollment (PDF/DOCX)'}
                  </label>
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-cyan-500/50 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-300 mb-1">
                        {settings.language === 'fil' ? 'I-click upang mag-upload' : 'Click to upload'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {settings.language === 'fil' ? 'PDF o DOCX (Max 5MB, hanggang 3 files)' : 'PDF or DOCX (Max 5MB, up to 3 files)'}
                      </p>
                    </label>
                  </div>

                  {/* Uploaded Files Preview */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-cyan-400" />
                            <div>
                              <p className="text-sm text-white font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmitJoinRequest}
                  disabled={submittingJoinRequest || uploadedFiles.length === 0}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingJoinRequest ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {settings.language === 'fil' ? 'Isinusumite...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      {settings.language === 'fil' ? 'Magsumite ng Kahilingan na Sumali' : 'Submit Join Request'}
                    </>
                  )}
                </button>
                {uploadedFiles.length === 0 && (
                  <p className="text-sm text-center text-yellow-400">
                    {settings.language === 'fil'
                      ? '⚠️ Kailangan ang proof of enrollment para magsumite'
                      : '⚠️ Proof of enrollment is required to submit'}
                  </p>
                )}
                <p className="text-sm text-center text-gray-500">
                  {settings.language === 'fil'
                    ? 'Susuriin ng guro ang iyong kahilingan at mga dokumento. Makakatanggap ka ng notification kapag naaprubahan.'
                    : 'The teacher will review your request and documents. You will be notified when approved.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'calendar'
                ? 'text-cyan-500 border-b-2 border-cyan-500'
                : 'text-slate-600 dark:text-gray-400 hover:text-cyan-500'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            {settings.language === 'fil' ? 'Kalendaryo' : 'Calendar'}
          </button>
          {isTeacher && (
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === 'requests'
                  ? 'text-cyan-500 border-b-2 border-cyan-500'
                  : 'text-slate-600 dark:text-gray-400 hover:text-cyan-500'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              {settings.language === 'fil' ? 'Mga Kahilingan' : 'Join Requests'}
              {joinRequests.filter(r => r.status === 'PENDING').length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {joinRequests.filter(r => r.status === 'PENDING').length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'stream' && (
            <div className="space-y-6">
              {/* Post Type Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    postFilter === 'all'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {settings.language === 'fil' ? 'Lahat' : 'All'}
                </button>
                <button
                  onClick={() => handleFilterChange('ANNOUNCEMENT')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    postFilter === 'ANNOUNCEMENT'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  📢 {settings.language === 'fil' ? 'Anunsyo' : 'Announcements'}
                </button>
                <button
                  onClick={() => handleFilterChange('ASSIGNMENT')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    postFilter === 'ASSIGNMENT'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  ✍️ {settings.language === 'fil' ? 'Takdang-aralin' : 'Assignments'}
                </button>
                <button
                  onClick={() => handleFilterChange('PROJECT')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    postFilter === 'PROJECT'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  📁 {settings.language === 'fil' ? 'Proyekto' : 'Projects'}
                </button>
                <button
                  onClick={() => handleFilterChange('QUIZ')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    postFilter === 'QUIZ'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  📝 {settings.language === 'fil' ? 'Pagsusulit' : 'Quizzes'}
                </button>
                <button
                  onClick={() => handleFilterChange('EXAMINATION')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                    postFilter === 'EXAMINATION'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  📖 {settings.language === 'fil' ? 'Eksamen' : 'Exams'}
                </button>
              </div>
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
                    <div className="absolute top-full left-0 right-0 mt-2 dropdown-menu z-10 max-h-96 overflow-y-auto">
                      <div className="p-2">
                        <button onClick={() => { setTaskType('ANNOUNCEMENT'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">
                          📢 {settings.language === 'fil' ? 'Anunsyo' : 'Announcement'}
                        </button>
                        
                        <div className="dropdown-header">{settings.language === 'fil' ? 'Pangunahing Gawain' : 'Major Academic Work'}</div>
                        <button onClick={() => { setTaskType('PROJECT'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">📁 Project</button>
                        <button onClick={() => { setTaskType('CAPSTONE_PROJECT'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">🎓 Capstone Project</button>
                        <button onClick={() => { setTaskType('THESIS'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">📚 Thesis</button>
                        <button onClick={() => { setTaskType('RESEARCH_PAPER'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">📄 Research Paper</button>
                        <button onClick={() => { setTaskType('CASE_STUDY'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">🔍 Case Study</button>
                        
                        <div className="dropdown-header">{settings.language === 'fil' ? 'Gawain sa Kurso' : 'Coursework'}</div>
                        <button onClick={() => { setTaskType('ASSIGNMENT'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">✍️ Assignment</button>
                        <button onClick={() => { setTaskType('HOMEWORK'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">📝 Homework</button>
                        <button onClick={() => { setTaskType('SEATWORK'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">🪑 Seatwork</button>
                        <button onClick={() => { setTaskType('WORKSHEET'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">📋 Worksheet</button>
                        
                        <div className="dropdown-header">{settings.language === 'fil' ? 'Aktibidad' : 'Activities'}</div>
                        <button onClick={() => { setTaskType('ACTIVITY'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">🎯 Activity</button>
                        <button onClick={() => { setTaskType('GROUP_ACTIVITY'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">👥 Group Activity</button>
                        <button onClick={() => { setTaskType('LABORATORY_ACTIVITY'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">🧪 Laboratory Activity</button>
                        
                        <div className="dropdown-header">{settings.language === 'fil' ? 'Pagsusulit' : 'Assessments'}</div>
                        <button onClick={() => { setTaskType('QUIZ'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">📝 Quiz</button>
                        <button onClick={() => { setTaskType('EXAMINATION'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">📖 Examination</button>
                        <button onClick={() => { setTaskType('MIDTERM_EXAM'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">📗 Midterm Exam</button>
                        <button onClick={() => { setTaskType('FINAL_EXAM'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">📕 Final Exam</button>
                        
                        <div className="dropdown-header">{settings.language === 'fil' ? 'Presentasyon' : 'Presentations'}</div>
                        <button onClick={() => { setTaskType('PRESENTATION'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">🎤 Presentation</button>
                        <button onClick={() => { setTaskType('ORAL_PRESENTATION'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">🗣️ Oral Presentation</button>
                        <button onClick={() => { setTaskType('VIDEO_PRESENTATION'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">🎥 Video Presentation</button>
                        
                        <div className="dropdown-header">{settings.language === 'fil' ? 'Online' : 'Online Tasks'}</div>
                        <button onClick={() => { setTaskType('ONLINE_ACTIVITY'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">💻 Online Activity</button>
                        <button onClick={() => { setTaskType('FORUM_POST'); setShowAnnouncementModal(true); setShowTaskDropdown(false); }} className="dropdown-item">💬 Forum Post</button>
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
                <div className="space-y-6">
                  {visiblePosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      onPin={handlePinPost}
                      onReact={handleReaction}
                      onComment={(postId) => handleAddComment(postId)}
                      onClick={() => openPostModal(post)}
                      canEdit={post.Author.id === user?.id || isTeacher}
                      canDelete={post.Author.id === user?.id || isTeacher}
                      canPin={isTeacher}
                      commentText={commentText[post.id] || ''}
                      onCommentChange={(text) => setCommentText(prev => ({ ...prev, [post.id]: text }))}
                      submittingComment={submittingComment[post.id] || false}
                    />
                  ))}
                  
                  {/* Load More Button */}
                  {hasMorePosts && (
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMorePosts}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
                    >
                      {loadingMorePosts ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{settings.language === 'fil' ? 'Naglo-load...' : 'Loading...'}</span>
                        </div>
                      ) : (
                        settings.language === 'fil' ? 'Mag-load ng Higit Pa' : 'Load More'
                      )}
                    </button>
                  )}
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

          {activeTab === 'calendar' && (
            <ClassroomCalendar
              classroomId={classroom.id}
              isTeacher={isTeacher}
              onCreateMeeting={() => setShowCreateMeetingModal(true)}
              onViewMeeting={(meeting) => {
                setSelectedMeeting(meeting);
                setShowMeetingDetailsModal(true);
              }}
            />
          )}

          {activeTab === 'requests' && isTeacher && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  {settings.language === 'fil' ? 'Mga Kahilingan na Sumali' : 'Join Requests'}
                </h3>
                {loadingJoinRequests ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  </div>
                ) : joinRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-400">
                      {settings.language === 'fil' ? 'Walang mga kahilingan' : 'No join requests'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinRequests.map((request) => (
                      <div key={request.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {request.User.firstName[0]}{request.User.lastName[0]}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-white">
                                  {request.User.firstName} {request.User.lastName}
                                </p>
                                {request.status === 'PENDING' && (
                                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Pending
                                  </span>
                                )}
                                {request.status === 'APPROVED' && (
                                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Approved
                                  </span>
                                )}
                                {request.status === 'REJECTED' && (
                                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
                                    <XCircle className="w-3 h-3" /> Rejected
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-400 mb-2">{request.User.email}</p>
                              {request.message && (
                                <p className="text-sm text-gray-300 bg-white/5 rounded-lg p-3 mb-2">
                                  {request.message}
                                </p>
                              )}
                              {request.attachments && request.attachments.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs font-semibold text-gray-400 mb-2">
                                    {settings.language === 'fil' ? 'Mga Naka-attach na File:' : 'Attached Files:'}
                                  </p>
                                  <div className="space-y-1">
                                    {request.attachments.map((file: string, idx: number) => (
                                      <a
                                        key={idx}
                                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 bg-white/5 rounded-lg p-2 transition-colors"
                                      >
                                        <FileText className="w-4 h-4" />
                                        <span>{file.split('/').pop()}</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-gray-500">
                                {settings.language === 'fil' ? 'Isinumite noong' : 'Submitted on'}: {new Date(request.createdAt).toLocaleDateString(settings.language === 'fil' ? 'fil-PH' : 'en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                              {request.reviewedAt && (
                                <p className="text-xs text-gray-500">
                                  {settings.language === 'fil' ? 'Sinuri noong' : 'Reviewed on'}: {new Date(request.reviewedAt).toLocaleDateString(settings.language === 'fil' ? 'fil-PH' : 'en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                          {request.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReviewJoinRequest(request.id, 'APPROVED')}
                                className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-semibold transition-all flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                {settings.language === 'fil' ? 'Aprubahan' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleReviewJoinRequest(request.id, 'REJECTED')}
                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold transition-all flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                {settings.language === 'fil' ? 'Tanggihan' : 'Reject'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

              {/* Post Title */}
              {selectedPost.title && (
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white">{selectedPost.title}</h2>
                </div>
              )}

              {/* Post Content */}
              <div className="mb-6">
                <p className="text-gray-200 text-lg whitespace-pre-wrap">{selectedPost.content}</p>
              </div>

              {/* Post Metadata */}
              {(selectedPost.dueDate || selectedPost.points) && (
                <div className="flex gap-4 mb-6">
                  {selectedPost.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(selectedPost.dueDate).toLocaleDateString(settings.language === 'fil' ? 'fil-PH' : 'en-US')}</span>
                    </div>
                  )}
                  {selectedPost.points && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <span>{selectedPost.points} {settings.language === 'fil' ? 'puntos' : 'points'}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Images Display */}
              {selectedPost.images && selectedPost.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {settings.language === 'fil' ? 'Mga Larawan' : 'Images'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedPost.images.map((image: string, idx: number) => (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden ${
                          selectedPost.images.length === 1 ? 'col-span-2' : ''
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Post image ${idx + 1}`}
                          className="w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(image, '_blank');
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments Display */}
              {selectedPost.attachments && Array.isArray(selectedPost.attachments) && selectedPost.attachments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {settings.language === 'fil' ? 'Mga Attachment' : 'Attachments'}
                  </h3>
                  <div className="space-y-2">
                    {selectedPost.attachments.map((file: any, idx: number) => (
                      <a
                        key={idx}
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${file.path || file.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{file.filename || file.name}</p>
                          {file.size && (
                            <p className="text-gray-400 text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

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
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-300">{settings.language === 'fil' ? 'Larawan' : 'Images'}</span>
                    <span className="text-xs text-gray-500">({imageFiles.length}/5)</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleImageSelect} 
                      className="hidden" 
                      disabled={imageFiles.length >= 5}
                    />
                  </label>
                  
                  <label className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm text-gray-300">{settings.language === 'fil' ? 'File' : 'Files'}</span>
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

                {/* Image Preview */}
                {imageFiles.length > 0 && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">{imageFiles.length} {settings.language === 'fil' ? 'larawan' : 'image(s)'}</p>
                    <div className="grid grid-cols-5 gap-2">
                      {imageFiles.map((file, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

        {/* Edit Post Modal */}
        {showEditPostModal && editingPost && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {settings.language === 'fil' ? 'I-edit ang Post' : 'Edit Post'}
                </h3>
                <button
                  onClick={() => {
                    setShowEditPostModal(false);
                    setEditingPost(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {editingPost.type !== 'ANNOUNCEMENT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {settings.language === 'fil' ? 'Pamagat' : 'Title'}
                    </label>
                    <input
                      type="text"
                      value={editPostForm.title}
                      onChange={(e) => setEditPostForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {settings.language === 'fil' ? 'Nilalaman' : 'Content'}
                  </label>
                  <textarea
                    value={editPostForm.content}
                    onChange={(e) => setEditPostForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                {editingPost.type !== 'ANNOUNCEMENT' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {settings.language === 'fil' ? 'Deadline' : 'Due Date'}
                      </label>
                      <input
                        type="datetime-local"
                        value={editPostForm.dueDate}
                        onChange={(e) => setEditPostForm(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {settings.language === 'fil' ? 'Puntos' : 'Points'}
                      </label>
                      <input
                        type="number"
                        value={editPostForm.points}
                        onChange={(e) => setEditPostForm(prev => ({ ...prev, points: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEditPostModal(false);
                      setEditingPost(null);
                    }}
                    className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-all"
                  >
                    {settings.language === 'fil' ? 'Kanselahin' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSaveEditPost}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    {settings.language === 'fil' ? 'I-save' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Modals */}
      {showCreateMeetingModal && (
        <CreateMeetingModal
          classroomId={classroom.id}
          onClose={() => setShowCreateMeetingModal(false)}
          onSuccess={() => {
            setShowCreateMeetingModal(false);
            if (activeTab === 'calendar') {
              window.location.reload();
            }
          }}
        />
      )}

      {showMeetingDetailsModal && selectedMeeting && (
        <MeetingDetailsModal
          meeting={selectedMeeting}
          classroomId={classroom.id}
          isTeacher={isTeacher}
          currentUserId={user?.id || ''}
          onClose={() => {
            setShowMeetingDetailsModal(false);
            setSelectedMeeting(null);
          }}
          onUpdate={() => {
            if (activeTab === 'calendar') {
              window.location.reload();
            }
          }}
        />
      )}
    </div>
  );
}
