// client/src/pages/Courses.tsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { BookOpen, Clock, Users, Plus, Pencil, Trash2, X, CheckCircle } from 'lucide-react';

interface CourseFromAPI {
  id: string;
  title: string;
  description: string;
  duration: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  tags?: string[];
  _count?: { enrollments: number };
  isEnrolled?: boolean;     // ← NOW SUPPORTED
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  };
}

type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
type CourseLevelBackend = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export default function Courses() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<CourseFromAPI | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [level, setLevel] = useState<CourseLevelBackend>('BEGINNER');
  const [tags, setTags] = useState<string>('');

  const [actionLoading, setActionLoading] = useState(false);

  const normalizeLevel = (rawLevel: string): CourseLevel => {
    const upper = rawLevel.toUpperCase();
    switch (upper) {
      case 'BEGINNER': return 'Beginner';
      case 'INTERMEDIATE': return 'Intermediate';
      case 'ADVANCED': return 'Advanced';
      case 'EXPERT': return 'Expert';
      default: return 'Beginner';
    }
  };

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses');
      const rawCourses = res.data.courses || [];

      const normalized = rawCourses.map((c: any) => ({
        ...c,
        level: normalizeLevel(c.level),
      }));

      setCourses(normalized);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      alert('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDuration('');
    setLevel('BEGINNER');
    setTags('');
    setCurrentCourse(null);
    setIsEditMode(false);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (course: CourseFromAPI) => {
    setTitle(course.title);
    setDescription(course.description || '');
    setDuration(course.duration || '');
    setLevel(course.level.toUpperCase() as CourseLevelBackend);
    
    // FIXED: safely access tags (now exists in interface)
    setTags(course.tags?.join(', ') || '');
    
    setCurrentCourse(course);
    setIsEditMode(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || duration === '') {
      alert('Please fill in all required fields');
      return;
    }

    setActionLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        duration: Number(duration),
        level,
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(t => t.length > 0),
      };

      if (isEditMode && currentCourse) {
        await api.put(`/courses/${currentCourse.id}`, payload);
        alert('Course updated successfully!');
      } else {
        await api.post('/courses', payload);
        alert('Course created successfully!');
      }

      setModalOpen(false);
      resetForm();
      await fetchCourses();
    } catch (error: any) {
      console.error('Course save error:', error);
      const msg = error.response?.data?.error || 'Failed to save course';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This cannot be undone.')) return;

    try {
      await api.delete(`/courses/${id}`);
      alert('Course deleted successfully');
      await fetchCourses();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete course');
    }
  };

 if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="py-8 lg:py-10 relative">
      {/* Hero Header */}
      <div className="text-center mb-12 lg:mb-14 px-6">
        <div className="relative max-w-7xl mx-auto flex justify-center items-center">
          <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 pb-1 md:pb-2 leading-tight md:leading-snug">
            Explore Courses
          </h1>

          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="absolute right-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-cyan-500/40 hover:scale-105 transition-all"
            >
              <Plus size={20} />
              New Course
            </button>
          )}
        </div>


        <p className="text-xl md:text-2xl text-slate-700 dark:text-gray-300 font-light tracking-wide max-w-4xl mx-auto mt-4">
          Unlock the future of learning — AI-powered, personalized, and built for you.
        </p>
      </div>

      {/* Course Grid - UPDATED with Enrolled badge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
        {courses.map((course) => (
          <div key={course.id} className="group relative">
            <Link to={`/courses/${course.id}`} className="block h-full">
              <div className="relative h-full bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.04] hover:shadow-cyan-500/30 hover:border-cyan-500/50">
                <div className="h-56 relative flex items-center justify-center bg-gradient-to-br from-cyan-600/30 via-purple-600/20 to-indigo-700/30">
                  <div className="absolute inset-0 bg-black/25"></div>
                  <div className="relative z-10 p-8 bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <BookOpen className="w-20 h-20 text-cyan-400 drop-shadow-2xl" />
                  </div>
                </div>

                <div className="p-7">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm mb-5">
                    <span className="flex items-center gap-2 text-cyan-400">
                      <Clock className="w-5 h-5" />
                      <span className="text-slate-700 dark:text-gray-300">
                        {course.duration ? `${Math.floor(course.duration / 60)}h` : 'Self-paced'}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-purple-400">
                      <Users className="w-5 h-5" />
                      <span className="text-slate-700 dark:text-gray-300">
                        {course._count?.enrollments || 0} learners
                      </span>
                    </span>
                  </div>

                  {/* Level Badge */}
                  <div className="flex justify-between items-center">
                    <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-sm ${
                      course.level === 'Beginner' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60' :
                      course.level === 'Intermediate' ? 'bg-purple-500/20 text-purple-300 border-purple-500/60' :
                      course.level === 'Advanced' ? 'bg-pink-500/20 text-pink-300 border-pink-500/60' :
                      'bg-indigo-500/20 text-indigo-300 border-indigo-500/60'
                    }`}>
                      {course.level}
                    </span>

                    {/* NEW: Enrolled Badge */}
                    {course.isEnrolled && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold flex items-center gap-1 border border-green-500/30">
                        <CheckCircle size={12} />
                        Enrolled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>

            {isAdmin && (
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/AdminModules/${course.id}`);
                  }}
                  className="p-2 bg-cyan-600/80 hover:bg-cyan-700 text-white rounded-lg transition-colors"
                  title="Manage Modules"
                >
                  <BookOpen size={18} />
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openEditModal(course);
                  }}
                  className="p-2 bg-purple-600/80 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  title="Edit course"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(course.id);
                  }}
                  className="p-2 bg-red-600/80 hover:bg-red-700 text-white rounded-lg transition-colors"
                  title="Delete course"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {courses.length === 0 && !loading && (
        <div className="text-center py-32">
          <BookOpen className="w-24 h-24 mx-auto text-slate-400 dark:text-gray-600 mb-8" />
          <p className="text-2xl text-slate-700 dark:text-gray-500">No courses available yet.</p>
          <p className="text-slate-600 dark:text-gray-600 mt-4">
            {isAdmin ? 'Create your first course using the button above!' : 'New courses are being prepared!'}
          </p>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-white">
                {isEditMode ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-white">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-slate-300 mb-2 font-medium">Course Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Introduction to Web Development"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-medium">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="What will students learn?"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Duration (minutes) *</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : '')}
                    min="1"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="180"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-2 font-medium">Level *</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as CourseLevelBackend)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-2 font-medium">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. javascript, react, web-development"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); resetForm(); }}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-cyan-500/40 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>Creating...</>
                  ) : isEditMode ? (
                    'Update Course'
                  ) : (
                    'Create Course'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}