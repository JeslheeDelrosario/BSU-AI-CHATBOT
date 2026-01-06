// client/src/pages/Courses.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { BookOpen, Clock, Users } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
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
    <div className="py-16 lg:py-20">

      {/* Hero Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
          Explore Courses
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide max-w-4xl mx-auto">
          Unlock the future of learning — AI-powered, personalized, and built for you.
        </p>
      </div>

      {/* Perfectly Sized Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto px-6">
        {courses.map((course) => (
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
                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6">
                  {course.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm mb-5">
                  <span className="flex items-center gap-2 text-cyan-400">
                    <Clock className="w-5 h-5" />
                    <span className="text-gray-300">
                      {course.duration ? `${Math.floor(course.duration / 60)}h` : 'Self-paced'}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-purple-400">
                    <Users className="w-5 h-5" />
                    <span className="text-gray-300">
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
      {courses.length === 0 && (
        <div className="text-center py-32">
          <BookOpen className="w-24 h-24 mx-auto text-gray-600 mb-8" />
          <p className="text-2xl text-gray-500">No courses available yet.</p>
          <p className="text-gray-600 mt-4">New courses are being prepared!</p>
        </div>
      )}
    </div>
  );
}