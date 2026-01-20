// client/src/pages/MyCourses.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTranslation } from '../lib/translations';
import api from '../lib/api';
import { BookOpen, TrendingUp } from 'lucide-react';

export default function MyCourses() {
  const { settings: accessibilitySettings } = useAccessibility();
  const t = useTranslation(accessibilitySettings.language);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/courses/my-enrollments');
      setEnrollments(response.data.enrollments);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
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

      {/* Page Title */}
      <div className="text-center mb-12 lg:mb-14 px-6">
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 pb-2 md:pb-3 leading-tight md:leading-snug">
          {t.courses.myCourses}
        </h1>
        <p className="text-xl md:text-2xl text-slate-700 dark:text-gray-300 font-light tracking-wide">
          {accessibilitySettings.language === 'fil' ? 'Magpatuloy kung saan ka tumigil — ang iyong paglalakbay sa pag-aaral ay nagpapatuloy.' : 'Pick up where you left off — your learning journey continues.'}
        </p>
      </div>

      {enrollments.length === 0 ? (
        // Beautiful Empty State
        <div className="text-center py-24 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 mb-10 shadow-2xl">
            <BookOpen className="w-20 h-20 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            {t.courses.noEnrolled}
          </h2>
          <p className="text-slate-700 dark:text-gray-400 text-lg mb-10">
            {accessibilitySettings.language === 'fil' ? 'Simulan ang iyong paglalakbay sa pag-aaral gamit ang aming AI-powered na mga kurso.' : 'Start your learning journey with our AI-powered courses.'}
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:from-cyan-400 hover:to-purple-500 transform hover:scale-105 transition-all duration-300"
          >
            <BookOpen className="w-6 h-6" />
            {accessibilitySettings.language === 'fil' ? 'Tingnan ang Lahat ng Kurso' : 'Browse All Courses'}
          </Link>
        </div>
      ) : (
        // Course Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              to={`/courses/${enrollment.Course?.id}`}
              className="group block h-full"
            >
              <div className="h-full bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.04] hover:shadow-cyan-500/30 hover:border-cyan-500/50 flex flex-col">

                {/* Course Header - Now with BookOpen */}
                <div className="h-48 relative flex items-center justify-center bg-gradient-to-br from-cyan-600/30 via-purple-600/20 to-indigo-700/30">
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="relative z-10 p-8 bg-black/50 backdrop-blur-xl rounded-3xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <BookOpen className="w-20 h-20 text-cyan-400 drop-shadow-2xl" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>

                {/* Content */}
                <div className="p-7 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                      {enrollment.Course?.title}
                    </h3>

                    {/* Progress Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-gray-400">{accessibilitySettings.language === 'fil' ? 'Progreso' : 'Progress'}</span>
                        <span className="font-bold text-cyan-500 dark:text-cyan-300">
                          {Math.round(enrollment.progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden"
                          style={{ width: `${enrollment.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lessons Count */}
                  <div className="mt-6 flex items-center gap-3 text-slate-700 dark:text-gray-300">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium">
                      {enrollment.Course?._count?.Lesson || 0} {accessibilitySettings.language === 'fil' ? 'aralin' : 'lessons'}
                    </span>
                  </div>
                </div>

                {/* Hover Shine Effect */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 translate-x-full group-hover:translate-x-0 transition-transform duration-1000 pointer-events-none"></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}