// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import api from '../lib/api';
// import { BookOpen, Trophy, Clock, TrendingUp, Play, Award } from 'lucide-react';

// interface DashboardStats {
//   overview: {
//     enrolledCourses?: number;
//     completedCourses?: number;
//     averageScore?: number;
//     totalTimeSpent?: number;
//     totalStudents?: number;
//     totalCourses?: number;
//     totalEnrollments?: number;
//   };
//   recentProgress?: any[];
//   achievements?: any[];
//   upcomingLessons?: any[];
//   recentEnrollments?: any[];
//   courseStats?: any[];
// }

// export default function Dashboard() {
//   const { user } = useAuth();
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardStats();
//   }, []);

//   const fetchDashboardStats = async () => {
//     try {
//       const response = await api.get('/dashboard/stats');
//       setStats(response.data);
//     } catch (error) {
//       console.error('Failed to fetch dashboard stats:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatTime = (seconds: number) => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     return `${hours}h ${minutes}m`;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//       </div>
//     );
//   }

//   const isStudent = user?.role === 'STUDENT';

//   return (
//     <div className="space-y-6">
//       {/* Welcome Header */}
//       <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
//         <h1 className="text-3xl font-bold mb-2">
//           Welcome back, {user?.firstName}! 👋
//         </h1>
//         <p className="text-indigo-100">
//           {isStudent
//             ? "Ready to continue your learning journey?"
//             : "Here's what's happening in your courses"}
//         </p>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {isStudent ? (
//           <>
//             <StatCard
//               icon={<BookOpen className="w-6 h-6" />}
//               label="Enrolled Courses"
//               value={stats?.overview.enrolledCourses || 0}
//               color="bg-blue-500"
//             />
//             <StatCard
//               icon={<Trophy className="w-6 h-6" />}
//               label="Completed"
//               value={stats?.overview.completedCourses || 0}
//               color="bg-green-500"
//             />
//             <StatCard
//               icon={<TrendingUp className="w-6 h-6" />}
//               label="Average Score"
//               value={`${Math.round(stats?.overview.averageScore || 0)}%`}
//               color="bg-purple-500"
//             />
//             <StatCard
//               icon={<Clock className="w-6 h-6" />}
//               label="Time Spent"
//               value={formatTime(stats?.overview.totalTimeSpent || 0)}
//               color="bg-orange-500"
//             />
//           </>
//         ) : (
//           <>
//             <StatCard
//               icon={<BookOpen className="w-6 h-6" />}
//               label="Total Courses"
//               value={stats?.overview.totalCourses || 0}
//               color="bg-blue-500"
//             />
//             <StatCard
//               icon={<TrendingUp className="w-6 h-6" />}
//               label="Total Students"
//               value={stats?.overview.totalStudents || 0}
//               color="bg-green-500"
//             />
//             <StatCard
//               icon={<Trophy className="w-6 h-6" />}
//               label="Enrollments"
//               value={stats?.overview.totalEnrollments || 0}
//               color="bg-purple-500"
//             />
//           </>
//         )}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Recent Progress / Enrollments */}
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             {isStudent ? 'Recent Progress' : 'Recent Enrollments'}
//           </h2>
//           <div className="space-y-3">
//             {isStudent ? (
//               stats?.recentProgress && stats.recentProgress.length > 0 ? (
//                 stats.recentProgress.map((progress: any, index: number) => (
//                   <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                     <div className="flex items-center gap-3">
//                       <Play className="w-5 h-5 text-indigo-600" />
//                       <div>
//                         <p className="font-medium text-gray-900">{progress.lesson.title}</p>
//                         <p className="text-sm text-gray-500">
//                           {progress.completed ? 'Completed' : 'In Progress'}
//                         </p>
//                       </div>
//                     </div>
//                     {progress.score && (
//                       <span className="text-sm font-medium text-indigo-600">
//                         {Math.round(progress.score)}%
//                       </span>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-gray-500 text-center py-4">No recent progress</p>
//               )
//             ) : (
//               stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
//                 stats.recentEnrollments.slice(0, 5).map((enrollment: any, index: number) => (
//                   <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                     <div>
//                       <p className="font-medium text-gray-900">{enrollment.user.firstName} {enrollment.user.lastName}</p>
//                       <p className="text-sm text-gray-500">{enrollment.course.title}</p>
//                     </div>
//                     <span className="text-xs text-gray-400">
//                       {new Date(enrollment.enrolledAt).toLocaleDateString()}
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-gray-500 text-center py-4">No recent enrollments</p>
//               )
//             )}
//           </div>
//         </div>

//         {/* Achievements / Course Stats */}
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             {isStudent ? 'Recent Achievements' : 'Course Statistics'}
//           </h2>
//           <div className="space-y-3">
//             {isStudent ? (
//               stats?.achievements && stats.achievements.length > 0 ? (
//                 stats.achievements.map((achievement: any, index: number) => (
//                   <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
//                     <div className="text-2xl">{achievement.icon}</div>
//                     <div className="flex-1">
//                       <p className="font-medium text-gray-900">{achievement.title}</p>
//                       <p className="text-sm text-gray-600">{achievement.description}</p>
//                     </div>
//                     <Award className="w-5 h-5 text-yellow-600" />
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-gray-500 text-center py-4">No achievements yet</p>
//               )
//             ) : (
//               stats?.courseStats && stats.courseStats.length > 0 ? (
//                 stats.courseStats.map((course: any, index: number) => (
//                   <div key={index} className="p-3 bg-gray-50 rounded-lg">
//                     <p className="font-medium text-gray-900">{course.title}</p>
//                     <div className="flex gap-4 mt-2 text-sm text-gray-600">
//                       <span>{course._count.enrollments} students</span>
//                       <span>{course._count.lessons} lessons</span>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-gray-500 text-center py-4">No courses yet</p>
//               )
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       {isStudent && (
//         <div className="bg-white rounded-xl shadow-sm p-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Link
//               to="/courses"
//               className="p-4 border-2 border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-center"
//             >
//               <BookOpen className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
//               <p className="font-medium text-gray-900">Browse Courses</p>
//             </Link>
//             <Link
//               to="/ai-tutor"
//               className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-center"
//             >
//               <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
//               <p className="font-medium text-gray-900">Ask AI Tutor</p>
//             </Link>
//             <Link
//               to="/my-courses"
//               className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-center"
//             >
//               <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
//               <p className="font-medium text-gray-900">My Courses</p>
//             </Link>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function StatCard({ icon, label, value, color }: any) {
//   return (
//     <div className="bg-white rounded-xl shadow-sm p-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm text-gray-600 mb-1">{label}</p>
//           <p className="text-2xl font-bold text-gray-900">{value}</p>
//         </div>
//         <div className={`${color} p-3 rounded-lg text-white`}>
//           {icon}
//         </div>
//       </div>
//     </div>
//   );
// }



// ------------------------------------


// client/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { BookOpen, Trophy, Clock, TrendingUp, Play, Award } from 'lucide-react';

interface DashboardStats {
  overview: {
    enrolledCourses?: number;
    completedCourses?: number;
    averageScore?: number;
    totalTimeSpent?: number;
    totalStudents?: number;
    totalCourses?: number;
    totalEnrollments?: number;
  };
  recentProgress?: any[];
  achievements?: any[];
  recentEnrollments?: any[];
  courseStats?: any[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  const isStudent = user?.role === 'STUDENT';

  return (

    <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] p-5 sm:p-6 lg:p-8 pb-20 lg:pb-8">
      {/* Welcome Header */}
      <div className="bg-green-900/50 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 lg:p-10 text-green-50 border border-green-700/60 shadow-2xl mb-8 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
          Welcome back, {user?.firstName}! 
        </h1>
        <p className="text-green-300 text-base sm:text-lg lg:text-xl opacity-90">
          {isStudent
            ? "Ready to continue your learning journey?"
            : "Here's what's happening in your courses"}
        </p>
      </div>

      {/* Stats Grid - Responsive 2 → 4 columns */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {isStudent ? (
          <>
            <StatCard icon={<BookOpen className="w-10 h-10" />} label="Enrolled" value={stats?.overview.enrolledCourses || 0} color="bg-green-600" />
            <StatCard icon={<Trophy className="w-10 h-10" />} label="Completed" value={stats?.overview.completedCourses || 0} color="bg-emerald-600" />
            <StatCard icon={<TrendingUp className="w-10 h-10" />} label="Avg Score" value={`${Math.round(stats?.overview.averageScore || 0)}%`} color="bg-lime-600" />
            <StatCard icon={<Clock className="w-10 h-10" />} label="Time Spent" value={formatTime(stats?.overview.totalTimeSpent || 0)} color="bg-teal-600" />
          </>
        ) : (
          <>
            <StatCard icon={<BookOpen className="w-10 h-10" />} label="Total Courses" value={stats?.overview.totalCourses || 0} color="bg-green-600" />
            <StatCard icon={<TrendingUp className="w-10 h-10" />} label="Students" value={stats?.overview.totalStudents || 0} color="bg-emerald-600" />
            <StatCard icon={<Trophy className="w-10 h-10" />} label="Enrollments" value={stats?.overview.totalEnrollments || 0} color="bg-lime-600" />
            <div className="lg:hidden" /> {/* Keeps even spacing on mobile */}
          </>
        )}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mt-6">
        {/* Recent Progress / Enrollments */}
        <div className="bg-green-900/50 backdrop-blur-2xl rounded-2xl shadow-2xl p-5 sm:p-6 border border-green-700/60">
          <h2 className="text-lg sm:text-xl font-bold text-green-100 mb-4">
            {isStudent ? 'Recent Progress' : 'Recent Enrollments'}
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {isStudent ? (
              stats?.recentProgress?.length ? (
                stats.recentProgress.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-green-800/60 rounded-xl border border-green-600/50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Play className="w-6 h-6 text-green-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-green-100 text-sm sm:text-base truncate">{p.lesson.title}</p>
                        <p className="text-xs text-green-300">{p.completed ? 'Completed' : 'In Progress'}</p>
                      </div>
                    </div>
                    {p.score && <span className="text-lime-400 font-bold text-sm sm:text-base ml-2">{Math.round(p.score)}%</span>}
                  </div>
                ))
              ) : (
                <p className="text-center text-green-400 py-8 text-sm">No recent progress yet</p>
              )
            ) : (
              stats?.recentEnrollments?.length ? (
                stats.recentEnrollments.slice(0, 6).map((e: any, i: number) => (
                  <div key={i} className="p-4 bg-green-800/60 rounded-xl border border-green-600/50">
                    <p className="font-medium text-green-100 text-sm sm:text-base truncate">
                      {e.user.firstName} {e.user.lastName}
                    </p>
                    <p className="text-xs sm:text-sm text-green-300 truncate">{e.course.title}</p>
                    <p className="text-xs text-green-400 mt-1">
                      {new Date(e.enrolledAt).toLocaleDateString('en-PH')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-green-400 py-8 text-sm">No recent enrollments</p>
              )
            )}
          </div>
        </div>

        {/* Achievements / Course Stats */}
        <div className="bg-green-900/50 backdrop-blur-2xl rounded-2xl shadow-2xl p-5 sm:p-6 border border-green-700/60">
          <h2 className="text-lg sm:text-xl font-bold text-green-100 mb-4">
            {isStudent ? 'Recent Achievements' : 'Course Statistics'}
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {isStudent ? (
              stats?.achievements?.length ? (
                stats.achievements.map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gradient-to-r from-lime-900/60 to-emerald-900/60 rounded-xl border border-lime-600/50">
                    <div className="text-3xl">{a.icon}</div>
                    <div className="flex-1">
                      <p className="font-bold text-green-100 text-sm sm:text-base">{a.title}</p>
                      <p className="text-xs sm:text-sm text-green-300">{a.description}</p>
                    </div>
                    <Award className="w-7 h-7 text-lime-400" />
                  </div>
                ))
              ) : (
                <p className="text-center text-green-400 py-8 text-sm">No achievements yet</p>
              )
            ) : (
              stats?.courseStats?.length ? (
                stats.courseStats.map((c: any, i: number) => (
                  <div key={i} className="p-4 bg-green-800/60 rounded-xl border border-green-600/50">
                    <p className="font-bold text-green-100 text-sm sm:text-base">{c.title}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs sm:text-sm text-green-300">
                      <span>{c._count.enrollments} students</span>
                      <span>•</span>
                      <span>{c._count.lessons} lessons</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-green-400 py-8 text-sm">No courses yet</p>
              )
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - Only for Students */}
      {isStudent && (
        <div className="mt-6 bg-green-900/50 backdrop-blur-2xl rounded-2xl shadow-2xl p-5 sm:p-6 border border-green-700/60">
          <h2 className="text-lg sm:text-xl font-bold text-green-100 mb-5">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/courses"
              className="group p-6 bg-green-800/60 rounded-2xl border border-green-600/50 hover:border-green-500 hover:bg-green-700/70 transition-all text-center shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              <BookOpen className="w-12 h-12 sm:w-14 sm:h-14 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-green-100 text-sm sm:text-base">Browse Courses</p>
            </Link>
            <Link
              to="/ai-tutor"
              className="group p-6 bg-emerald-800/60 rounded-2xl border border-emerald-600/50 hover:border-emerald-500 hover:bg-emerald-700/70 transition-all text-center shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              <TrendingUp className="w-12 h-12 sm:w-14 sm:h-14 text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-emerald-100 text-sm sm:text-base">Ask AI Tutor</p>
            </Link>
            <Link
              to="/my-courses"
              className="group p-6 bg-lime-800/60 rounded-2xl border border-lime-600/50 hover:border-lime-500 hover:bg-lime-700/70 transition-all text-center shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              <Trophy className="w-12 h-12 sm:w-14 sm:h-14 text-lime-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-lime-100 text-sm sm:text-base">My Courses</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Ultra-Responsive StatCard
function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-green-900/50 backdrop-blur-2xl rounded-2xl shadow-2xl p-5 sm:p-6 border border-green-700/60 hover:border-green-600/70 transition-all">
      <div className="flex flex-col items-center text-center">
        <div className={`${color} p-4 rounded-2xl mb-3 shadow-lg`}>
          {icon}
        </div>
        <p className="text-xs sm:text-sm text-green-300 font-medium">{label}</p>
        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-50 mt-1">{value}</p>
      </div>
    </div>
  );
}