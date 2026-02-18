// client/src/pages/Classrooms.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Users, Plus, LogIn, Loader2, Search, X, BookOpen, AlertCircle } from 'lucide-react';
import api from '../lib/api';

interface Classroom {
  id: string;
  name: string;
  section?: string;
  description?: string;
  inviteCode: string;
  Course: {
    title: string;
  };
  ClassroomMembers: Array<{
    role: string;
    User: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  _count: {
    ClassroomMembers: number;
    ClassroomPosts: number;
  };
}

interface CourseOption {
  id: string;
  title: string;
}

export default function Classrooms() {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBrowse, setLoadingBrowse] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-room' | 'browse'>('my-room');
  const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Create modal state
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [createForm, setCreateForm] = useState({ courseId: '', name: '', section: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Join modal state
  const [inviteCode, setInviteCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    fetchClassrooms();
    if (activeTab === 'browse') {
      fetchAllClassrooms();
    }
  }, [activeTab]);

  const fetchClassrooms = async () => {
    try {
      const res = await api.get('/classrooms');
      setClassrooms(res.data);
    } catch (error) {
      console.error('Failed to fetch classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClassrooms = async () => {
    setLoadingBrowse(true);
    try {
      const res = await api.get('/classrooms/browse/all');
      setAllClassrooms(res.data);
    } catch (error) {
      console.error('Failed to fetch all classrooms:', error);
    } finally {
      setLoadingBrowse(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.map((c: any) => ({ id: c.id, title: c.title })));
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleCreateClassroom = async () => {
    if (!createForm.courseId || !createForm.name.trim()) {
      setCreateError(settings.language === 'fil' ? 'Punan ang course at pangalan' : 'Course and name are required');
      return;
    }
    setCreateLoading(true);
    setCreateError('');
    try {
      await api.post('/classrooms', createForm);
      setShowCreateModal(false);
      setCreateForm({ courseId: '', name: '', section: '', description: '' });
      fetchClassrooms();
    } catch (error: any) {
      setCreateError(error.response?.data?.error || 'Failed to create classroom');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinClassroom = async () => {
    if (!inviteCode.trim()) {
      setJoinError(settings.language === 'fil' ? 'Ilagay ang invite code' : 'Please enter an invite code');
      return;
    }
    setJoinLoading(true);
    setJoinError('');
    try {
      const res = await api.post('/classrooms/join', { inviteCode: inviteCode.trim() });
      setShowJoinModal(false);
      setInviteCode('');
      fetchClassrooms();
      if (res.data?.classroomId) {
        navigate(`/classrooms/${res.data.classroomId}`);
      }
    } catch (error: any) {
      setJoinError(error.response?.data?.error || 'Failed to join classroom');
    } finally {
      setJoinLoading(false);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreateError('');
    setCreateForm({ courseId: '', name: '', section: '', description: '' });
    fetchCourses();
  };

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const displayedClassrooms = activeTab === 'my-room' ? classrooms : allClassrooms;
  const filteredClassrooms = displayedClassrooms.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) ||
      c.Course.title.toLowerCase().includes(q) ||
      (c.section || '').toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
              {settings.language === 'fil' ? 'Mga Classroom' : 'Classrooms'}
            </h1>
            <p className="text-lg text-slate-600 dark:text-gray-400">
              {settings.language === 'fil' 
                ? 'Pamahalaan at mag-browse ng mga virtual classroom' 
                : 'Manage and browse virtual classrooms'}
            </p>
          </div>
          
          <div className="flex gap-3">
            {isTeacher && (
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                <Plus className="w-5 h-5" />
                {settings.language === 'fil' ? 'Gumawa' : 'Create'}
              </button>
            )}
            
            <button
              onClick={() => { setShowJoinModal(true); setJoinError(''); setInviteCode(''); }}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
            >
              <LogIn className="w-5 h-5" />
              {settings.language === 'fil' ? 'Sumali' : 'Join'}
            </button>
          </div>
        </div>

        {/* Search + Tabs */}
        <div className="mt-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={settings.language === 'fil' ? 'Maghanap ng classroom...' : 'Search classrooms...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
            />
          </div>
          <div className="flex gap-2 border-b border-slate-200 dark:border-white/10">
            <button
              onClick={() => setActiveTab('my-room')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'my-room'
                  ? 'text-cyan-500 border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {settings.language === 'fil' ? 'Aking Silid' : 'My Room'}
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'browse'
                  ? 'text-cyan-500 border-b-2 border-cyan-500'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {settings.language === 'fil' ? 'Mag-browse' : 'Browse'}
            </button>
          </div>
        </div>
      </div>

      {/* Classrooms Grid */}
      <div className="max-w-7xl mx-auto mt-6">
        {(activeTab === 'browse' && loadingBrowse) ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
          </div>
        ) : filteredClassrooms.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-20 h-20 mx-auto text-slate-300 dark:text-gray-600 mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {searchQuery
                ? (settings.language === 'fil' ? 'Walang nahanap' : 'No Results Found')
                : (settings.language === 'fil' ? 'Walang Classroom' : 'No Classrooms Yet')}
            </h3>
            <p className="text-slate-500 dark:text-gray-400 mb-6">
              {searchQuery
                ? (settings.language === 'fil' ? 'Subukan ang ibang keyword' : 'Try a different search term')
                : (settings.language === 'fil' ? 'Gumawa o sumali sa isang classroom para magsimula' : 'Create or join a classroom to get started')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClassrooms.map((classroom) => {
              const teacher = classroom.ClassroomMembers.find(m => m.role === 'TEACHER');
              return (
                <Link
                  key={classroom.id}
                  to={`/classrooms/${classroom.id}`}
                  className="block bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-cyan-500 transition-colors">
                        {classroom.name}
                      </h3>
                      {classroom.section && (
                        <p className="text-sm text-slate-500 dark:text-gray-400">{classroom.section}</p>
                      )}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">{classroom.Course.title}</p>

                  {teacher && (
                    <p className="text-sm text-slate-400 dark:text-gray-500 mb-4">
                      {teacher.User.firstName} {teacher.User.lastName}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-4 text-sm text-slate-400 dark:text-gray-400">
                      <span>{classroom._count.ClassroomMembers} {settings.language === 'fil' ? 'miyembro' : 'members'}</span>
                      <span>{classroom._count.ClassroomPosts} {settings.language === 'fil' ? 'post' : 'posts'}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Classroom Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {settings.language === 'fil' ? 'Gumawa ng Classroom' : 'Create Classroom'}
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {createError}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {settings.language === 'fil' ? 'Kurso' : 'Course'} *
                </label>
                <select
                  value={createForm.courseId}
                  onChange={e => setCreateForm({ ...createForm, courseId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="" className="bg-white dark:bg-slate-800">
                    {settings.language === 'fil' ? 'Pumili ng kurso...' : 'Select a course...'}
                  </option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id} className="bg-white dark:bg-slate-800">{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {settings.language === 'fil' ? 'Pangalan ng Classroom' : 'Classroom Name'} *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder={settings.language === 'fil' ? 'hal. BIO 101 - Section A' : 'e.g. BIO 101 - Section A'}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {settings.language === 'fil' ? 'Seksyon' : 'Section'}
                </label>
                <input
                  type="text"
                  value={createForm.section}
                  onChange={e => setCreateForm({ ...createForm, section: e.target.value })}
                  placeholder={settings.language === 'fil' ? 'hal. 1A' : 'e.g. 1A'}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {settings.language === 'fil' ? 'Paglalarawan' : 'Description'}
                </label>
                <textarea
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                  placeholder={settings.language === 'fil' ? 'Opsyonal na paglalarawan...' : 'Optional description...'}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  {settings.language === 'fil' ? 'Kanselahin' : 'Cancel'}
                </button>
                <button
                  onClick={handleCreateClassroom}
                  disabled={createLoading || !createForm.courseId || !createForm.name.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {createLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {settings.language === 'fil' ? 'Gumawa' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Classroom Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {settings.language === 'fil' ? 'Sumali sa Classroom' : 'Join Classroom'}
              </h2>
              <button onClick={() => setShowJoinModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {settings.language === 'fil' 
                ? 'Ilagay ang invite code na ibinigay ng iyong guro para sumali sa classroom.' 
                : 'Enter the invite code provided by your teacher to join the classroom.'}
            </p>

            {joinError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {joinError}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {settings.language === 'fil' ? 'Invite Code' : 'Invite Code'} *
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123XY"
                  onKeyDown={e => { if (e.key === 'Enter') handleJoinClassroom(); }}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 text-center text-lg font-mono tracking-widest"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                >
                  {settings.language === 'fil' ? 'Kanselahin' : 'Cancel'}
                </button>
                <button
                  onClick={handleJoinClassroom}
                  disabled={joinLoading || !inviteCode.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {joinLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {settings.language === 'fil' ? 'Sumali' : 'Join'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
