// client/src/pages/CourseDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import { 
  BookOpen, Clock, Users, Play, CheckCircle, Lock, ArrowLeft, 
  Brain, Zap 
} from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Admin management states
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [showDeleteModuleConfirm, setShowDeleteModuleConfirm] = useState(false);
  const [showDeleteLessonConfirm, setShowDeleteLessonConfirm] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState<Array<{
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>>([]);

  // Form states
  const [newModule, setNewModule] = useState({ title: '', description: '' });
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    type: 'TEXT',
    duration: '',
    content: '',
    videoUrl: '',
    audioUrl: '',
    isPublished: false,
  });

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post('/courses/enroll', { courseId: id });

      // Optimistic update — show enrolled state immediately
      setIsEnrolled(true);

      const message = user?.role === 'ADMIN'
        ? 'You are now enrolled for testing! You can now access lessons and AI tutor features.'
        : 'Welcome to the course. Start learning now!';

      showToast({
        type: 'success',
        title: 'Enrolled Successfully!',
        message,
      });
    } catch (error: any) {
      // Handle "already enrolled" gracefully (treat as success)
      if (error.response?.status === 400 && error.response?.data?.error?.includes('Already enrolled')) {
        setIsEnrolled(true);
        showToast({
          type: 'info',
          title: 'Already Enrolled',
          message: 'You are already enrolled in this course. Enjoy learning!',
        });
      } else {
        showToast({
          type: 'error',
          title: 'Enrollment Failed',
          message: error.response?.data?.error || 'Failed to enroll. Please try again.',
        });
      }
    } finally {
      setEnrolling(false);
      await fetchCourseDetail(); // Always refresh to sync with server
    }
  };

  const fetchCourseDetail = async () => {
    try {
      const response = await api.get(`/courses/${id}`);

      setCourse(response.data.course);
      
      // Trust the server response for enrollment status
      setIsEnrolled(!!response.data.enrollment);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Now actually navigates when unlocked
  const handleLessonClick = (lesson: any) => {
    if (!isEnrolled) {
      showToast({ type: 'warning', title: 'Not Enrolled', message: 'Please enroll to access lessons.' });
      return;
    }

    if (!lesson.isUnlocked) {
      showToast({
        type: 'info',
        title: 'Lesson Locked',
        message: 'To unlock this lesson, complete the previous one with at least 85% score (if it was a quiz).',
      });
      return;
    }

    // Navigate to lesson viewer
    navigate(`/lessons/${lesson.id}`);
  };

  const handleCreateModule = async () => {
  if (!newModule.title.trim()) {
    return showToast({
      type: 'error',
      title: 'Missing Title',
      message: 'Module title is required'
    });
  }

    try {
      await api.post(`/courses/${id}/modules`, newModule);
      showToast({
        type: 'success',
        title: 'Module Created',
        message: 'New module has been added successfully'
      });
      setShowCreateModuleModal(false);
      setNewModule({ title: '', description: '' });
      fetchCourseDetail();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Failed to Create Module',
        message: err.response?.data?.error || 'An error occurred while creating the module'
      });
    }
  };

  const handleCreateLesson = async () => {
  if (!newLesson.title.trim()) {
    return showToast({
      type: 'error',
      title: 'Missing Title',
      message: 'Lesson title is required'
    });
  }
  if (!selectedModuleId) {
    return showToast({
      type: 'error',
      title: 'No Module Selected',
      message: 'Please select a module first'
    });
  }
  if (newLesson.type === 'QUIZ' && quizQuestions.length === 0) {
    return showToast({
      type: 'error',
      title: 'No Questions',
      message: 'Add at least one question for a quiz'
    });
  }

  try {
    const payload = {
      ...newLesson,
      questions: newLesson.type === 'QUIZ' ? quizQuestions.map(q => ({
        text: q.text,
        explanation: q.explanation || null,
        answers: q.options.map((opt, i) => ({
          text: opt,
          isCorrect: i === q.correctIndex,
        })),
      })) : undefined,
    };

    await api.post(`/courses/${id}/modules/${selectedModuleId}/lessons`, payload);

    showToast({
      type: 'success',
      title: 'Lesson Created',
      message: 'New lesson has been added successfully'
    });

    setShowCreateLessonModal(false);
    setNewLesson({
      title: '', description: '', type: 'TEXT', duration: '', content: '',
      videoUrl: '', audioUrl: '', isPublished: false,
    });
    setQuizQuestions([]);
    setSelectedModuleId(null);
    fetchCourseDetail();
  } catch (err: any) {
    showToast({
      type: 'error',
      title: 'Failed to Create Lesson',
      message: err.response?.data?.error || 'An error occurred while creating the lesson'
    });
  }
};

  const handleDeleteModule = async () => {
    if (!moduleToDelete) return;
    try {
      await api.delete(`/courses/modules/${moduleToDelete}`);
      showToast({
        type: 'success',
        title: 'Module Deleted',
        message: 'The module has been removed successfully'
      });
      setShowDeleteModuleConfirm(false);
      setModuleToDelete(null);
      fetchCourseDetail();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.response?.data?.error || 'Failed to delete module'
      });
    }
  };

  const handleDeleteLesson = async () => {
    if (!lessonToDelete) return;
    try {
      await api.delete(`/courses/lessons/${lessonToDelete}`);
      showToast({
        type: 'success',
        title: 'Lesson Deleted',
        message: 'The lesson has been removed successfully'
      });
      setShowDeleteLessonConfirm(false);
      setLessonToDelete(null);
      fetchCourseDetail();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.response?.data?.error || 'Failed to delete lesson'
      });
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-32">
        <p className="text-2xl text-gray-500">Course not found</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';
  const canEnroll = isAdmin || user?.role === 'STUDENT';

  return (
    <div className="py-6 lg:py-10">

      {/* Back Button */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Courses
      </button>

      {/* Course Header */}
      <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          <div className="flex-1">
            <span className={`inline-block px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider border mb-5 ${
              course.level === 'Beginner' ? 'text-cyan-300 border-cyan-500/60 bg-cyan-500/10' :
              course.level === 'Intermediate' ? 'text-purple-300 border-purple-500/60 bg-purple-500/10' :
              'text-pink-300 border-pink-500/60 bg-pink-500/10'
            }`}>
              {course.level}
            </span>

            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white mb-5 leading-tight">
              {course.title}
            </h1>
            <p className="text-xl text-slate-700 dark:text-gray-300 leading-relaxed mb-7 max-w-4xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-8 text-slate-600 dark:text-gray-400">
              <span className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-cyan-400" />
                <span className="text-slate-900 dark:text-white font-medium">
                  {Math.floor((course.duration || 0) / 60)} hours
                </span>
              </span>
              <span className="flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-400" />
                <span className="text-slate-900 dark:text-white font-medium">
                  {course._count?.enrollments || 0} learners
                </span>
              </span>
              <span className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-indigo-400" />
                <span className="text-slate-900 dark:text-white font-medium">
                  {course._count?.lessons || 0} lessons
                </span>
              </span>
            </div>
          </div>

          {/* MODIFIED: Enroll button now visible to ADMIN too */}
          {canEnroll && (
            <div className="flex-shrink-0">
              {isEnrolled ? (
                <div className="bg-gradient-to-r from-cyan-500 to-purple-600 px-10 py-6 rounded-2xl font-bold text-white text-xl flex items-center gap-4 shadow-2xl shadow-cyan-500/50">
                  <CheckCircle className="w-8 h-8" />
                  Enrolled
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 px-12 py-6 rounded-2xl font-bold text-white text-xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-70"
                >
                  <span className="relative z-10">
                    {enrolling ? 'Enrolling...' : (isAdmin ? 'Enroll for Testing' : 'Enroll Now')}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* UPDATED: Student-facing Course Content - now grouped by modules */}
        <div className="lg:col-span-2">
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Course Content
            </h2>

            {course.modules?.length > 0 ? (
              <div className="space-y-8">
                {course.modules.map((module: any) => (
                  <div key={module.id} className="space-y-4">
                    <h3 className="text-2xl font-bold text-cyan-300">
                      {module.order}. {module.title}
                    </h3>
                    {module.description && <p className="text-gray-400">{module.description}</p>}

                    <div className="space-y-4">
                      {module.lessons.map((lesson: any, idx: number) => {
                        const isUnlocked = lesson.isUnlocked ?? false;
                        const isCompleted = lesson.completed ?? false;

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => handleLessonClick(lesson)}
                            className={`group p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                              isEnrolled && isUnlocked
                                ? 'bg-white/5 border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20'
                                : 'bg-gray-800/30 border-gray-700/50 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${
                                  isUnlocked ? 'bg-cyan-500/20' : 'bg-gray-700/40'
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle className="w-7 h-7 text-green-400" />
                                  ) : isUnlocked ? (
                                    <Play className="w-7 h-7 text-cyan-400" />
                                  ) : (
                                    <Lock className="w-7 h-7 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <h3 className={`text-xl font-bold ${
                                    isUnlocked ? 'text-slate-900 dark:text-white' : 'text-gray-500 dark:text-gray-600'
                                  }`}>
                                    {idx + 1}. {lesson.title}
                                  </h3>
                                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-gray-400 mt-2">
                                    <span className="capitalize font-medium">{lesson.type.toLowerCase()}</span>
                                    <span>•</span>
                                    <span>{lesson.duration || '?'} min</span>
                                    {lesson.score !== null && (
                                      <span className={lesson.score >= 85 ? 'text-green-500' : 'text-red-500'}>
                                        Score: {lesson.score}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-600 dark:text-gray-500 py-16 text-lg">
                No modules or lessons available yet.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">

          {/* Instructor */}
          {course.teacher && (
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Brain className="w-6 h-6 text-purple-400" />
                Instructor
              </h3>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {course.teacher.firstName[0]}{course.teacher.lastName[0]}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {course.teacher.firstName} {course.teacher.lastName}
                  </p>
                  <p className="text-slate-600 dark:text-gray-400 capitalize">{course.teacher.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-pink-400" />
                Topics
              </h3>
              <div className="flex flex-wrap gap-3">
                {course.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-5 py-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-cyan-300 rounded-full text-sm font-medium hover:bg-cyan-500/20 transition"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning Outcomes */}
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">What You'll Master</h3>
            <ul className="space-y-5">
              {[
                "Master core concepts with AI-powered explanations",
                "Practice with interactive challenges and quizzes",
                "Get real-time help from your personal AI Tutor",
                "Earn certificates and unlock achievements"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-slate-700 dark:text-gray-300">
                  <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Admin: Manage Course Content - Only visible to ADMIN */}
      {isAdmin && (
        <div className="mt-12 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">
            Admin: Manage Course Content
          </h2>

          {course.modules?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-400 mb-6">No modules yet.</p>
              <button
                onClick={() => setShowCreateModuleModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:scale-105 transition"
              >
                Create First Module
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {course.modules.map((module: any) => (
                <div key={module.id} className="border border-gray-700/50 rounded-2xl p-6 bg-black/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-cyan-300">
                        {module.order}. {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-gray-400 mt-1">{module.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {module.lessons.length} lessons
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setModuleToDelete(module.id);
                        setShowDeleteModuleConfirm(true);
                      }}
                      className="p-2 bg-red-600/30 hover:bg-red-600/60 text-red-300 rounded-lg"
                    >
                      Delete Module
                    </button>
                  </div>

                  {/* Lessons in this module */}
                  <div className="space-y-4 mt-6">
                    {module.lessons.map((lesson: any, idx: number) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 bg-black/30 rounded-xl"
                      >
                        <div>
                          <p className="font-medium">{idx + 1}. {lesson.title}</p>
                          <p className="text-sm text-gray-400 capitalize">{lesson.type.toLowerCase()}</p>
                        </div>
                        <button
                          onClick={() => {
                            setLessonToDelete(lesson.id);
                            setShowDeleteLessonConfirm(true);
                          }}
                          className="p-2 bg-red-600/30 hover:bg-red-600/60 text-red-300 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        setSelectedModuleId(module.id);
                        setShowCreateLessonModal(true);
                      }}
                      className="mt-4 w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-xl hover:scale-105 transition"
                    >
                      + Add Lesson to this Module
                    </button>
                  </div>
                </div>
              ))}

              {/* Add new module button */}
              <button
                onClick={() => setShowCreateModuleModal(true)}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:scale-105 transition mt-6"
              >
                + Create New Module
              </button>
            </div>
          )}
        </div>
      )}
      {/* Create Module Modal */}
{showCreateModuleModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-lg border border-cyan-500/30">
      <h3 className="text-2xl font-bold text-cyan-300 mb-6">Create New Module</h3>
      <input
        type="text"
        placeholder="Module Title *"
        value={newModule.title}
        onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
        className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white"
      />
      <textarea
        placeholder="Description (optional)"
        value={newModule.description}
        onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
        className="w-full p-3 mb-6 bg-gray-800 border border-gray-700 rounded-xl text-white h-24"
      />
      <div className="flex gap-4">
        <button
          onClick={handleCreateModule}
          className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl"
        >
          Create Module
        </button>
        <button
          onClick={() => setShowCreateModuleModal(false)}
          className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{/* Create Lesson Modal */}
{showCreateLessonModal && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-2xl border border-cyan-500/30 max-h-[90vh] overflow-y-auto">
      <h3 className="text-2xl font-bold text-cyan-300 mb-6">
        Add Lesson to Module
      </h3>

      {/* Title */}
      <input
        type="text"
        placeholder="Lesson Title *"
        value={newLesson.title}
        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
        className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />

      {/* Description */}
      <textarea
        placeholder="Short description (optional)"
        value={newLesson.description}
        onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
        className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white h-20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />

      {/* Lesson Type */}
      <select
        value={newLesson.type}
        onChange={(e) => {
          const newType = e.target.value as typeof newLesson.type;
          setNewLesson({
            ...newLesson,
            type: newType,
            // Reset irrelevant fields when changing type
            content: newType === 'TEXT' || newType === 'QUIZ' ? newLesson.content : '',
            videoUrl: newType === 'VIDEO' ? newLesson.videoUrl : '',
            audioUrl: newType === 'AUDIO' ? newLesson.audioUrl : '',
          });
          if (newType !== 'QUIZ') {
            setQuizQuestions([]);
          }
        }}
        className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      >
        <option value="TEXT">Text / Reading</option>
        <option value="VIDEO">Video</option>
        <option value="AUDIO">Audio</option>
        <option value="QUIZ">Quiz</option>
        <option value="INTERACTIVE">Interactive</option>
        <option value="ASSIGNMENT">Assignment</option>
      </select>

      {/* Duration */}
      <input
        type="number"
        min="0"
        placeholder="Duration in minutes (optional)"
        value={newLesson.duration}
        onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
        className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />

      {/* Conditional content fields */}
      {(newLesson.type === 'TEXT' || newLesson.type === 'QUIZ') && (
        <textarea
          placeholder={
            newLesson.type === 'TEXT'
              ? "Main content (markdown supported)"
              : "Quiz instructions / introduction (optional, markdown supported)"
          }
          value={newLesson.content}
          onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
          className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white h-32 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      )}

      {newLesson.type === 'VIDEO' && (
        <input
          type="url"
          placeholder="Video URL (YouTube, Vimeo, etc.)"
          value={newLesson.videoUrl}
          onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
          className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      )}

      {newLesson.type === 'AUDIO' && (
        <input
          type="url"
          placeholder="Audio URL (mp3, streaming link, etc.)"
          value={newLesson.audioUrl}
          onChange={(e) => setNewLesson({ ...newLesson, audioUrl: e.target.value })}
          className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      )}

      {/* ────────────────────────────────────────────────
          QUIZ SECTION – only shown when type = QUIZ
      ──────────────────────────────────────────────── */}
      {newLesson.type === 'QUIZ' && (
        <div className="mt-8 space-y-6 border-t border-gray-700 pt-6">
          <h4 className="text-xl font-bold text-purple-300">Quiz Questions</h4>

          {quizQuestions.length === 0 && (
            <p className="text-gray-400 italic">No questions added yet. Add at least one.</p>
          )}

          {quizQuestions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="p-5 bg-black/40 rounded-xl border border-purple-500/30 relative"
            >
              <button
                onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== qIdx))}
                className="absolute top-3 right-3 text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>

              <div className="mb-4">
                <label className="block text-purple-200 mb-1">Question {qIdx + 1}</label>
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => {
                    const updated = [...quizQuestions];
                    updated[qIdx].text = e.target.value;
                    setQuizQuestions(updated);
                  }}
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white"
                  placeholder="Enter question text here..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-3">
                    <span className="text-gray-400 w-6 font-medium">{letter}.</span>
                    <input
                      type="text"
                      value={q.options[optIdx] || ''}
                      onChange={(e) => {
                        const updated = [...quizQuestions];
                        updated[qIdx].options[optIdx] = e.target.value;
                        setQuizQuestions(updated);
                      }}
                      className="flex-1 p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      placeholder={`Option ${letter}`}
                    />
                    <input
                      type="radio"
                      name={`correct-${qIdx}`}
                      checked={q.correctIndex === optIdx}
                      onChange={() => {
                        const updated = [...quizQuestions];
                        updated[qIdx].correctIndex = optIdx;
                        setQuizQuestions(updated);
                      }}
                      className="w-5 h-5 text-purple-500 focus:ring-purple-500"
                    />
                  </div>
                ))}
              </div>

              <textarea
                placeholder="Explanation / feedback (optional)"
                value={q.explanation || ''}
                onChange={(e) => {
                  const updated = [...quizQuestions];
                  updated[qIdx].explanation = e.target.value;
                  setQuizQuestions(updated);
                }}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white h-20"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              setQuizQuestions([
                ...quizQuestions,
                {
                  text: '',
                  options: ['', '', '', ''],
                  correctIndex: 0,
                  explanation: '',
                },
              ]);
            }}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:brightness-110 transition"
          >
            + Add New Question
          </button>
        </div>
      )}

      {/* Publish toggle */}
      <label className="flex items-center gap-3 mt-6 mb-8 text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={newLesson.isPublished}
          onChange={(e) => setNewLesson({ ...newLesson, isPublished: e.target.checked })}
          className="w-5 h-5 accent-cyan-500"
        />
        <span>Publish immediately (students can see it right away)</span>
      </label>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleCreateLesson}
          disabled={
            !newLesson.title.trim() ||
            (newLesson.type === 'QUIZ' && quizQuestions.length === 0) ||
            (newLesson.type === 'VIDEO' && !newLesson.videoUrl.trim()) ||
            (newLesson.type === 'AUDIO' && !newLesson.audioUrl.trim())
          }
          className="flex-1 py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl font-medium hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Lesson
        </button>

        <button
          onClick={() => {
            setShowCreateLessonModal(false);
            setSelectedModuleId(null);
            setQuizQuestions([]);
          }}
          className="flex-1 py-3.5 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
{/* Delete Confirmation Modals */}
{showDeleteModuleConfirm && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-8 rounded-2xl max-w-md border border-red-500/30">
      <h3 className="text-2xl font-bold text-red-400 mb-4">Delete Module?</h3>
      <p className="text-gray-300 mb-6">
        This will delete the module and all its lessons. This action cannot be undone.
      </p>
      <div className="flex gap-4">
        <button
          onClick={handleDeleteModule}
          className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl"
        >
          Yes, Delete
        </button>
        <button
          onClick={() => setShowDeleteModuleConfirm(false)}
          className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

{showDeleteLessonConfirm && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-8 rounded-2xl max-w-md border border-red-500/30">
      <h3 className="text-2xl font-bold text-red-400 mb-4">Delete Lesson?</h3>
      <p className="text-gray-300 mb-6">
        This action cannot be undone.
      </p>
      <div className="flex gap-4">
        <button
          onClick={handleDeleteLesson}
          className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl"
        >
          Yes, Delete
        </button>
        <button
          onClick={() => setShowDeleteLessonConfirm(false)}
          className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    
  );
}