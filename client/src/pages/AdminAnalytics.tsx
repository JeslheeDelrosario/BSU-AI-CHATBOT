import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, Users, BookOpen, GraduationCap, MessageSquare, 
  TrendingUp, Loader2, Calendar
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import api from '../lib/api';

interface SystemAnalytics {
  overview: {
    totalUsers: number;
    totalStudents: number;
    totalCourses: number;
    totalEnrollments: number;
    totalLessons: number;
    completedLessons: number;
    totalAIInteractions: number;
  };
  recentEnrollments: Array<{
    studentName: string;
    courseName: string;
    enrolledAt: string;
  }>;
  popularCourses: Array<{
    courseId: string;
    title: string;
    enrollments: number;
  }>;
  aiUsageByDay: Array<{
    date: string;
    day: string;
    interactions: number;
  }>;
}

const COLORS = ['#00D9FF', '#A855F7', '#EC4899', '#10B981', '#F59E0B'];

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/progress/system');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-6">
            Restricted Access
          </h1>
          <p className="text-xl sm:text-2xl text-foreground font-bold">Admin Access Required</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-12">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-cyan-500/20 rounded-2xl">
              <BarChart3 className="w-16 h-16 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            System Analytics
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Platform-wide statistics and insights
          </p>
        </div>

        {analytics && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4">
                <Users className="w-6 h-6 text-cyan-400 mb-2" />
                <div className="text-2xl font-black text-foreground">{analytics.overview.totalUsers}</div>
                <div className="text-xs text-gray-400">Total Users</div>
              </div>
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4">
                <GraduationCap className="w-6 h-6 text-green-400 mb-2" />
                <div className="text-2xl font-black text-foreground">{analytics.overview.totalStudents}</div>
                <div className="text-xs text-gray-400">Students</div>
              </div>
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4">
                <BookOpen className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-2xl font-black text-foreground">{analytics.overview.totalCourses}</div>
                <div className="text-xs text-gray-400">Courses</div>
              </div>
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4">
                <TrendingUp className="w-6 h-6 text-pink-400 mb-2" />
                <div className="text-2xl font-black text-foreground">{analytics.overview.totalEnrollments}</div>
                <div className="text-xs text-gray-400">Enrollments</div>
              </div>
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4">
                <Calendar className="w-6 h-6 text-orange-400 mb-2" />
                <div className="text-2xl font-black text-foreground">{analytics.overview.totalLessons}</div>
                <div className="text-xs text-gray-400">Lessons</div>
              </div>
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4">
                <GraduationCap className="w-6 h-6 text-yellow-400 mb-2" />
                <div className="text-2xl font-black text-foreground">{analytics.overview.completedLessons}</div>
                <div className="text-xs text-gray-400">Completed</div>
              </div>
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-4">
                <MessageSquare className="w-6 h-6 text-blue-400 mb-2" />
                <div className="text-2xl font-black text-foreground">{analytics.overview.totalAIInteractions}</div>
                <div className="text-xs text-gray-400">AI Chats</div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* AI Usage Chart */}
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">AI Tutor Usage (Last 7 Days)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.aiUsageByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="day" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="interactions" fill="#00D9FF" name="Interactions" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Popular Courses */}
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">Popular Courses</h3>
                {analytics.popularCourses.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.popularCourses}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="enrollments"
                          nameKey="title"
                        >
                          {analytics.popularCourses.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    No course data available
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  {analytics.popularCourses.map((course, idx) => (
                    <div key={course.courseId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-foreground truncate max-w-[200px]">{course.title}</span>
                      </div>
                      <span className="text-cyan-400 font-bold">{course.enrollments}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Enrollments */}
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-6">Recent Enrollments</h3>
              {analytics.recentEnrollments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-400">Student</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-400">Course</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-400">Enrolled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentEnrollments.map((enrollment, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 text-foreground">{enrollment.studentName}</td>
                          <td className="px-4 py-3 text-gray-300">{enrollment.courseName}</td>
                          <td className="px-4 py-3 text-gray-400">
                            {new Date(enrollment.enrolledAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No recent enrollments
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <a href="/AdminStudents" className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                <Users className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-foreground">Manage Students</h4>
                <p className="text-sm text-gray-400">View and manage student accounts</p>
              </a>
              <a href="/AdminFAQs" className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                <MessageSquare className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-foreground">Manage FAQs</h4>
                <p className="text-sm text-gray-400">Create and edit FAQs</p>
              </a>
              <a href="/AdminCurriculum" className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                <BookOpen className="w-8 h-8 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-foreground">Curriculum</h4>
                <p className="text-sm text-gray-400">Manage course curriculum</p>
              </a>
              <a href="/AdminFaculty" className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                <GraduationCap className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-foreground">Faculty</h4>
                <p className="text-sm text-gray-400">Manage faculty members</p>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
