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
    // MODIFIED: Green spinner + dark background
    return (
      <div className="flex justify-center items-center h-64 bg-gradient-to-b from-[#06251a] to-[#095535]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    // MODIFIED: Full dark green gradient background
    <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] p-6 space-y-10">

      {/* MODIFIED: Header - Green text + clean spacing */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-green-50 mb-4">
          Explore Courses
        </h1>
        <p className="text-green-300 text-lg max-w-2xl mx-auto">
          Discover personalized learning paths tailored to your needs
        </p>
      </div>

      {/* MODIFIED: Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.id}`}
            className="group block"
          >
            {/* MODIFIED: Course Card - Full glassmorphism + hover lift */}
            <div className="bg-green-900/40 backdrop-blur-xl rounded-2xl border border-green-700/50 shadow-xl overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:border-green-500">
              
              {/* MODIFIED: Course Image Area - Green gradient */}
              <div className="h-48 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 flex items-center justify-center">
                <BookOpen className="w-20 h-20 text-green-50 opacity-90" />
              </div>

              {/* MODIFIED: Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-green-50 mb-2 line-clamp-2 group-hover:text-green-200 transition-colors">
                  {course.title}
                </h3>
                <p className="text-green-300 text-sm mb-5 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                {/* MODIFIED: Stats Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-green-200">
                    <Clock className="w-4 h-4 text-green-400" />
                    {course.duration ? `${Math.floor(course.duration / 60)}h` : 'N/A'}
                  </span>
                  <span className="flex items-center gap-1.5 text-green-200">
                    <Users className="w-4 h-4 text-green-400" />
                    {course._count?.enrollments || 0}
                  </span>
                  {/* MODIFIED: Level Badge */}
                  <span className="ml-auto px-3 py-1 bg-green-700/60 text-green-100 rounded-full text-xs font-semibold">
                    {course.level}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}