// client/src/pages/CourseDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { BookOpen, Clock, Users, Play, CheckCircle, Lock, ArrowLeft, Brain, Zap } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.course);
      setIsEnrolled(response.data.isEnrolled);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post('/courses/enroll', { courseId: id });
      setIsEnrolled(true);
      alert('Successfully enrolled! Welcome to the course.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(false);
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

  return (
  <div className="py-6 lg:py-10">  {/* Reduced from py-10/16 */}

    {/* Back Button - moved up */}
    <button
      onClick={() => navigate('/courses')}
      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6 group"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      Back to Courses
    </button>

    {/* Course Header - tighter spacing */}
    <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl mb-8">  {/* Reduced mb-12 → mb-8 */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">  {/* Reduced gap-10 → gap-8 */}
        <div className="flex-1">
          <span className={`inline-block px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider border mb-5 ${
            course.level === 'Beginner' ? 'text-cyan-300 border-cyan-500/60 bg-cyan-500/10' :
            course.level === 'Intermediate' ? 'text-purple-300 border-purple-500/60 bg-purple-500/10' :
            'text-pink-300 border-pink-500/60 bg-pink-500/10'
          }`}>
            {course.level}
          </span>

          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white mb-5 leading-tight">  {/* Reduced mb-6 → mb-5 */}
            {course.title}
          </h1>
          <p className="text-xl text-slate-700 dark:text-gray-300 leading-relaxed mb-7 max-w-4xl">  {/* Reduced mb-8 → mb-7 */}
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

        {/* Enroll Button */}
        {user?.role === 'STUDENT' && (
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
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
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

        {/* Lessons List */}
        <div className="lg:col-span-2">
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Course Content
            </h2>

            {course.lessons && course.lessons.length > 0 ? (
              <div className="space-y-5">
                {course.lessons.map((lesson: any, index: number) => (
                  <div
                    key={lesson.id}
                    onClick={() => isEnrolled && navigate(`/lessons/${lesson.id}`)}
                    className={`group p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isEnrolled
                        ? 'bg-white/5 border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/20'
                        : 'bg-white/5 border-white/10 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 ${
                          isEnrolled ? 'bg-cyan-500/20' : 'bg-gray-700/30'
                        }`}>
                          {isEnrolled ? (
                            <Play className="w-7 h-7 text-cyan-400" />
                          ) : (
                            <Lock className="w-7 h-7 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            {index + 1}. {lesson.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-gray-400 mt-2">
                            <span className="capitalize font-medium">{lesson.type.toLowerCase()}</span>
                            <span>•</span>
                            <span>{lesson.duration} min</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-xs font-bold ${
                        lesson.status === 'PUBLISHED'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'bg-gray-700/20 text-gray-400 border border-gray-600/50'
                      }`}>
                        {lesson.status === 'PUBLISHED' ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-600 dark:text-gray-500 py-16 text-lg">
                No lessons available yet. Check back soon!
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
    </div>
  );
}


