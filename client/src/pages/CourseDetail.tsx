// client/src/pages/CourseDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { BookOpen, Clock, Users, Play, CheckCircle, Lock, ArrowLeft } from 'lucide-react';

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
      alert('Successfully enrolled in course!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    // MODIFIED: Green spinner matching theme
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-green-300">Course not found</p>
      </div>
    );
  }

  return (
    // MODIFIED: Full dark green gradient background
    <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] p-6 space-y-8">
      
      {/* MODIFIED: Back Button - Green theme */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-2 text-green-300 hover:text-green-100 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Courses
      </button>

      {/* MODIFIED: Course Header - Glassmorphism + Green gradient */}
      <div className="bg-green-900/40 backdrop-blur-xl rounded-2xl p-8 text-green-50 border border-green-700/50 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <span className="px-4 py-1.5 bg-green-700/60 rounded-full text-sm font-medium">
              {course.level}
            </span>
            <h1 className="text-4xl font-bold mt-4 mb-3">{course.title}</h1>
            <p className="text-green-200 text-lg leading-relaxed mb-6">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-400" />
                {Math.floor((course.duration || 0) / 60)} hours
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                {course._count?.enrollments || 0} students
              </span>
              <span className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-400" />
                {course._count?.lessons || 0} lessons
              </span>
            </div>
          </div>

          {user?.role === 'STUDENT' && (
            <div className="lg:ml-6">
              {isEnrolled ? (
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg">
                  <CheckCircle className="w-6 h-6" />
                  Enrolled
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-green-950 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:from-green-400 hover:to-green-500 transform hover:scale-105 transition-all duration-300 disabled:opacity-70"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODIFIED: Main Grid - Glass cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lessons List */}
        <div className="lg:col-span-2 bg-green-900/40 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-green-700/50">
          <h2 className="text-2xl font-bold text-green-100 mb-6">Course Content</h2>
          
          {course.lessons && course.lessons.length > 0 ? (
            <div className="space-y-4">
              {course.lessons.map((lesson: any, index: number) => (
                <div
                  key={lesson.id}
                  className={`p-5 rounded-xl border transition-all duration-200 ${
                    isEnrolled
                      ? 'bg-green-800/30 border-green-600/50 hover:bg-green-700/50 hover:border-green-500 cursor-pointer'
                      : 'bg-green-900/20 border-green-700/30 opacity-70'
                  }`}
                  onClick={() => isEnrolled && navigate(`/lessons/${lesson.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isEnrolled ? 'bg-green-700/60' : 'bg-green-800/40'
                      }`}>
                        {isEnrolled ? (
                          <Play className="w-6 h-6 text-green-300" />
                        ) : (
                          <Lock className="w-6 h-6 text-green-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-100">
                          {index + 1}. {lesson.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-green-300 mt-1">
                          <span className="capitalize">{lesson.type.toLowerCase()}</span>
                          <span>•</span>
                          <span>{lesson.duration} min</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      lesson.status === 'PUBLISHED'
                        ? 'bg-emerald-700/60 text-emerald-200'
                        : 'bg-gray-700/60 text-gray-300'
                    }`}>
                      {lesson.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-400 text-center py-10">No lessons available yet</p>
          )}
        </div>

        {/* MODIFIED: Right Sidebar - All glass cards */}
        <div className="space-y-6">
          {/* Teacher Info */}
          {course.teacher && (
            <div className="bg-green-900/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-green-700/50">
              <h3 className="font-bold text-green-100 mb-4">Instructor</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-green-50 font-bold text-lg">
                  {course.teacher.firstName[0]}{course.teacher.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-green-100">
                    {course.teacher.firstName} {course.teacher.lastName}
                  </p>
                  <p className="text-sm text-green-300">{course.teacher.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="bg-green-900/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-green-700/50">
              <h3 className="font-bold text-green-100 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-green-700/60 text-green-200 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* What You'll Learn */}
          <div className="bg-green-900/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-green-700/50">
            <h3 className="font-bold text-green-100 mb-5">What You'll Learn</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-green-200">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Master core concepts and fundamentals</span>
              </li>
              <li className="flex items-start gap-3 text-green-200">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Practice with interactive exercises</span>
              </li>
              <li className="flex items-start gap-3 text-green-200">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Get personalized AI tutoring support</span>
              </li>
              <li className="flex items-start gap-3 text-green-200">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Earn achievements and certificates</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}