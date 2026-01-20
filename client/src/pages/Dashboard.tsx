// client/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTranslation } from '../lib/translations';
import api from '../lib/api';
import { BookOpen, Trophy, Clock, TrendingUp, Play, Award, Zap, Target, Brain } from 'lucide-react';

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
  const { settings: accessibilitySettings } = useAccessibility();
  const t = useTranslation(accessibilitySettings.language);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isStudent = user?.role === 'STUDENT';

  return (
    <div className="py-10 lg:py-16">

      {/* Welcome Header */}
      <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 mb-12 shadow-2xl">
        <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          {t.dashboard.welcome}, {user?.firstName}!
        </h1>
        <p className="text-xl lg:text-2xl text-slate-700 dark:text-gray-300 mt-4 font-light tracking-wide">
          {isStudent
            ? (accessibilitySettings.language === 'fil' ? 'Handa ka na bang mag-level up ng iyong kaalaman ngayon?' : 'Ready to level up your knowledge today?')
            : (accessibilitySettings.language === 'fil' ? 'Pagsubaybay sa kinabukasan ng pag-aaral — real time.' : 'Monitoring the future of learning — in real time.')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-7xl mx-auto px-6">
        {isStudent ? (
          <>
            <StatCard icon={<BookOpen className="w-10 h-10" />} label={t.dashboard.stats.enrolled} value={stats?.overview.enrolledCourses || 0} gradient="from-cyan-500 to-blue-600" />
            <StatCard icon={<Trophy className="w-10 h-10" />} label={t.dashboard.stats.completed} value={stats?.overview.completedCourses || 0} gradient="from-purple-500 to-pink-600" />
            <StatCard icon={<Target className="w-10 h-10" />} label={accessibilitySettings.language === 'fil' ? 'Avg na Marka' : 'Avg Score'} value={`${Math.round(stats?.overview.averageScore || 0)}%`} gradient="from-indigo-500 to-purple-600" />
            <StatCard icon={<Clock className="w-10 h-10" />} label={t.progress.timeSpent} value={formatTime(stats?.overview.totalTimeSpent || 0)} gradient="from-teal-500 to-cyan-600" />
          </>
        ) : (
          <>
            <StatCard icon={<Brain className="w-10 h-10" />} label={accessibilitySettings.language === 'fil' ? 'Kabuuang Kurso' : 'Total Courses'} value={stats?.overview.totalCourses || 0} gradient="from-cyan-500 to-blue-600" />
            <StatCard icon={<Zap className="w-10 h-10" />} label={accessibilitySettings.language === 'fil' ? 'Aktibong Estudyante' : 'Active Students'} value={stats?.overview.totalStudents || 0} gradient="from-purple-500 to-pink-600" />
            <StatCard icon={<TrendingUp className="w-10 h-10" />} label={accessibilitySettings.language === 'fil' ? 'Mga Enrollment' : 'Enrollments'} value={stats?.overview.totalEnrollments || 0} gradient="from-indigo-500 to-purple-600" />
            <StatCard icon={<Award className="w-10 h-10" />} label={t.dashboard.stats.achievements} value={stats?.achievements?.length || 0} gradient="from-pink-500 to-rose-600" />
          </>
        )}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-6">

        {/* Recent Activity */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
            {isStudent ? (accessibilitySettings.language === 'fil' ? 'Kamakailang Progreso' : 'Recent Progress') : (accessibilitySettings.language === 'fil' ? 'Kamakailang Enrollment' : 'Recent Enrollments')}
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {isStudent ? (
              stats?.recentProgress?.length ? (
                stats.recentProgress.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all group">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-3 bg-cyan-500/20 rounded-xl group-hover:bg-cyan-500/40 transition">
                        <Play className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate">{p.lesson.title}</p>
                        <p className="text-sm text-slate-600 dark:text-gray-400">{p.completed ? (accessibilitySettings.language === 'fil' ? 'Natapos' : 'Completed') : (accessibilitySettings.language === 'fil' ? 'Ginagawa' : 'In Progress')}</p>
                      </div>
                    </div>
                    {p.score && <span className="text-cyan-400 font-bold text-lg ml-4">{Math.round(p.score)}%</span>}
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-600 dark:text-gray-500 py-12">{accessibilitySettings.language === 'fil' ? 'Wala pang kamakailang aktibidad' : 'No recent activity yet'}</p>
              )
            ) : (
              stats?.recentEnrollments?.length ? (
                stats.recentEnrollments.slice(0, 6).map((e: any, i: number) => (
                  <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/10">
                    <p className="font-medium text-slate-900 dark:text-white">{e.User.firstName} {e.User.lastName}</p>
                    <p className="text-sm text-slate-600 dark:text-gray-400 truncate">{e.Course.title}</p>
                    <p className="text-xs text-cyan-400 mt-1">
                      {new Date(e.enrolledAt).toLocaleDateString('en-PH')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-600 dark:text-gray-500 py-12">{accessibilitySettings.language === 'fil' ? 'Wala pang kamakailang enrollment' : 'No recent enrollments'}</p>
              )
            )}
          </div>
        </div>

        {/* Achievements / Stats */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {isStudent ? (accessibilitySettings.language === 'fil' ? 'Kamakailang Tagumpay' : 'Recent Achievements') : (accessibilitySettings.language === 'fil' ? 'Pinakamahusay na Kurso' : 'Top Performing Courses')}
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {isStudent ? (
              stats?.achievements?.length ? (
                stats.achievements.map((a: any, i: number) => (
                  <div key={i} className="flex items-center gap-5 p-5 bg-gradient-to-r from-purple-900/30 to-pink-900/20 rounded-2xl border border-purple-500/30">
                    <div className="text-4xl">{a.icon}</div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white">{a.title}</p>
                      <p className="text-sm text-slate-600 dark:text-gray-400">{a.description}</p>
                    </div>
                    <Award className="w-8 h-8 text-purple-400" />
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-600 dark:text-gray-500 py-12">{accessibilitySettings.language === 'fil' ? 'Magpatuloy sa pag-aaral upang makakuha ng mga tagumpay!' : 'Keep learning to unlock achievements!'}</p>
              )
            ) : (
              stats?.courseStats?.length ? (
                stats.courseStats.map((c: any, i: number) => (
                  <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/10">
                    <p className="font-bold text-slate-900 dark:text-white">{c.title}</p>
                    <div className="flex gap-4 mt-3 text-sm text-slate-600 dark:text-gray-400">
                      <span>{c._count.enrollments} {accessibilitySettings.language === 'fil' ? 'estudyante' : 'students'}</span>
                      <span>•</span>
                      <span>{c._count.lessons} {accessibilitySettings.language === 'fil' ? 'aralin' : 'lessons'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-600 dark:text-gray-500 py-12">{accessibilitySettings.language === 'fil' ? 'Wala pang data ng kurso' : 'No course data yet'}</p>
              )
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - Students Only */}
      {isStudent && (
        <div className="mt-12 max-w-7xl mx-auto px-6">
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Link
                to="/courses"
                className="group p-8 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-3xl border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 transition-all text-center shadow-xl hover:shadow-cyan-500/30 transform hover:scale-105"
              >
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-cyan-400 group-hover:scale-110 transition" />
                <p className="text-xl font-bold text-slate-900 dark:text-white">Browse Courses</p>
              </Link>
              <Link
                to="/ai-tutor"
                className="group p-8 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-3xl border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/20 transition-all text-center shadow-xl hover:shadow-purple-500/30 transform hover:scale-105"
              >
                <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400 group-hover:scale-110 transition" />
                <p className="text-xl font-bold text-slate-900 dark:text-white">AI Tutor</p>
              </Link>
              <Link
                to="/my-courses"
                className="group p-8 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-3xl border border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-500/20 transition-all text-center shadow-xl hover:shadow-indigo-500/30 transform hover:scale-105"
              >
                <Trophy className="w-16 h-16 mx-auto mb-4 text-indigo-400 group-hover:scale-110 transition" />
                <p className="text-xl font-bold text-slate-900 dark:text-white">My Courses</p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Futuristic StatCard
function StatCard({ icon, label, value, gradient }: { icon: React.ReactNode; label: string; value: any; gradient: string }) {
  return (
    <div className={`backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl hover:border-cyan-500/50 transition-all group`}>
      <div className="flex flex-col items-center text-center">
        <div className={`p-5 rounded-2xl mb-4 bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mt-2">{value}</p>
      </div>
    </div>
  );
}