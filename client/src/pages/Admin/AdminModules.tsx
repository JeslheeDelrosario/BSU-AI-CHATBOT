// client/src/pages/Admin/AdminModules.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from "../../contexts/AuthContext";
import { BookOpen, Plus, Trash2, Loader2, Pencil, X } from 'lucide-react';
import api from '../../lib/api';

// Reusable button styles (consistent across the app)
const buttonStyles = `
  px-6 py-3 rounded-xl font-medium text-base transition-all duration-300
  shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40
  transform hover:scale-[1.02] active:scale-100
  focus:outline-none focus:ring-2 focus:ring-cyan-500/50
`;

interface Module {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  estTimeMin?: number | null;
  difficulty?: string | null;
  lessons?: { id: string }[]; // ← NEW: for counting lessons
}

export default function AdminModules() {
  const { user } = useAuth();
  const { courseId } = useParams<{ courseId: string }>();

  const [modules, setModules] = useState<Module[]>([]);
  const [courseTitle, setCourseTitle] = useState<string>('Course Management');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newOrder, setNewOrder] = useState<number | ''>('');
  const [newEstTime, setNewEstTime] = useState<number | ''>('');
  const [newDifficulty, setNewDifficulty] = useState('');

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOrder, setEditOrder] = useState<number | ''>('');
  const [editEstTime, setEditEstTime] = useState<number | ''>('');
  const [editDifficulty, setEditDifficulty] = useState('');

  // Add Lesson modal
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState('TEXT');
  const [lessonContent, setLessonContent] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loadingCourse, setLoadingCourse] = useState(true); // ← ADD THIS LINE

  const fetchModules = async () => {
    if (!courseId) return;
    setFetching(true);
    try {
      const res = await api.get(`/courses/${courseId}/modules`);
      setModules(res.data.modules || []);
    } catch (err) {
      console.error("Failed to fetch modules:", err);
      setModules([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN' || !courseId) return;

    const fetchData = async () => {
      try {
        console.log('Fetching course details for ID:', courseId);

        const courseRes = await api.get(`/courses/${courseId}`);
        console.log('Course API response:', courseRes.data);

        const courseData = courseRes.data.course;
        if (!courseData || !courseData.title) {
          setCourseTitle('Untitled Course');
        } else {
          setCourseTitle(courseData.title);
        }

        await fetchModules();
      } catch (err: any) {
        console.error('Failed to load course data:', err);
        setCourseTitle('Failed to load course');
      } finally {
        setLoadingCourse(false);
        setFetching(false);
      }
    };

    fetchData();
  }, [user?.role, courseId]); // fetchModules is called inside, no need to add it as dependency

  const openEditModal = (mod: Module) => {
    setEditingModule(mod);
    setEditTitle(mod.title);
    setEditDescription(mod.description || '');
    setEditOrder(mod.order);
    setEditEstTime(mod.estTimeMin || '');
    setEditDifficulty(mod.difficulty || '');
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingModule || !editTitle.trim() || editOrder === '') return;
    setLoading(true);
    try {
      await api.put(`/courses/modules/${editingModule.id}`, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        order: Number(editOrder),
        estTimeMin: editEstTime ? Number(editEstTime) : null,
        difficulty: editDifficulty || null,
      });
      setEditModalOpen(false);
      fetchModules();
    } catch (err) {
      alert("Failed to update module.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddLessonModal = (moduleId: string) => {
    setLessonModuleId(moduleId);
    setLessonTitle('');
    setLessonType('TEXT');
    setLessonContent('');
    setLessonModalOpen(true);
  };

  const saveNewLesson = async () => {
    if (!lessonModuleId || !lessonTitle.trim()) return alert('Title is required');
    setLoading(true);
    try {
      await api.post('/courses/lessons', {
        title: lessonTitle.trim(),
        type: lessonType,
        content: lessonContent.trim() || '',
        moduleId: lessonModuleId,
        courseId: courseId,
        order: 1,
        isPublished: true,
      });
      setLessonModalOpen(false);
      setLessonTitle('');
      setLessonType('TEXT');
      setLessonContent('');
      alert('Lesson created and attached to module!');
      fetchModules(); // Refresh to show updated count
    } catch (err: any) {
      console.error('Failed to create lesson:', err);
      alert(err.response?.data?.error || 'Failed to create lesson.');
    } finally {
      setLoading(false);
    }
  };

  const addModule = async () => {
    if (!newTitle.trim() || newOrder === '') {
      alert('Title and order are required');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/courses/${courseId}/modules`, {
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        order: Number(newOrder),
        estTimeMin: newEstTime ? Number(newEstTime) : null,
        difficulty: newDifficulty || null,
      });
      setNewTitle('');
      setNewDescription('');
      setNewOrder('');
      setNewEstTime('');
      setNewDifficulty('');
      fetchModules();
    } catch (err) {
      alert("Failed to add module.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteModule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module? This cannot be undone.')) return;
    try {
      await api.delete(`/courses/modules/${id}`);
      fetchModules();
    } catch (err) {
      alert("Failed to delete module.");
      console.error(err);
    }
  };

  if (loadingCourse || fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-cyan-500 animate-spin mx-auto mb-6" />
          <p className="text-xl text-muted-foreground">Loading course information...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-6">
            Restricted Access
          </h1>
          <p className="text-xl sm:text-2xl text-foreground font-bold">Admin Access Required</p>
        </div>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-5xl font-black text-foreground">Missing Course ID</h1>
          <p className="text-xl mt-4 text-muted-foreground">Please access this page from a valid course.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-10 lg:py-12 text-center mb-10">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-500" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent pb-1 md:pb-4 leading-tight md:leading-snug">
            Manage Modules
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mt-2">
            Course Title: {courseTitle}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12 space-y-10 lg:space-y-12">

        {/* Add New Module Card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border shadow-xl p-8 lg:p-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8 flex items-center gap-4">
            <Plus className="w-9 h-9 lg:w-10 lg:h-10 text-cyan-500" />
            Add New Module
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="text"
              placeholder="Module Title (e.g. HTML Basics)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addModule()}
              className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all text-base lg:text-lg"
            />
            <input
              type="number"
              placeholder="Order (e.g. 1)"
              value={newOrder}
              onChange={(e) => setNewOrder(e.target.value ? Number(e.target.value) : '')}
              className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all text-base lg:text-lg"
            />
            <button
              onClick={addModule}
              disabled={loading || !newTitle.trim() || newOrder === ''}
              className={`bg-gradient-to-r from-cyan-600 to-purple-600 text-white ${buttonStyles} flex items-center justify-center gap-3`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6" />
                  Add Module
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all text-base lg:text-lg"
            />
            <input
              type="number"
              placeholder="Estimated Time (minutes, optional)"
              value={newEstTime}
              onChange={(e) => setNewEstTime(e.target.value ? Number(e.target.value) : '')}
              className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all text-base lg:text-lg"
            />
          </div>
        </div>

        {/* Current Modules List */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="p-8 lg:p-10 border-b border-border bg-card/60">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Current Modules
              <span className="text-cyan-500 ml-4">({modules.length})</span>
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Modules organize lessons and quizzes in this course
            </p>
          </div>

          {fetching ? (
            <div className="p-16 lg:p-20 text-center">
              <Loader2 className="w-16 h-16 lg:w-20 lg:h-20 text-cyan-500 animate-spin mx-auto" />
              <p className="mt-6 text-xl lg:text-2xl text-muted-foreground">Loading modules...</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="p-16 lg:p-20 text-center">
              <div className="text-5xl lg:text-6xl mb-6 text-muted-foreground/60">No modules found</div>
              <p className="text-lg lg:text-xl text-muted-foreground">
                Start by adding your first module above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-6 lg:p-10">
              {modules.map((m) => (
                <div
                  key={m.id}
                  className="group relative bg-card/60 border border-border rounded-3xl p-7 lg:p-8 backdrop-blur-xl hover:border-cyan-500/50 hover:bg-card/90 transition-all duration-300"
                >
                  {/* Edit & Delete buttons */}
                  <div className="absolute top-5 right-5 flex gap-3">
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-3 bg-purple-600/20 border border-purple-500/40 rounded-xl text-purple-300 hover:bg-purple-600/30 hover:text-purple-200 transition-all"
                      title="Edit Module"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteModule(m.id)}
                      className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-300 hover:bg-red-600/30 hover:text-red-200 transition-all"
                      title="Delete Module"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground pr-16 leading-tight">
                    {m.title}
                  </h3>
                  <p className="text-lg text-cyan-500 mt-2">
                    Order: {m.order}
                  </p>

                  {m.description && (
                    <p className="mt-3 text-muted-foreground line-clamp-3">
                      {m.description}
                    </p>
                  )}

                  {/* NEW: Lesson count display */}
                  <p className="mt-2 text-sm text-gray-400">
                    {m.lessons?.length || 0} lessons attached
                  </p>

                  {/* Add Lesson Button */}
                  <button
                    onClick={() => openAddLessonModal(m.id)}
                    className={`mt-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white ${buttonStyles} flex items-center gap-2`}
                  >
                    <Plus className="w-5 h-5" />
                    Add Lesson
                  </button>

                  {/* Active Badge */}
                  <div className="mt-4 inline-block px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-cyan-500 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/30">
                    Active Module
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Module Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">Edit Module</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={28} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-muted-foreground mb-2 font-medium">Title *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-2 font-medium">Description (optional)</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-muted-foreground mb-2 font-medium">Order *</label>
                  <input
                    type="number"
                    value={editOrder}
                    onChange={(e) => setEditOrder(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-2 font-medium">Estimated Time (min, optional)</label>
                  <input
                    type="number"
                    value={editEstTime}
                    onChange={(e) => setEditEstTime(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-2 font-medium">Difficulty (optional)</label>
                <select
                  value={editDifficulty}
                  onChange={(e) => setEditDifficulty(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                >
                  <option value="">Select...</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className={`bg-slate-700 hover:bg-slate-600 text-white ${buttonStyles}`}
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={loading}
                  className={`bg-gradient-to-r from-cyan-600 to-purple-600 text-white ${buttonStyles} flex items-center gap-2`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Update Module'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {lessonModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground">Add New Lesson</h2>
              <button onClick={() => setLessonModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={28} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-muted-foreground mb-2 font-medium">Lesson Title *</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-2 font-medium">Type *</label>
                <select
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                >
                  <option value="TEXT">Text / Reading</option>
                  <option value="VIDEO">Video</option>
                  <option value="AUDIO">Audio</option>
                  <option value="INTERACTIVE">Interactive</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-2 font-medium">Content *</label>
                <textarea
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
                  placeholder="Write the lesson content here (text, markdown, or embed code)..."
                  required
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setLessonModalOpen(false)}
                  className={`bg-slate-700 hover:bg-slate-600 text-white ${buttonStyles}`}
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewLesson}
                  disabled={loading}
                  className={`bg-gradient-to-r from-cyan-600 to-purple-600 text-white ${buttonStyles} flex items-center gap-2`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Lesson'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}