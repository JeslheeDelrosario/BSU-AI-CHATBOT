// client/src/pages/CourseDetail.tsx
import { useState, useEffect, useRef, useCallback  } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Disclosure, Transition } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { GripVertical } from "lucide-react";

import Quill from "quill";
import "quill/dist/quill.snow.css";

// import TableUp from "quill-table-up";
import BetterTable from 'quill-better-table';

Quill.register({
  'modules/better-table': BetterTable,
}, true);

import api from '../lib/api';
import { 
  BookOpen, Clock, Users, Play, CheckCircle, Lock, ArrowLeft, 
  Brain, Zap, MessageSquare, GraduationCap 
} from 'lucide-react';

const SizeStyle = Quill.import('attributors/style/size') as any;
SizeStyle.whitelist = ['10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '24pt', '30pt', '36pt', '100pt'];
Quill.register(SizeStyle, true);

type EditingLesson = {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: string;
  content: string;
  videoUrl?: string;
  audioUrl?: string;
  isPublished: boolean;
};

function QuillEditor({
  value,
  onChange,
  quillRef,
}: {
  value: string;
  onChange: (html: string) => void;
  quillRef: React.MutableRefObject<Quill | null>;
}) {
  const editorDivRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const editorDiv = editorDivRef.current;

    if (!container || !editorDiv || initialized.current) return;

    console.log("[QuillEditor] Initializing Quill");

    console.log("[QuillEditor] Mounted with initial value:", value.substring(0, 50)); // first 50 chars
    initialized.current = true;


    // Clean old toolbars
    container.querySelectorAll('.ql-toolbar').forEach(el => el.remove());
    editorDiv.innerHTML = '';
    
    const quill = new Quill(editorDiv, {
      theme: "snow",
      modules: {
        toolbar: [
          // [{ header: [1, 2, 3, false] }],
          [{ size: ['10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '24pt', '30pt', '36pt', '100pt'] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["code-block"],
          ["link"],
          [{ align: [] }],
          ["clean"],
        ],
        'better-table': true,
      }
    });

    quillRef.current = quill;

    // Set content ONLY ONCE on mount (no loop)
    if (value) {
      quill.clipboard.dangerouslyPasteHTML(0, value, 'silent');
    }

    // Send changes back to parent – this is one-way
    const handleTextChange = () => {
      onChange(quill.root.innerHTML);
    };
    quill.on("text-change", handleTextChange);

    return () => {
      console.log("[QuillEditor] Cleaning up");
      quill.off("text-change", handleTextChange);
      container.querySelectorAll('.ql-toolbar').forEach(el => el.remove());
      quillRef.current = null;
      initialized.current = false;
    };
  }, []); // Empty deps → run only on mount

  return (
    <div ref={containerRef}>
      <div ref={editorDivRef} />
    </div>
  );
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showCreateModuleModal, setShowCreateModuleModal] = useState(false);
  const [showCreateLessonModal, setShowCreateLessonModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [showDeleteModuleConfirm, setShowDeleteModuleConfirm] = useState(false);
  const [showDeleteLessonConfirm, setShowDeleteLessonConfirm] = useState(false);
  const [showEditModuleModal, setShowEditModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<{ id: string; title: string; description: string; order?: number } | null>(null);
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);
  const [reorderingModuleId, setReorderingModuleId] = useState<string | null>(null,);
  const [editingLesson, setEditingLesson] = useState<EditingLesson | null>(null);
  
  // For Create Lesson modal
  const createQuillRef = useRef<Quill | null>(null);
  const [showCreateTablePicker, setShowCreateTablePicker] = useState(false);
  const [hoveredCreateCell, setHoveredCreateCell] = useState<[number, number] | null>(null);

  // For Edit Lesson modal (if you open edit)
  const editQuillRef = useRef<Quill | null>(null);
  const handleEditContentChange = useCallback((html: string) => {
  setEditingLesson((prev) => prev ? { ...prev, content: html } : prev);}, []);
  const [showEditTablePicker, setShowEditTablePicker] = useState(false);
  const [hoveredEditCell, setHoveredEditCell] = useState<[number, number] | null>(null);
  
  // useEffect(() => {
  //   if (!showEditLessonModal || !editingLesson) {
  //     editReloadRef.current = false; // reset when modal closes
  //     return;
  //   }

  //   // Early return: if already reloaded or scheduled, skip everything
  //   if (editReloadRef.current) return;

  //   // Mark as "in progress" immediately (prevents duplicate timeouts)
  //   editReloadRef.current = true;

  //   const timer = setTimeout(() => {
  //     console.log("[Edit Modal] Attempting content reload (guarded single run)");

  //     if (!editQuillRef.current) {
  //       console.warn("[Edit Modal] Quill not ready – skipping");
  //       editReloadRef.current = false; // allow retry if failed
  //       return;
  //     }

  //     try {
  //       editQuillRef.current.clipboard.dangerouslyPasteHTML(0, editingLesson.content || '', 'silent');
  //       console.log("[Edit Modal] Content reloaded successfully");
  //     } catch (err) {
  //       console.error("[Edit Modal] Reload failed", err);
  //       editReloadRef.current = false; // allow retry on error
  //     }
  //   }, 300);

  //   // Cleanup: clear timeout + reset flag if modal closes early
  //   return () => {
  //     clearTimeout(timer);
  //     editReloadRef.current = false;
  //   };
  // }, [showEditLessonModal, editingLesson]);

  const [quizQuestions, setQuizQuestions] = useState<Array<{
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>>([]);

  const lessonTypeDisplay: Record<string, string> = {
    TEXT: 'Reading',
    READ: 'Reading',
    VIDEO: 'Video',
    AUDIO: 'Audio',
    QUIZ: 'Quiz',
    INTERACTIVE: 'Interactive',
    ASSIGNMENT: 'Assignment',
    
  };

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

// Corrected insertTable – expects the REF (MutableRefObject), not the Quill instance
  const insertTable = (
    quillRef: React.MutableRefObject<Quill | null>,
    rows: number,
    cols: number
  ) => {
    const quill = quillRef.current;

    if (!quill) {
      showToast({
        type: 'error',
        title: 'Editor not ready',
        message: 'Please wait a moment and try again',
      });
      return;
    }

    try {
      // Get the module – correct name is 'better-table'
      const tableModule = quill.getModule('better-table') as any;

      if (tableModule && typeof tableModule.insertTable === 'function') {
        tableModule.insertTable(rows, cols);
        showToast({
          type: 'success',
          title: 'Table Added',
          message: `${rows} × ${cols} table inserted`,
        });
      } else {
        showToast({
          type: 'error',
          title: 'Table module not found',
          message: 'Make sure quill-better-table is registered correctly',
        });
      }
    } catch (err) {
      console.error('Failed to insert table:', err);
      showToast({
        type: 'error',
        title: 'Failed to insert table',
        message: 'Check console for details',
      });
    }
  };

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);


  const handleOpenEditModule = (module: any) => {
    setEditingModule({
      id: module.id,
      title: module.title,
      description: module.description || '',
      order: module.order,
    });
    setShowEditModuleModal(true);
  };

  const handleSaveEditModule = async () => {
    if (!editingModule || !editingModule.title.trim()) {
      return showToast({
        type: 'error',
        title: 'Missing Title',
        message: 'Module title is required'
      });
    }

    try {
      await api.put(`/courses/modules/${editingModule.id}`, {  
        title: editingModule.title,
        description: editingModule.description,
        
      });

      showToast({
        type: 'success',
        title: 'Module Updated',
        message: 'Module has been updated successfully'
      });

      setShowEditModuleModal(false);
      setEditingModule(null);
      fetchCourseDetail();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.response?.data?.error || err.message || 'Failed to update module'
      });
    }
  };

  const handleOpenEditLesson = async (lessonPartial: any) => {
    try {
      const res = await api.get(`/lessons/${lessonPartial.id}`);
      const lesson = res.data.lesson || res.data;

      let contentForEditor = lesson.content || '';
      
      // For QUIZ: extract only instructions for the editor
      if (lesson.type === 'QUIZ' && lesson.content) {
        try {
          const parsed = JSON.parse(lesson.content);
          contentForEditor = parsed.instructions || '';
          
          const qs = parsed.questions || [];
          const loaded = qs.map((q: any) => {
            const answers = q.answers || [];
            return {
              text: q.text || '',
              options: answers.map((a: any) => a.text || ''),
              correctIndex: answers.findIndex((a: any) => a.isCorrect) ?? 0,
              explanation: q.explanation || '',
            };
          });
          setQuizQuestions(loaded);
        } catch (e) {
          console.error("Parse error:", e);
          setQuizQuestions([]);
        }
      } else {
        setQuizQuestions([]);
      }

      const initial = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || '',
        type: lesson.type,
        duration: lesson.duration || '',
        content: contentForEditor,  // ← Use extracted instructions
        videoUrl: lesson.videoUrl || '',
        audioUrl: lesson.audioUrl || '',
        isPublished: lesson.isPublished || false,
      };

      setEditingLesson(initial);
      setShowEditLessonModal(true);
    } catch (err) {
      console.error("Load failed:", err);
      showToast({ type: 'error', title: 'Failed to load lesson' });
    }
  };

  const handleSaveEditLesson = async () => {
    if (!editingLesson || !editingLesson.title.trim() || !editingLesson.type) {
      return showToast({ type: 'error', title: 'Missing Fields' });
    }

    if (editingLesson.type === 'QUIZ' && quizQuestions.length === 0) {
      return showToast({ type: 'error', title: 'No Questions', message: 'Add at least one.' });
    }

    try {
      let finalContent = editingLesson.content?.trim() || '';

      if (editingLesson.type === 'QUIZ') {
    const quizJson = {
      instructions: editingLesson.content || "Answer the following questions.", // ← Editor content
      questions: quizQuestions.map(q => ({
        text: q.text.trim(),
        explanation: q.explanation?.trim() || null,
        answers: q.options.map((text, i) => ({
          text: text.trim(),
          isCorrect: i === q.correctIndex,
        })),
      })),
    };
    finalContent = JSON.stringify(quizJson);
  }

      const payload = {
        ...editingLesson,
        content: finalContent,  // Use the rebuilt (or cleaned) content
        // You can remove this if backend ignores it anyway
        questions: editingLesson.type === 'QUIZ'
          ? quizQuestions.map(q => ({
              text: q.text.trim(),
              explanation: q.explanation?.trim() || null,
              answers: q.options.map((text, i) => ({
                text: text.trim(),
                isCorrect: i === q.correctIndex,
              })),
            }))
          : undefined,
      };

      console.log("Saving payload:", JSON.stringify(payload, null, 2));

      await api.put(`/courses/lessons/${editingLesson.id}`, payload);

      showToast({ type: 'success', title: 'Lesson Updated' });

      setShowEditLessonModal(false);
      setEditingLesson(null);
      setQuizQuestions([]);
      fetchCourseDetail();
    } catch (err: any) {
      console.error("Save failed:", err);
      showToast({ type: 'error', title: 'Update Failed' });
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post('/courses/enroll', { courseId: id });

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
      await fetchCourseDetail(); 
    }
  };

  const fetchCourseDetail = async () => {
    try {
      const response = await api.get(`/courses/${id}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      const courseData = response.data.course;
      

      setCourse(courseData);
      setIsEnrolled(!!response.data.enrollment);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

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

    navigate(`/lessons/${lesson.id}`);
  };

  
  // const handleLessonClick = (lesson: any) => {      // pansamantala
  //   // Admins can view even if not enrolled
  //   if (!isEnrolled && user?.role !== 'ADMIN') {
  //     showToast({
  //       type: 'warning',
  //       title: 'Not Enrolled',
  //       message: 'Please enroll to access lessons.',
  //     });
  //     return;
  //   }

  //   if (!lesson.isUnlocked && user?.role !== 'ADMIN') {
  //     showToast({
  //       type: 'info',
  //       title: 'Lesson Locked',
  //       message: 'To unlock this lesson, complete the previous lesson with and score at least 85% score (if it was a quiz).',
  //     });
  //     return;
  //   }

  //   navigate(`/lessons/${lesson.id}`);
  // };


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
      return showToast({ type: 'error', title: 'Missing Title', message: 'Lesson title is required' });
    }
    if (!selectedModuleId) {
      return showToast({ type: 'error', title: 'No Module Selected', message: 'Please select a module first' });
    }
    if (newLesson.type === 'QUIZ' && quizQuestions.length === 0) {
      return showToast({ type: 'error', title: 'No Questions', message: 'Add at least one question for a quiz' });
    }

    try {
      let finalContent = newLesson.content?.trim() || '';

      if (newLesson.type === 'QUIZ') {
        const quizJson = {
          instructions: "Answer the following questions.",
          questions: quizQuestions.map(q => ({
            text: q.text.trim(),
            explanation: q.explanation?.trim() || null,
            answers: q.options.map((text, i) => ({
              text: text.trim(),
              isCorrect: i === q.correctIndex,
            })),
          })),
        };
        finalContent = JSON.stringify(quizJson); // ← Saves updated questions
      }

      const payload = {
        ...newLesson,
        content: finalContent,
        // You can keep sending separate 'questions' if backend starts using it later,
        // but right now it's ignored — so it's optional
        ...(newLesson.type === 'QUIZ' && {
          questions: quizQuestions.map(q => ({
            text: q.text.trim(),
            explanation: q.explanation?.trim() || null,
            answers: q.options.map((text, i) => ({
              text: text.trim(),
              isCorrect: i === q.correctIndex,
            })),
          })),
        }),
      };

      console.log("Creating lesson payload:", JSON.stringify(payload, null, 2));

      await api.post(`/courses/${id}/modules/${selectedModuleId}/lessons`, payload);

      showToast({
        type: 'success',
        title: 'Lesson Created',
        message: 'New lesson has been added successfully'
      });

      setShowCreateLessonModal(false);
      setNewLesson({
        title: '',
        description: '',
        type: 'TEXT',
        duration: '',
        content: '',
        videoUrl: '',
        audioUrl: '',
        isPublished: false,
      });
      setQuizQuestions([]);
      setSelectedModuleId(null);
      fetchCourseDetail();
    } catch (err: any) {
      console.error("Create lesson failed:", err);
      showToast({
        type: 'error',
        title: 'Failed to Create Lesson',
        message: err.response?.data?.error || 'An error occurred while creating the lesson'
      });
    }
  };

  const handleMoveLesson = async (
  moduleId: string,
  lessonId: string,
  direction: 'up' | 'down'
) => {
  if (!course) return;

  setReorderingModuleId(moduleId); // start visual feedback

  try {
    // 1. Find the current module and its lessons
    const moduleIndex = course.modules.findIndex((m: any) => m.id === moduleId);
    if (moduleIndex === -1) throw new Error("Module not found");

    // Make a deep copy to avoid mutating state directly
    const lessons = [...course.modules[moduleIndex].lessons];
    const currentIdx = lessons.findIndex((l: any) => l.id === lessonId);
    if (currentIdx === -1) throw new Error("Lesson not found");

    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;
    if (targetIdx < 0 || targetIdx >= lessons.length) {
      // No move possible — silent return (buttons already disabled)
      return;
    }

    // 2. Swap positions
    [lessons[currentIdx], lessons[targetIdx]] = [lessons[targetIdx], lessons[currentIdx]];

    // 3. Re-assign order numbers (1-based, as per your Prisma schema)
    lessons.forEach((lesson: any, idx: number) => {
      lesson.order = idx + 1;
    });

    // 4. Optimistic UI update – show new order immediately
    setCourse((prev: any) => {
      if (!prev) return prev;
      const newModules = [...prev.modules];
      newModules[moduleIndex] = {
        ...newModules[moduleIndex],
        lessons: [...lessons], // new array reference
      };
      return { ...prev, modules: newModules };
    });

    // 5. Send new order to backend
    const newOrderIds = lessons.map((l: any) => l.id);

    await api.patch(`/courses/modules/${moduleId}/lessons/reorder`, {
      lessonIds: newOrderIds,
    });

    showToast({
      type: 'success',
      title: 'Order Updated',
      message: `Lesson moved ${direction === 'up' ? 'up' : 'down'}.`,
    });
  } catch (err: any) {
    console.error("Failed to reorder lesson:", err);
    showToast({
      type: 'error',
      title: 'Failed to save order',
      message: 'Reverting changes...',
    });
    // Revert optimistic change by reloading full course data
    await fetchCourseDetail();
  } finally {
    setReorderingModuleId(null); // end loading state
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
        onClick={() => navigate(((location.state as any)?.from as string) || '/courses')}
        className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        {((location.state as any)?.from === '/my-courses' && 'Back in My Courses') || ((location.state as any)?.from === '/courses' && 'Back in Courses') || 'Back to Courses'}
      </button>

      {/* Course Header */}
      <div className="backdrop-blur-2xl bg-white/5 dark:bg-white/5 border border-gray-200/60 dark:border-white/10 rounded-3xl p-6 lg:p-10 shadow-2xl mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            {/*Level badge*/}
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border mb-4 ${
                course.level === "Beginner"
                  ? "text-cyan-700 dark:text-cyan-300 border-cyan-500/60 bg-cyan-100/80 dark:bg-cyan-500/10"
                  : course.level === "Intermediate"
                    ? "text-purple-700 dark:text-purple-300 border-purple-500/60 bg-purple-100/80 dark:bg-purple-500/10"
                    : "text-pink-700 dark:text-pink-300 border-pink-500/60 bg-pink-100/80 dark:bg-pink-500/10"
              }`}
            >
              {course.level}
            </span>

            {/*Title*/}
            <h1 className="text-3xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
              {course.title}
            </h1>

            {/*Description*/}
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6 max-w-3xl">
              {course.description}
            </p>

            {/* Stats icons*/}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.floor((course.duration || 0) / 60)} hours
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {course._count?.Enrollment || 0} learners
                </span>
              </span>
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {course._count?.Lesson || 0} lessons
                </span>
              </span>
            </div>
          </div>

          {/*Enroll button*/}
          {canEnroll && (
            <div className="flex-shrink-0">
              {isEnrolled ? (
                <div className="bg-gradient-to-r from-cyan-600 to-purple-600 px-8 py-4 rounded-xl font-bold text-white text-lg flex items-center gap-3 shadow-lg shadow-cyan-500/30">
                  <CheckCircle className="w-6 h-6" />
                  Enrolled
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 px-10 py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-60"
                >
                  <span className="relative z-10">
                    {enrolling
                      ? "Enrolling..."
                      : isAdmin
                        ? "Test Enroll"
                        : "Enroll Now"}
                  </span>
                  <div className="absolute inset-0 bg-white/15 translate-x-[-100%] group-hover:translate-x-full transition-transform duration-500"></div>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Content – Accordion Modules */}
        <div className="lg:col-span-2">
          <div
            className="
            backdrop-blur-xl 
            bg-white/90 dark:bg-white/5 
            border border-gray-200/70 dark:border-white/10 
            rounded-3xl 
            p-6 lg:p-8 
            shadow-xl dark:shadow-2xl
          "
          >
            <h2
              className="
              text-2xl lg:text-3xl 
              font-bold mb-6 
              bg-gradient-to-r 
              from-cyan-700 to-purple-700        /* ← darker in light mode */
              dark:from-cyan-300 dark:to-purple-300   /* ← keep your original in dark */
              bg-clip-text 
              text-transparent
            "
            >
              Course Content
            </h2>

            {course.modules?.length > 0 ? (
              <div className="space-y-4">
                {course.modules.map((module: any) => {
                  const totalLessons = module.lessons?.length ?? 0;
                  const completedCount =
                    module.lessons?.filter(
                      (lesson: any) => lesson.completed ?? false,
                    ).length ?? 0;
                  const isModuleComplete =
                    totalLessons > 0 && completedCount === totalLessons;

                  return (
                    <Disclosure
                      key={module.id}
                      as="div"
                      className="
                      rounded-2xl 
                      border border-gray-200/60 dark:border-white/10 
                      bg-white/85 dark:bg-white/5 
                      overflow-hidden
                    "
                    >
                      {({ open }) => (
                        <>
                          <Disclosure.Button
                            className="
                            flex w-full items-center justify-between 
                            px-6 py-4 text-left 
                            hover:bg-gray-50 dark:hover:bg-white/5 
                            transition
                          "
                          >
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-cyan-300">
                                {module.order}. {module.title}
                              </h3>
                              {module.description && (
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                  {module.description}
                                </p>
                              )}

                              <div className="mt-2 flex items-center gap-4 text-base text-gray-600 dark:text-gray-400">
                                <span>
                                  {totalLessons} lesson
                                  {totalLessons !== 1 ? "s" : ""}
                                </span>
                                <span className="text-cyan-600/70 dark:text-cyan-400/70">
                                  •
                                </span>
                                <span
                                  className={
                                    isModuleComplete
                                      ? "text-green-600 dark:text-green-400 font-semibold"
                                      : "text-gray-600 dark:text-gray-300"
                                  }
                                >
                                  {completedCount}/{totalLessons} completed
                                </span>
                                {isModuleComplete && (
                                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                )}
                              </div>
                            </div>

                            <ChevronDown
                              className={`h-6 w-6 text-gray-500 dark:text-cyan-400 transition-transform duration-200 ${
                                open ? "rotate-180" : ""
                              }`}
                            />
                          </Disclosure.Button>
                          {/* @ts-expect-error Headless UI v2 + React 18 children inference */}
                          <Transition
                            enter="transition duration-100 ease-out"
                            enterFrom="transform scale-95 opacity-0"
                            enterTo="transform scale-100 opacity-100"
                            leave="transition duration-75 ease-out"
                            leaveFrom="transform scale-100 opacity-100"
                            leaveTo="transform scale-95 opacity-0"
                          >
                            <Disclosure.Panel className="px-6 pb-6 pt-3 bg-gray-50/60 dark:bg-black/20">
                              <div className="space-y-3">
                                {module.lessons.map((lesson: any) => {
                                  const isUnlocked = lesson.isUnlocked ?? false;
                                  const isCompleted = lesson.completed ?? false;

                                  return (
                                    <div
                                      key={lesson.id}
                                      onClick={() => handleLessonClick(lesson)}
                                      className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                                        isEnrolled && isUnlocked
                                          ? "bg-white dark:bg-white/5 border-gray-300/60 dark:border-cyan-500/30 hover:bg-gray-50 dark:hover:bg-cyan-500/10 hover:border-cyan-500/50"
                                          : "bg-gray-100/70 dark:bg-gray-900/40 border-gray-300 dark:border-gray-700 opacity-75 cursor-not-allowed"
                                      }`}
                                    >
                                      <div
                                        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                          isUnlocked
                                            ? "bg-cyan-100 dark:bg-cyan-500/20"
                                            : "bg-gray-200 dark:bg-gray-700/40"
                                        }`}
                                      >
                                        {isCompleted ? (
                                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        ) : isUnlocked ? (
                                          <Play className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                                        ) : (
                                          <Lock className="w-6 h-6 text-gray-600 dark:text-gray-500" />
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <h4
                                          className={`font-semibold truncate ${
                                            isUnlocked
                                              ? "text-gray-900 dark:text-white"
                                              : "text-gray-600 dark:text-gray-500"
                                          }`}
                                        >
                                          {lesson.title}
                                        </h4>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          <span className="capitalize">
                                            {lessonTypeDisplay[lesson.type] ||
                                              lesson.type.toLowerCase()}
                                          </span>
                                          <span>•</span>
                                          <span>
                                            {lesson.duration || "?"} min
                                          </span>
                                          {lesson.score != null && (
                                            <span
                                              className={
                                                lesson.score >= 85
                                                  ? "text-green-600 dark:text-green-400"
                                                  : "text-red-600 dark:text-red-400"
                                              }
                                            >
                                              Score: {lesson.score}%
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </Disclosure.Panel>
                          </Transition>
                        </>
                      )}
                    </Disclosure>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-500 py-12">
                No modules available yet.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Instructor */}
          {course.teacher && (
            <div
              className="
              backdrop-blur-xl 
              bg-white/90 dark:bg-white/5 
              border border-gray-200/70 dark:border-white/10 
              rounded-3xl 
              p-8 
              shadow-xl dark:shadow-2xl
            "
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Instructor
              </h3>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {course.teacher.firstName[0]}
                  {course.teacher.lastName[0]}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {course.teacher.firstName} {course.teacher.lastName}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">
                    {course.teacher.role}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div
              className="
              backdrop-blur-xl 
              bg-white/90 dark:bg-white/5 
              border border-gray-200/70 dark:border-white/10 
              rounded-3xl 
              p-8 
              shadow-xl dark:shadow-2xl
            "
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-pink-700 dark:text-pink-400" />
                Topics
              </h3>

              <div className="flex flex-wrap gap-3">
                {course.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="
                      inline-block
                      px-5 py-3 
                      dark:bg-gradient-to-r dark:from-cyan-500/10 dark:to-purple-500/10   /* solid white in light, your gradient in dark */
                      border border-gray-300 dark:border-cyan-500/30 
                      text-gray-900 dark:text-cyan-300                                 /* almost black in light → very high contrast */
                      rounded-full text-sm font-medium 
                      shadow-sm hover:shadow-md                                        /* subtle lift + hover lift */
                      hover:bg-gray-50 dark:hover:bg-cyan-500/20                       /* light gray hover in light, stronger cyan in dark */
                      transition-all duration-200
                    "
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning Outcomes */}
          <div
            className="
            backdrop-blur-xl 
            bg-white/90 dark:bg-white/5 
            border border-cyan-400/40 dark:border-cyan-500/20 
            rounded-3xl 
            p-7 lg:p-8 
            shadow-xl dark:shadow-cyan-500/10 
            hover:shadow-2xl dark:hover:shadow-cyan-500/20 
            transition-shadow duration-300
          "
          >
            <h3
              className="
              text-2xl font-black mb-7 
              bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 
              bg-clip-text text-transparent 
              flex items-center gap-3
            "
            >
              <Brain className="w-7 h-7 text-purple-600 dark:text-purple-400 animate-pulse-slow" />
              What You'll Master
            </h3>

            <ul className="space-y-6">
              {[
                {
                  text: "Grasp complex science concepts through crystal-clear AI explanations",
                  icon: (
                    <Brain className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  ),
                },
                {
                  text: "Sharpen skills with interactive quizzes, challenges & instant feedback",
                  icon: (
                    <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  ),
                },
                {
                  text: "Get 24/7 real-time guidance from your personal AI Tutor companion",
                  icon: (
                    <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  ),
                },
                {
                  text: "Earn blockchain-verified certificates & unlock exclusive achievements",
                  icon: (
                    <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ),
                },
              ].map((item, i) => (
                <li
                  key={i}
                  className="
                    group flex items-start gap-5 p-3 -mx-3 
                    rounded-2xl transition-all duration-300 
                    hover:bg-gray-50 dark:hover:bg-white/5 
                    hover:shadow-md hover:shadow-cyan-500/10 
                    border border-gray-200/50 dark:border-transparent 
                    hover:border-cyan-500/30
                  "
                >
                  <div className="flex-shrink-0 mt-1 transform group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <span className="text-base leading-relaxed text-gray-700 dark:text-slate-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Admin: Manage Course Content - Only visible to ADMIN */}
      {isAdmin && (
        <div
          className="
            mt-12
            backdrop-blur-xl
            bg-white/90 dark:bg-white/5
            border border-gray-300/70 dark:border-white/10
            rounded-3xl
            p-6 lg:p-8
            shadow-xl dark:shadow-2xl
        "
        >
          <h2
            className="
              text-2xl lg:text-3xl
              font-bold mb-6
              bg-gradient-to-r from-red-600 to-purple-600
              dark:from-red-400 dark:to-purple-400
              bg-clip-text text-transparent
            "
          >
            Admin: Manage Course Content
          </h2>

          {course.modules?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-700 dark:text-gray-400 mb-6">
                No modules yet.
              </p>
              <button
                onClick={() => setShowCreateModuleModal(true)}
                className="
            px-8 py-3
            bg-gradient-to-r from-cyan-700 to-purple-700
            dark:from-cyan-600 dark:to-purple-600
            text-white
            rounded-xl
            hover:scale-105
            transition
            text-base font-medium
            shadow-md hover:shadow-lg
          "
              >
                Create First Module
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {course.modules.map((module: any) => (
                <Disclosure
                  key={module.id}
                  as="div"
                  className="
            rounded-2xl
            border border-gray-300/60 dark:border-gray-700/50
            bg-white/85 dark:bg-black/30
            overflow-hidden
          "
                >
                  {({ open }) => (
                    <>
                      <Disclosure.Button
                        className="
                  flex w-full items-center justify-between
                  px-6 py-4 text-left
                  hover:bg-gray-50 dark:hover:bg-black/40
                  transition
                "
                      >
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-cyan-300">
                            {module.order}. {module.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-500 mt-1">
                            {module.lessons.length} lessons
                          </p>
                        </div>
                        <ChevronDown
                          className={`h-6 w-6 text-gray-600 dark:text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                        />
                      </Disclosure.Button>

                      {/* @ts-expect-error Headless UI v2 + React 18 children inference */}
                      <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                      >
                        {() => (
                            <Disclosure.Panel className="px-6 pb-6 pt-2 bg-gray-50/60 dark:bg-black/20">
                              {/* === Keep everything inside exactly the same === */}
                              <div className="flex gap-3 mb-5 justify-end">
                                <button
                                  onClick={() => handleOpenEditModule(module)}
                                  className="
                                  px-5 py-2 bg-blue-100 hover:bg-blue-200
                                  dark:bg-blue-600/40 dark:hover:bg-blue-600/60
                                  text-blue-800 dark:text-blue-200
                                  rounded-lg text-sm font-medium transition
                                  flex items-center gap-2
                                "
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Edit Module
                                </button>
                                <button
                                  onClick={() => {
                                    setModuleToDelete(module.id);
                                    setShowDeleteModuleConfirm(true);
                                  }}
                                  className="
            px-5 py-2 bg-red-100 hover:bg-red-200
            dark:bg-red-600/40 dark:hover:bg-red-600/60
            text-red-800 dark:text-red-200
            rounded-lg text-sm font-medium transition
            flex items-center gap-2
          "
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Delete Module
                                </button>
                              </div>

                              {/* Lessons list with arrows – keep your current version */}
                              <div className="space-y-4">
                                {module.lessons
                                  .sort((a: any, b: any) => a.order - b.order)
                                  .map((lesson: any, idx: number) => (
                                    <div
                                      key={lesson.id}
                                      className={`
                flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                ${
                  lesson.isPublished
                    ? "bg-white dark:bg-black/40 border-gray-200 dark:border-gray-700/50"
                    : "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-600/40"
                }
                ${reorderingModuleId === module.id ? "opacity-75 scale-[1.01]" : ""}
              `}
                                    >
                                      {/* Order + arrows */}
                                      <div className="flex items-center gap-4 min-w-[110px]">
                                        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                                          <span className="text-sm font-semibold w-6 text-center">
                                            {lesson.order}
                                          </span>
                                          <div className="flex flex-col gap-1 mt-1">
                                            <button
                                              onClick={() =>
                                                handleMoveLesson(
                                                  module.id,
                                                  lesson.id,
                                                  "up",
                                                )
                                              }
                                              disabled={
                                                idx === 0 ||
                                                reorderingModuleId === module.id
                                              }
                                              className="flex items-center justify-center w-9 h-9 rounded-lg text-2xl font-bold leading-none bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-600/40 dark:hover:bg-cyan-600/60 text-cyan-600 dark:text-cyan-400 disabled:bg-gray-200/50 dark:disabled:bg-gray-700/30 disabled:text-gray-400 disabled:cursor-not-allowed transition-all hover:scale-110 disabled:hover:scale-100"
                                              title="Move lesson up"
                                            >
                                              ↑
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleMoveLesson(
                                                  module.id,
                                                  lesson.id,
                                                  "down",
                                                )
                                              }
                                              disabled={
                                                idx ===
                                                  module.lessons.length - 1 ||
                                                reorderingModuleId === module.id
                                              }
                                              className="flex items-center justify-center w-9 h-9 rounded-lg text-2xl font-bold leading-none bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-600/40 dark:hover:bg-cyan-600/60 text-cyan-600 dark:text-cyan-400 disabled:bg-gray-200/50 dark:disabled:bg-gray-700/30 disabled:text-gray-400 disabled:cursor-not-allowed transition-all hover:scale-110 disabled:hover:scale-100"
                                              title="Move lesson down"
                                            >
                                              ↓
                                            </button>
                                          </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {lesson.title}
                                            {!lesson.isPublished && (
                                              <span className="ml-2 text-xs text-yellow-700 dark:text-yellow-400">
                                                (Draft)
                                              </span>
                                            )}
                                          </p>
                                          <p className="text-xs text-gray-600 dark:text-gray-500 capitalize mt-0.5">
                                            {lessonTypeDisplay[lesson.type] ||
                                              lesson.type.toLowerCase()}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex gap-2 flex-shrink-0">
                                        <button
                                          onClick={() =>
                                            handleOpenEditLesson(lesson)
                                          }
                                          className="
                    px-4 py-2 bg-blue-100 hover:bg-blue-200
                    dark:bg-blue-600/30 dark:hover:bg-blue-600/50
                    text-blue-800 dark:text-blue-300 rounded-lg text-sm transition
                  "
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => {
                                            setLessonToDelete(lesson.id);
                                            setShowDeleteLessonConfirm(true);
                                          }}
                                          className="
                    px-4 py-2 bg-red-100 hover:bg-red-200
                    dark:bg-red-600/30 dark:hover:bg-red-600/50
                    text-red-800 dark:text-red-300 rounded-lg text-sm transition
                  "
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))}

                                <button
                                  onClick={() => {
                                    setSelectedModuleId(module.id);
                                    setShowCreateLessonModal(true);
                                  }}
                                  className="
            mt-5 w-full sm:w-auto px-6 py-2.5 
            bg-gradient-to-r from-cyan-700 to-purple-700 
            dark:from-cyan-600 dark:to-purple-600 
            text-white rounded-lg hover:scale-105 transition text-sm font-medium
          "
                                >
                                  + Add Lesson to this Module
                                </button>
                              </div>
                            </Disclosure.Panel>
                        )}
                      </Transition>
                    </>
                  )}
                </Disclosure>
              ))}

              <button
                onClick={() => setShowCreateModuleModal(true)}
                className="
            w-full max-w-xs mx-auto block py-3
            bg-gradient-to-r from-green-700 to-teal-700
            dark:from-green-600 dark:to-teal-600
            text-white
            rounded-xl
            hover:scale-105
            transition mt-6 text-base font-medium
          "
              >
                + Create New Module
              </button>
            </div>
          )}
        </div>
      )}

      {/* NEW: Edit Module Modal */}
      {showEditModuleModal && editingModule && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          {/* Bigger modal: max-w-2xl instead of max-w-lg, added max-h and overflow */}
          <div
            className="
            bg-white/95 dark:bg-gray-900 
            backdrop-blur-xl 
            border border-cyan-500/30 dark:border-cyan-500/40 
            rounded-2xl 
            w-full max-w-3xl 
            max-h-[85vh] overflow-y-auto 
            shadow-2xl shadow-cyan-500/20 dark:shadow-cyan-900/40 
            p-8 lg:p-10
          "
          >
            {/* Heading – cyberpunk gradient in both modes */}
            <h3
              className="
              text-2xl lg:text-3xl 
              font-black mb-8 
              bg-gradient-to-r 
              from-cyan-700 to-purple-700 
              dark:from-cyan-400 dark:to-purple-400 
              bg-clip-text text-transparent
            "
            >
              Edit Module
            </h3>

            {/* Title input */}
            <input
              type="text"
              placeholder="Module Title *"
              value={editingModule.title}
              onChange={(e) =>
                setEditingModule({ ...editingModule, title: e.target.value })
              }
              className="
                w-full p-4 mb-6 
                bg-gray-50 dark:bg-gray-800 
                border border-gray-300 dark:border-gray-700 
                rounded-xl 
                text-gray-900 dark:text-white 
                placeholder:text-gray-500 dark:placeholder:text-gray-500 
                focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent 
                transition-all duration-200
              "
            />

            {/* Description textarea */}
            <textarea
              placeholder="Description (optional)"
              value={editingModule.description}
              onChange={(e) =>
                setEditingModule({
                  ...editingModule,
                  description: e.target.value,
                })
              }
              className="
                w-full p-4 mb-6 
                bg-gray-50 dark:bg-gray-800 
                border border-gray-300 dark:border-gray-700 
                rounded-xl 
                text-gray-900 dark:text-white 
                placeholder:text-gray-500 dark:placeholder:text-gray-500 
                h-32 resize-none 
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                transition-all duration-200
              "
            />

            {/* Order input */}
            <input
              type="number"
              placeholder="Order (optional)"
              value={editingModule.order || ""}
              onChange={(e) =>
                setEditingModule({
                  ...editingModule,
                  order: Number(e.target.value) || undefined,
                })
              }
              className="
                w-full p-4 mb-8 
                bg-gray-50 dark:bg-gray-800 
                border border-gray-300 dark:border-gray-700 
                rounded-xl 
                text-gray-900 dark:text-white 
                placeholder:text-gray-500 dark:placeholder:text-gray-500 
                focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent 
                transition-all duration-200
              "
            />

            {/* Buttons – neon cyberpunk style */}
            <div className="flex gap-4">
              <button
                onClick={handleSaveEditModule}
                className="
                  flex-1 py-4 
                  bg-gradient-to-r from-cyan-600 to-cyan-500 
                  hover:from-cyan-500 hover:to-cyan-400 
                  dark:from-cyan-700 dark:to-cyan-600 
                  dark:hover:from-cyan-600 dark:hover:to-cyan-500 
                  text-white font-medium 
                  rounded-xl 
                  shadow-lg shadow-cyan-500/30 
                  hover:shadow-cyan-500/50 
                  transform hover:scale-[1.02] 
                  transition-all duration-200
                "
              >
                Save Changes
              </button>

              <button
                onClick={() => {
                  setShowEditModuleModal(false);
                  setEditingModule(null);
                }}
                className="
                  flex-1 py-4 
                  bg-gradient-to-r from-gray-700 to-gray-600 
                  hover:from-gray-600 hover:to-gray-500 
                  dark:from-gray-600 dark:to-gray-500 
                  dark:hover:from-gray-500 dark:hover:to-gray-400 
                  text-white font-medium 
                  rounded-xl 
                  shadow-lg 
                  hover:shadow-xl 
                  transition-all duration-200
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Edit Lesson Modal (basic – quiz later) */}
      {showEditLessonModal && editingLesson && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          {/* Bigger modal: max-w-3xl, taller usable height */}
          <div
            className="
            bg-white/95 dark:bg-gray-900 
            backdrop-blur-xl 
            border border-cyan-500/30 dark:border-cyan-500/40 
            rounded-2xl 
            w-full max-w-5xl 
            max-h-[90vh] overflow-y-auto 
            shadow-2xl shadow-cyan-500/20 dark:shadow-cyan-900/40 
            p-8 lg:p-10
          "
          >
            {/* Heading – cyberpunk gradient, darker in light mode */}
            <h3
              className="
              text-2xl lg:text-3xl 
              font-black mb-8 
              bg-gradient-to-r 
              from-cyan-700 to-purple-700 
              dark:from-cyan-400 dark:to-purple-400 
              bg-clip-text text-transparent
            "
            >
              Edit Lesson
            </h3>

            {/* Title input */}
            <input
              type="text"
              placeholder="Lesson Title *"
              value={editingLesson.title}
              onChange={(e) =>
                setEditingLesson({ ...editingLesson, title: e.target.value })
              }
              className="
                w-full p-4 mb-6 
                bg-gray-50 dark:bg-gray-800 
                border border-gray-300 dark:border-gray-700 
                rounded-xl 
                text-gray-900 dark:text-white 
                placeholder:text-gray-500 dark:placeholder:text-gray-500 
                focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent 
                shadow-sm transition-all duration-200
              "
            />

            {/* Short description */}
            <textarea
              placeholder="Short description (optional)"
              value={editingLesson.description}
              onChange={(e) =>
                setEditingLesson({
                  ...editingLesson,
                  description: e.target.value,
                })
              }
              className="
                w-full p-4 mb-6 
                bg-gray-50 dark:bg-gray-800 
                border border-gray-300 dark:border-gray-700 
                rounded-xl 
                text-gray-900 dark:text-white 
                placeholder:text-gray-500 dark:placeholder:text-gray-500 
                h-28 resize-none 
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                shadow-sm transition-all duration-200
              "
            />

            {/* Lesson Type select */}
            <select
              value={editingLesson.type}
              onChange={(e) =>
                setEditingLesson({ ...editingLesson, type: e.target.value })
              }
              className="
                w-full p-4 mb-6 
                bg-gray-50 dark:bg-gray-800 
                border border-gray-300 dark:border-gray-700 
                rounded-xl 
                text-gray-900 dark:text-white 
                focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent 
                shadow-sm transition-all duration-200
              "
            >
              <option value="TEXT">Text / Reading</option>
              <option value="VIDEO">Video</option>
              <option value="AUDIO">Audio</option>
              <option value="QUIZ">Quiz</option>
              <option value="INTERACTIVE">Interactive</option>
              <option value="ASSIGNMENT">Assignment</option>
            </select>

            {/* Duration input */}
            <input
              type="number"
              min="0"
              placeholder="Duration in minutes (optional)"
              value={editingLesson.duration}
              onChange={(e) =>
                setEditingLesson({ ...editingLesson, duration: e.target.value })
              }
              className="
                w-full p-4 mb-6 
                bg-gray-50 dark:bg-gray-800 
                border border-gray-300 dark:border-gray-700 
                rounded-xl 
                text-gray-900 dark:text-white 
                placeholder:text-gray-500 dark:placeholder:text-gray-500 
                focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent 
                shadow-sm transition-all duration-200
              "
            />

            {/*editor for TEXT or QUIZ */}
            {(editingLesson.type === "TEXT" ||
              editingLesson.type === "QUIZ") && (
              <div className="mb-10">
                <label className="block text-gray-900 dark:text-gray-200 mb-3 font-medium text-lg">
                  {editingLesson.type === "TEXT"
                    ? "Main Content"
                    : "Quiz Instructions / Introduction"}
                </label>

                {/* Insert Table button */}
                <div className="mb-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditTablePicker(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Insert Table
                  </button>
                </div>

                {/* Force remount + editor */}
                <div className="ql-editor-wrapper">
                  <QuillEditor
                    value={editingLesson.content || ""} // direct string – stable
                    onChange={handleEditContentChange} // ← stable callback (add below)
                    quillRef={editQuillRef}
                  />
                </div>
                {/* Quiz */}
                {editingLesson.type === "QUIZ" && (
                  <div className="mt-8 space-y-6 border-t border-gray-300 dark:border-gray-700 pt-6">
                    <h4 className="text-xl font-bold text-gray-800 dark:text-purple-300">
                      Quiz Questions
                    </h4>

                    {quizQuestions.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No questions added yet. Add at least one below.
                      </p>
                    )}

                    {quizQuestions.map((q, qIdx) => (
                      <div
                        key={qIdx}
                        className={`
                        p-5 rounded-xl border relative
                        bg-white dark:bg-black/40
                        border-gray-300 dark:border-purple-500/30
                        shadow-sm dark:shadow-none
                      `}
                      >
                        {/* Remove button – red in both modes, but softer in light */}
                        <button
                          onClick={() =>
                            setQuizQuestions(
                              quizQuestions.filter((_, i) => i !== qIdx),
                            )
                          }
                          className={`
                          absolute top-3 right-3 text-sm font-medium
                          text-red-600 hover:text-red-700
                          dark:text-red-400 dark:hover:text-red-300
                          transition-colors
                        `}
                        >
                          Remove
                        </button>

                        <div className="mb-4">
                          <label className="block mb-1 font-medium text-gray-700 dark:text-purple-200">
                            Question {qIdx + 1}
                          </label>
                          <input
                            type="text"
                            value={q.text}
                            onChange={(e) => {
                              const updated = [...quizQuestions];
                              updated[qIdx].text = e.target.value;
                              setQuizQuestions(updated);
                            }}
                            className={`
                            w-full p-3 rounded-xl border
                            bg-gray-50 dark:bg-gray-800
                            border-gray-300 dark:border-gray-700
                            text-gray-900 dark:text-white
                            placeholder-gray-400 dark:placeholder-gray-500
                            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                            transition-all
                          `}
                            placeholder="Enter question text here..."
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          {["A", "B", "C", "D"].map((letter, optIdx) => (
                            <div
                              key={optIdx}
                              className="flex items-center gap-3"
                            >
                              <span className="text-gray-500 dark:text-gray-400 w-6 font-medium">
                                {letter}.
                              </span>
                              <input
                                type="text"
                                value={q.options[optIdx] || ""}
                                onChange={(e) => {
                                  const updated = [...quizQuestions];
                                  updated[qIdx].options[optIdx] =
                                    e.target.value;
                                  setQuizQuestions(updated);
                                }}
                                className={`
                                flex-1 p-2.5 rounded-lg border
                                bg-gray-50 dark:bg-gray-800
                                border-gray-300 dark:border-gray-700
                                text-gray-900 dark:text-white
                                placeholder-gray-400 dark:placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                                transition-all
                              `}
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
                                className={`
                                w-5 h-5
                                text-purple-600 dark:text-purple-500
                                border-gray-300 dark:border-gray-600
                                focus:ring-purple-500
                                cursor-pointer
                              `}
                              />
                            </div>
                          ))}
                        </div>

                        <textarea
                          placeholder="Explanation / feedback (optional)"
                          value={q.explanation || ""}
                          onChange={(e) => {
                            const updated = [...quizQuestions];
                            updated[qIdx].explanation = e.target.value;
                            setQuizQuestions(updated);
                          }}
                          className={`
                          w-full p-3 rounded-xl border resize-none h-20
                          bg-gray-50 dark:bg-gray-800
                          border-gray-300 dark:border-gray-700
                          text-gray-900 dark:text-white
                          placeholder-gray-400 dark:placeholder-gray-500
                          focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400
                          transition-all
                        `}
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setQuizQuestions([
                          ...quizQuestions,
                          {
                            text: "",
                            options: ["", "", "", ""],
                            correctIndex: 0,
                            explanation: "",
                          },
                        ]);
                      }}
                      className={`
                      w-full py-3 rounded-xl font-medium text-white
                      bg-gradient-to-r from-purple-600 to-pink-600
                      hover:from-purple-700 hover:to-pink-700
                      dark:from-purple-700 dark:to-pink-700
                      dark:hover:from-purple-600 dark:hover:to-pink-600
                      transition-all duration-200 shadow-sm hover:shadow
                    `}
                    >
                      + Add New Question
                    </button>
                  </div>
                )}

                {/* Grid picker */}
                {showEditTablePicker && (
                  <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]"
                    onClick={() => setShowEditTablePicker(false)}
                  >
                    <div
                      className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl border border-cyan-500 max-w-xs w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h4 className="text-lg font-bold mb-4 text-center">
                        Choose Table Size
                      </h4>
                      <div className="grid grid-cols-8 gap-2">
                        {Array.from({ length: 8 }).map((_, row) =>
                          Array.from({ length: 8 }).map((_, col) => {
                            const active =
                              hoveredEditCell?.[0] === row &&
                              hoveredEditCell?.[1] === col;
                            return (
                              <div
                                key={`${row}-${col}`}
                                onMouseEnter={() =>
                                  setHoveredEditCell([row, col])
                                }
                                onClick={() => {
                                  if (editQuillRef.current) {
                                    insertTable(editQuillRef, row + 1, col + 1);
                                  }
                                  setShowEditTablePicker(false);
                                  setHoveredEditCell(null);
                                }}
                                className={`w-9 h-9 border rounded cursor-pointer transition-all duration-150 flex items-center justify-center text-xs font-medium
                                  ${
                                    active
                                      ? "bg-cyan-600 text-white border-cyan-800 scale-110 shadow-md"
                                      : "bg-gray-100 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-700 border-gray-300 dark:border-gray-600"
                                  }
                                `}
                              >
                                {row + 1}×{col + 1}
                              </div>
                            );
                          }),
                        )}
                      </div>
                      <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                        Click to insert – Hover for preview
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Video URL */}
            {editingLesson.type === "VIDEO" && (
              <input
                type="url"
                placeholder="Video URL"
                value={editingLesson.videoUrl}
                onChange={(e) =>
                  setEditingLesson({
                    ...editingLesson,
                    videoUrl: e.target.value,
                  })
                }
                className="
                  w-full p-4 mb-6 
                  bg-gray-50 dark:bg-gray-800 
                  border border-gray-300 dark:border-gray-700 
                  rounded-xl 
                  text-gray-900 dark:text-white 
                  placeholder:text-gray-500 dark:placeholder:text-gray-500 
                  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent 
                  shadow-sm transition-all duration-200
                "
              />
            )}

            {/* Audio URL */}
            {editingLesson.type === "AUDIO" && (
              <input
                type="url"
                placeholder="Audio URL"
                value={editingLesson.audioUrl}
                onChange={(e) =>
                  setEditingLesson({
                    ...editingLesson,
                    audioUrl: e.target.value,
                  })
                }
                className="
                  w-full p-4 mb-6 
                  bg-gray-50 dark:bg-gray-800 
                  border border-gray-300 dark:border-gray-700 
                  rounded-xl 
                  text-gray-900 dark:text-white 
                  placeholder:text-gray-500 dark:placeholder:text-gray-500 
                  focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent 
                  shadow-sm transition-all duration-200
                "
              />
            )}

            {/* Published checkbox */}
            <label className="flex items-center gap-3 mt-6 mb-8 cursor-pointer text-gray-800 dark:text-gray-300">
              <input
                type="checkbox"
                checked={editingLesson.isPublished}
                onChange={(e) =>
                  setEditingLesson({
                    ...editingLesson,
                    isPublished: e.target.checked,
                  })
                }
                className="w-5 h-5 accent-cyan-600 dark:accent-cyan-500"
              />
              <span className="font-medium">
                Published (visible to students)
              </span>
            </label>

            {/* Buttons – neon cyberpunk style */}
            <div className="flex gap-4">
              <button
                onClick={handleSaveEditLesson}
                className="
                  flex-1 py-4 
                  bg-gradient-to-r from-cyan-600 to-purple-600 
                  hover:from-cyan-500 hover:to-purple-500 
                  dark:from-cyan-700 dark:to-purple-700 
                  dark:hover:from-cyan-600 dark:hover:to-purple-600 
                  text-white font-medium 
                  rounded-xl 
                  shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 
                  transform hover:scale-[1.02] 
                  transition-all duration-200
                "
              >
                Save Changes
              </button>

              <button
                onClick={() => {
                  setShowEditLessonModal(false);
                  setEditingLesson(null);
                }}
                className="
                  flex-1 py-4 
                  bg-gradient-to-r from-gray-600 to-gray-500 
                  hover:from-gray-500 hover:to-gray-400 
                  dark:from-gray-700 dark:to-gray-600 
                  dark:hover:from-gray-600 dark:hover:to-gray-500 
                  text-white font-medium 
                  rounded-xl 
                  shadow-lg hover:shadow-xl 
                  transition-all duration-200
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Module Modal */}
      {showCreateModuleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-lg border border-cyan-500/30">
            <h3 className="text-2xl font-bold text-cyan-300 mb-6">
              Create New Module
            </h3>
            <input
              type="text"
              placeholder="Module Title *"
              value={newModule.title}
              onChange={(e) =>
                setNewModule({ ...newModule, title: e.target.value })
              }
              className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white"
            />
            <textarea
              placeholder="Description (optional)"
              value={newModule.description}
              onChange={(e) =>
                setNewModule({ ...newModule, description: e.target.value })
              }
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
          <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-4xl border border-cyan-500/30 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-cyan-300 mb-6">
              Add Lesson to Module
            </h3>

            <input
              type="text"
              placeholder="Lesson Title *"
              value={newLesson.title}
              onChange={(e) =>
                setNewLesson({ ...newLesson, title: e.target.value })
              }
              className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            <textarea
              placeholder="Short description (optional)"
              value={newLesson.description}
              onChange={(e) =>
                setNewLesson({ ...newLesson, description: e.target.value })
              }
              className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white h-20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            <select
              value={newLesson.type}
              onChange={(e) => {
                const newType = e.target.value as typeof newLesson.type;
                setNewLesson({
                  ...newLesson,
                  type: newType,
                  content:
                    newType === "TEXT" || newType === "QUIZ"
                      ? newLesson.content
                      : "",
                  videoUrl: newType === "VIDEO" ? newLesson.videoUrl : "",
                  audioUrl: newType === "AUDIO" ? newLesson.audioUrl : "",
                });
                if (newType !== "QUIZ") setQuizQuestions([]);
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

            <input
              type="number"
              min="0"
              placeholder="Duration in minutes (optional)"
              value={newLesson.duration}
              onChange={(e) =>
                setNewLesson({ ...newLesson, duration: e.target.value })
              }
              className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />

            {/* UPDATED: Rich editor instead of textarea */}
            {(newLesson.type === "TEXT" || newLesson.type === "QUIZ") && (
              <div className="mb-8 relative">
                <label className="block text-gray-900 dark:text-gray-200 mb-3 font-medium text-lg">
                  {newLesson.type === "TEXT"
                    ? "Main Content"
                    : "Quiz Instructions / Introduction"}
                </label>

                {/* NEW: Insert Table button – placed above editor for easy access */}
                <div className="mb-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateTablePicker(true);
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <span>Insert Table</span>
                    <span className="text-sm opacity-80">(grid picker)</span>
                  </button>

                  {/* Optional tooltip/help text */}
                  <span className="text-sm text-gray-400">
                    Click to choose size, or paste HTML table directly
                  </span>
                </div>

                {/* Scrollable wrapper – makes toolbar sticky inside modal */}
                <div className="ql-editor-wrapper">
                  <QuillEditor
                    value={newLesson.content}
                    onChange={(html) =>
                      setNewLesson((p) => ({ ...p, content: html }))
                    }
                    quillRef={createQuillRef}
                  />
                </div>
                {/* NEW: Grid Picker Popover */}
                {showCreateTablePicker && (
                  <div
                    className="fixed inset-0 flex items-center justify-center bg-black/30 z-[9999]" // ← overlay to make it modal-like & catch outside clicks
                    onClick={() => setShowCreateTablePicker(false)} // close on outside click
                  >
                    <div
                      className="relative bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl border border-cyan-500/50 max-w-md w-full"
                      onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside picker
                    >
                      <h4 className="text-lg font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">
                        Choose Table Size
                      </h4>

                      <div className="grid grid-cols-10 gap-1.5 mb-4">
                        {Array.from({ length: 10 }).map((_, row) =>
                          Array.from({ length: 10 }).map((_, col) => {
                            const active =
                              hoveredCreateCell &&
                              row <= hoveredCreateCell[0] &&
                              col <= hoveredCreateCell[1];

                            return (
                              <div
                                key={`${row}-${col}`}
                                onMouseEnter={() =>
                                  setHoveredCreateCell([row, col])
                                }
                                onClick={() => {
                                  insertTable(createQuillRef, row + 1, col + 1);
                                  setShowCreateTablePicker(false);
                                  setHoveredCreateCell(null);
                                }}
                                className={`w-7 h-7 border rounded-sm cursor-pointer transition-all duration-150
                                  ${
                                    active
                                      ? "bg-cyan-500 border-cyan-700 shadow-md scale-110"
                                      : "border-gray-300 dark:border-gray-600 hover:bg-cyan-100 dark:hover:bg-cyan-900/30"
                                  }
                                `}
                              />
                            );
                          }),
                        )}
                      </div>

                      <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {hoveredCreateCell
                          ? `${hoveredCreateCell[0] + 1} rows × ${hoveredCreateCell[1] + 1} columns`
                          : "Hover to preview — Click to insert"}
                      </div>

                      <button
                        onClick={() => setShowCreateTablePicker(false)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {newLesson.type === "VIDEO" && (
              <input
                type="url"
                placeholder="Video URL (YouTube, Vimeo, etc.)"
                value={newLesson.videoUrl}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, videoUrl: e.target.value })
                }
                className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            )}

            {newLesson.type === "AUDIO" && (
              <input
                type="url"
                placeholder="Audio URL (mp3, streaming link, etc.)"
                value={newLesson.audioUrl}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, audioUrl: e.target.value })
                }
                className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            )}

            {/* QUIZ SECTION – only shown when type = QUIZ */}

            {newLesson.type === "QUIZ" && (
              <div className="mt-8 space-y-6 border-t border-gray-700 pt-6">
                <h4 className="text-xl font-bold text-purple-300">
                  Quiz Questions
                </h4>

                {quizQuestions.length === 0 && (
                  <p className="text-gray-400 italic">
                    No questions added yet. Add at least one.
                  </p>
                )}

                {quizQuestions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-5 bg-black/40 rounded-xl border border-purple-500/30 relative"
                  >
                    <button
                      onClick={() =>
                        setQuizQuestions(
                          quizQuestions.filter((_, i) => i !== qIdx),
                        )
                      }
                      className="absolute top-3 right-3 text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>

                    <div className="mb-4">
                      <label className="block text-purple-200 mb-1">
                        Question {qIdx + 1}
                      </label>
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
                      {["A", "B", "C", "D"].map((letter, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-3">
                          <span className="text-gray-400 w-6 font-medium">
                            {letter}.
                          </span>
                          <input
                            type="text"
                            value={q.options[optIdx] || ""}
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
                      value={q.explanation || ""}
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
                        text: "",
                        options: ["", "", "", ""],
                        correctIndex: 0,
                        explanation: "",
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
                onChange={(e) =>
                  setNewLesson({ ...newLesson, isPublished: e.target.checked })
                }
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
                  (newLesson.type === "QUIZ" && quizQuestions.length === 0) ||
                  (newLesson.type === "VIDEO" && !newLesson.videoUrl.trim()) ||
                  (newLesson.type === "AUDIO" && !newLesson.audioUrl.trim())
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
            <h3 className="text-2xl font-bold text-red-400 mb-4">
              Delete Module?
            </h3>
            <p className="text-gray-300 mb-6">
              This will delete the module and all its lessons. This action
              cannot be undone.
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
            <h3 className="text-2xl font-bold text-red-400 mb-4">
              Delete Lesson?
            </h3>
            <p className="text-gray-300 mb-6">This action cannot be undone.</p>
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