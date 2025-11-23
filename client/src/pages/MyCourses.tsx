// client/src/pages/MyCourses.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { BookOpen, TrendingUp } from 'lucide-react';

export default function MyCourses() {
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
    // MODIFIED: Green spinner + full dark background
    return (
      <div className="flex justify-center items-center h-64 bg-gradient-to-b from-[#06251a] to-[#095535]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    // MODIFIED: Full dark green gradient + generous spacing
    <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] p-6 space-y-10">

      {/* MODIFIED: Page Title */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-green-50 mb-3">
          My Courses
        </h1>
        <p className="text-green-300 text-lg">
          Continue your learning journey
        </p>
      </div>

      {enrollments.length === 0 ? (
        // MODIFIED: Beautiful empty state with glass effect
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-green-800/40 backdrop-blur-xl rounded-full mb-8 shadow-2xl">
            <BookOpen className="w-14 h-14 text-green-400" />
          </div>
          <p className="text-green-300 text-xl mb-8">
            You haven't enrolled in any courses yet.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-green-950 font-bold text-lg rounded-xl shadow-2xl hover:from-green-400 hover:to-emerald-500 transform hover:scale-105 transition-all duration-300"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        // MODIFIED: Grid with perfectly equal height cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              to={`/courses/${enrollment.course.id}`}
              className="group block h-full"   // ← Ensures link takes full height
            >
              {/* MODIFIED: Glass card with equal height using flex col */}
              <div className="h-full bg-green-900/40 backdrop-blur-xl rounded-2xl border border-green-700/50 shadow-xl overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:border-green-500 group-hover:shadow-2xl flex flex-col">
                
                {/* Title Section */}
                <div className="p-6 border-b border-green-700/30">
                  <h3 className="text-xl font-bold text-green-50 line-clamp-2 group-hover:text-green-200 transition-colors">
                    {enrollment.course.title}
                  </h3>
                </div>

                {/* Content Area - Takes remaining space */}
                <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-green-300">Progress</span>
                      <span className="font-bold text-green-100">
                        {Math.round(enrollment.progress)}%
                      </span>
                    </div>
                    {/* MODIFIED: Smooth green gradient progress bar */}
                    <div className="w-full bg-green-800/50 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Lessons Count */}
                  <div className="flex items-center gap-3 text-green-200">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium">
                      {enrollment.course._count?.lessons || 0} lessons
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}