    // client/src/pages/CourseDetail.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { 
  BookOpen, Play, CheckCircle, Lock, ArrowLeft, Brain, Zap, 
  ChevronDown, ChevronUp 
} from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(null);

  const fetchCourseDetail = useCallback(async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      const data = response.data;
      console.log('Course detail response:', data); // debug: check isEnrolled
      setCourse(data.course);
      setIsEnrolled(!!data.enrollment);
      return data.course;
    } catch (error) {
      console.error('Failed to fetch course:', error);
      return null;
    }
  }, [id]);

  // const fetchModules = useCallback(async (courseData: any) => {
  //   try {
  //     console.log('Fetching modules for course:', id);
  //     const modRes = await api.get(`/courses/${id}/modules`);
  //     console.log('Modules API response:', modRes.data);
  //     const fetchedModules = modRes.data.modules || [];

  //     if (!courseData?.lessons) {
  //       console.log('No course lessons yet');
  //       setModules(fetchedModules);
  //       return;
  //     }

  //     console.log('Total lessons:', courseData.lessons.length);

  //     const modulesWithLessons = fetchedModules.map((mod: any) => {
  //       const filtered = courseData.lessons?.filter((l: any) => l.moduleId === mod.id) || [];
  //     + console.log(`Module ${mod.title} (id: ${mod.id}) → found ${filtered.length} lessons`);
  //     + console.log('Lessons for this module:', filtered);
  //       return { ...mod, lessons: filtered };
  //     });

  //     setModules(modulesWithLessons);
  //   } catch (error) {
  //     console.error('Failed to fetch modules:', error);
  //     setModules([]);
  //   }
  // }, [id]);

 useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Get course basic info + enrollment status
      const courseRes = await api.get(`/courses/${id}`);
      const data = courseRes.data;
      console.log('Course detail:', data);
      setCourse(data.course);
      setIsEnrolled(!!data.enrollment);

      // 2. Get modules **with lessons included**
      const modulesRes = await api.get(`/courses/${id}/modules`);
      console.log('Modules with lessons:', modulesRes.data);
      setModules(modulesRes.data.modules || []);
    } catch (error) {
      console.error('Failed to load course data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (id) loadData();
}, [id]); // ← FIXED: added deps to remove exhaustive-deps warning

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const res = await api.post('/courses/enroll', { courseId: id });
      console.log('Enroll response:', res.data);
      if (res.data.message?.includes('Already')) {
        alert('You are already enrolled!');
      } else {
        alert('Successfully enrolled!');
      }
      await fetchCourseDetail(); // Refresh to update isEnrolled
      setIsEnrolled(true);
    } catch (error: any) {
      console.error('Enroll error:', error.response?.data);
      alert(error.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (index: number) => {
    setOpenModuleIndex(openModuleIndex === index ? null : index);
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
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
          {course.title}
        </h1>
        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
          {course.description}
        </p>

        {!isEnrolled ? (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-cyan-500/50 hover:brightness-110 transition-all disabled:opacity-50"
          >
            {enrolling ? 'Enrolling...' : 'Enroll Now'}
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 font-medium">
            <CheckCircle className="w-5 h-5" />
            Enrolled
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Modules Accordion + Lessons */}
        <div className="lg:col-span-2">
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Course Content
            </h2>

            {modules.length > 0 ? (
              <div className="space-y-5">
                {modules.map((mod: any, index: number) => (
                  <div key={mod.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => toggleModule(index)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            Module {mod.order}: {mod.title}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {mod.lessons?.length || 0} lessons • {mod.estTimeMin || '?'} min
                          </p>
                        </div>
                      </div>

                      {openModuleIndex === index ? (
                        <ChevronUp className="w-6 h-6 text-cyan-400" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-cyan-400" />
                      )}
                    </button>

                    {openModuleIndex === index && (
                      <div className="px-6 pb-6 space-y-4">
                        {mod.lessons?.length > 0 ? (
                          mod.lessons
                            .sort((a: any, b: any) => a.order - b.order)
                            .map((lesson: any, lessonIndex: number) => (
                              <div
                                key={lesson.id}
                                onClick={() => isEnrolled && navigate(`/lessons/${lesson.id}`)}
                                className={`group p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                                  isEnrolled
                                    ? 'bg-white/5 border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20'
                                    : 'bg-white/5 border-white/10 opacity-60 cursor-not-allowed'
                                }`}
                              >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 ${
                                    isEnrolled ? 'bg-cyan-500/20' : 'bg-gray-700/30'
                                  }`}>
                                    {isEnrolled ? (
                                      <Play className="w-5 h-5 text-cyan-400" />
                                    ) : (
                                      <Lock className="w-5 h-5 text-gray-500" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-bold text-white">
                                      {lessonIndex + 1}. {lesson.title}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                      <span className="capitalize font-medium">{lesson.type.toLowerCase()}</span>
                                      {lesson.duration && (
                                        <>
                                          <span>•</span>
                                          <span>{lesson.duration} min</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {lesson.progress?.completed && (
                                  <CheckCircle className="w-6 h-6 text-green-500" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-8">
                            No lessons in this module yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {course.lessons?.length > 0 ? (
                  course.lessons.map((lesson: any) => (
                    <div
                      key={lesson.id}
                      onClick={() => isEnrolled && navigate(`/lessons/${lesson.id}`)}
                      className={`group p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        isEnrolled
                          ? 'bg-white/5 border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20'
                          : 'bg-white/5 border-white/10 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isEnrolled ? 'bg-cyan-500/20' : 'bg-gray-700/30'
                        }`}>
                          {isEnrolled ? (
                            <Play className="w-6 h-6 text-cyan-400" />
                          ) : (
                            <Lock className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-white">{lesson.title}</h4>
                          <p className="text-gray-400 mt-1 capitalize">{lesson.type.toLowerCase()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-16 text-lg">
                    No lessons available yet
                  </p>
                )}
              </div>
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
                  <p className="text-lg font-bold text-white">
                    {course.teacher.firstName} {course.teacher.lastName}
                  </p>
                  <p className="text-gray-400">Instructor</p>
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
                <li key={i} className="flex items-start gap-4 text-gray-300">
                  <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}