// client/src/pages/Courses.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import { BookOpen, Clock, Users, Search, Plus, Filter, X } from 'lucide-react';

export default function Courses() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    level: 'BEGINNER',
    duration: 60,
    tags: '',
  });

  const canCreateCourse = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.tags?.some((t: string) => t.toLowerCase().includes(query))
      );
    }
    if (levelFilter) {
      filtered = filtered.filter(c => c.level === levelFilter);
    }
    setFilteredCourses(filtered);
  }, [courses, searchQuery, levelFilter]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.courses || []);
      setFilteredCourses(response.data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title.trim() || !newCourse.description.trim()) {
      showToast({ type: 'warning', title: 'Missing Fields', message: 'Title and description are required' });
      return;
    }
    setCreating(true);
    try {
      await api.post('/courses', {
        ...newCourse,
        tags: newCourse.tags.split(',').map(t => t.trim()).filter(t => t),
      });
      setShowCreateModal(false);
      setNewCourse({ title: '', description: '', level: 'BEGINNER', duration: 60, tags: '' });
      showToast({ type: 'success', title: 'Course Created', message: 'Your new course has been created successfully!' });
      fetchCourses();
    } catch (error) {
      console.error('Failed to create course:', error);
      showToast({ type: 'error', title: 'Creation Failed', message: 'Failed to create course. Please try again.' });
    } finally {
      setCreating(false);
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
    <div className="py-8 lg:py-10">

     {/* Hero Header */}
      <div className="text-center mb-8 lg:mb-10 px-6">
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 pb-1 md:pb-2 leading-tight md:leading-snug inline-block">
          Explore Courses
        </h1>
        <p className="text-xl md:text-2xl text-slate-700 dark:text-gray-300 font-light tracking-wide max-w-4xl mx-auto">
          Unlock the future of learning — AI-powered, personalized, and built for you.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
            {canCreateCourse && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50"
              >
                <Plus className="w-5 h-5" />
                Add Course
              </button>
            )}
          </div>
        </div>
        {(searchQuery || levelFilter) && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredCourses.length} of {courses.length} courses</span>
            {(searchQuery || levelFilter) && (
              <button
                onClick={() => { setSearchQuery(''); setLevelFilter(''); }}
                className="ml-2 text-cyan-400 hover:underline flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
        {filteredCourses.map((course) => (
          <Link key={course.id} to={`/courses/${course.id}`} className="group block">
            <div className="relative h-full bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.04] hover:shadow-cyan-500/30 hover:border-cyan-500/50">

              {/* Course Header Image */}
              <div className="h-56 relative flex items-center justify-center bg-gradient-to-br from-cyan-600/30 via-purple-600/20 to-indigo-700/30">
                <div className="absolute inset-0 bg-black/25"></div>
                <div className="relative z-10 p-8 bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <BookOpen className="w-20 h-20 text-cyan-400 drop-shadow-2xl" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </div>

              {/* Card Content */}
              <div className="p-7">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6">
                  {course.description}
                </p>

                {/* Stats */}
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
                <div className="flex justify-end">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-sm ${
                    course.level === 'Beginner' 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60' 
                      : course.level === 'Intermediate'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/60'
                      : 'bg-pink-500/20 text-pink-300 border-pink-500/60'
                  }`}>
                    {course.level}
                  </span>
                </div>
              </div>

              {/* Hover Shine Effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 translate-x-full group-hover:translate-x-0 transition-transform duration-1000 pointer-events-none"></div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-32">
          <BookOpen className="w-24 h-24 mx-auto text-slate-400 dark:text-gray-600 mb-8" />
          <p className="text-2xl text-slate-700 dark:text-gray-500">
            {searchQuery || levelFilter ? 'No courses match your filters.' : 'No courses available yet.'}
          </p>
          <p className="text-slate-600 dark:text-gray-600 mt-4">
            {searchQuery || levelFilter ? 'Try adjusting your search criteria.' : 'New courses are being prepared!'}
          </p>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-2xl bg-gray-900/95 border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Course Title *</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="e.g., Introduction to Programming"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="Describe what students will learn..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Level</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newCourse.tags}
                  onChange={(e) => setNewCourse({ ...newCourse, tags: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="e.g., programming, python, beginner"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Course'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-foreground font-bold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}