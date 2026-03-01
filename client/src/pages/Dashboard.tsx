// client/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTranslation } from '../lib/translations';
import api from '../lib/api';
import { BookOpen, Trophy, Clock, TrendingUp, Play, Award, Zap, Target, Brain, Crown, Star, ChevronRight } from 'lucide-react';

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

interface GamificationPreview {
  earned: any[];
  totalPoints: number;
  topLeaderboard: { name: string; value: number; rank: number } | null;
}

interface RankProgress {
  currentRank: {
    type: string;
    title: string;
    icon: string;
    color: string;
    description: string;
    earnedAt: string | null;
  };
  nextRank: {
    type: string;
    title: string;
    icon: string;
    color: string;
    description: string;
    requirementType: string;
    currentValue: number;
    targetValue: number;
    percentage: number;
  } | null;
  stats: {
    completedCourses: number;
    completedLessons: number;
    totalTimeSpentHours: number;
    coursesEnrolled: number;
  };
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  value: number;
  label: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { settings: accessibilitySettings } = useAccessibility();
  const t = useTranslation(accessibilitySettings.language);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [gamification, setGamification] = useState<GamificationPreview | null>(null);
  const [rankProgress, setRankProgress] = useState<RankProgress | null>(null);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [dashRes, achRes, lbRes, rankRes] = await Promise.allSettled([
        api.get('/dashboard/stats'),
        api.get('/gamification/achievements/me'),
        api.get('/gamification/leaderboards'),
        api.get('/gamification/rank/me'),
      ]);

      if (dashRes.status === 'fulfilled') setStats(dashRes.value.data);

      if (achRes.status === 'fulfilled') {
        const data = achRes.value.data;
        const leaderboards = lbRes.status === 'fulfilled' ? lbRes.value.data.leaderboards : [];
        let topLeaderboard = null;
        let topEntries: LeaderboardEntry[] = [];
        
        for (const lb of leaderboards) {
          const myEntry = lb.entries?.find((e: any) => e.userId === user?.id);
          if (myEntry) { topLeaderboard = { name: lb.config.name, value: myEntry.value, rank: myEntry.rank }; }
          // Get top 5 entries from first leaderboard with entries
          if (lb.entries?.length > 0 && topEntries.length === 0) {
            topEntries = lb.entries.slice(0, 5).map((e: any) => ({
              rank: e.rank,
              userId: e.userId,
              name: e.name,
              avatar: e.avatar,
              value: e.value,
              label: lb.config.name
            }));
          }
        }
        setGamification({ earned: data.earned ?? [], totalPoints: data.totalPoints ?? 0, topLeaderboard });
        setLeaderboardEntries(topEntries);
      }

      if (rankRes.status === 'fulfilled') {
        setRankProgress(rankRes.value.data);
      }
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
      <div className="backdrop-blur-2xl bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 lg:p-12 mb-12 shadow-2xl">
        <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent pb-3">
          {t.dashboard.welcome}, {user?.firstName}!
        </h1>
        <p className="text-xl lg:text-2xl text-slate-800 dark:text-gray-300 mt-4 font-light tracking-wide">
          {isStudent
            ? accessibilitySettings.language === "fil"
              ? "Handa ka na bang mag-level up ng iyong kaalaman ngayon?"
              : "Ready to level up your knowledge today?"
            : accessibilitySettings.language === "fil"
              ? "Pagsubaybay sa kinabukasan ng pag-aaral — real time."
              : "Monitoring the future of learning — in real time."}
        </p>
      </div>

      {/* Student Rank Card */}
      {isStudent && rankProgress && (
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="backdrop-blur-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Current Rank */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className={`w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br ${rankProgress.currentRank.color} flex items-center justify-center shadow-lg`}>
                  <span className="text-4xl lg:text-5xl">{rankProgress.currentRank.icon}</span>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                    {accessibilitySettings.language === 'fil' ? 'Kasalukuyang Ranggo' : 'Current Rank'}
                  </p>
                  <h3 className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                    {rankProgress.currentRank.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">{rankProgress.currentRank.description}</p>
                </div>
              </div>

              {/* Progress to Next Rank */}
              {rankProgress.nextRank && (
                <div className="flex-1 w-full lg:w-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-gray-400">
                      {accessibilitySettings.language === 'fil' ? 'Susunod na Ranggo' : 'Next Rank'}:
                      <span className="ml-2 font-semibold text-slate-900 dark:text-white">{rankProgress.nextRank.icon} {rankProgress.nextRank.title}</span>
                    </span>
                    <span className="text-sm font-bold text-purple-400">{rankProgress.nextRank.percentage}%</span>
                  </div>
                  <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${rankProgress.nextRank.color} rounded-full transition-all duration-500`}
                      style={{ width: `${rankProgress.nextRank.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-500 mt-2" title={rankProgress.nextRank.description}>
                    {rankProgress.nextRank.requirementType === 'TIME_SPENT' && (
                      <>{rankProgress.nextRank.currentValue}h / {rankProgress.nextRank.targetValue}h {accessibilitySettings.language === 'fil' ? 'oras ng pag-aaral' : 'learning time'}</>
                    )}
                    {rankProgress.nextRank.requirementType === 'COURSE_COMPLETION' && (
                      <>{rankProgress.nextRank.currentValue} / {rankProgress.nextRank.targetValue} {accessibilitySettings.language === 'fil' ? 'kurso natapos' : 'courses completed'}</>
                    )}
                    {rankProgress.nextRank.requirementType === 'LESSON_COMPLETION' && (
                      <>{rankProgress.nextRank.currentValue} / {rankProgress.nextRank.targetValue} {accessibilitySettings.language === 'fil' ? 'aralin natapos' : 'lessons completed'}</>
                    )}
                    {rankProgress.nextRank.requirementType === 'COMPOSITE' && (
                      <>{accessibilitySettings.language === 'fil' ? 'Kumpletong kurso at oras ng pag-aaral' : 'Complete courses and learning time'}</>
                    )}
                    {rankProgress.nextRank.requirementType === 'ALL_COURSES' && (
                      <>{rankProgress.nextRank.currentValue} / {rankProgress.nextRank.targetValue} {accessibilitySettings.language === 'fil' ? 'lahat ng kurso' : 'all courses'}</>
                    )}
                  </p>
                </div>
              )}

              {/* Max Rank Achieved */}
              {!rankProgress.nextRank && (
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">
                      {accessibilitySettings.language === 'fil' ? 'Pinakamataas na Ranggo!' : 'Maximum Rank Achieved!'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Course Completion Progress - Students Only */}
      {isStudent && stats?.overview && (stats.overview.enrolledCourses || 0) > 0 && (
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              {accessibilitySettings.language === 'fil' ? 'Progreso ng Kurso' : 'Course Progress'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Enrolled vs Completed */}
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">{accessibilitySettings.language === 'fil' ? 'Natapos' : 'Completed'}</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {stats.overview.completedCourses || 0}/{stats.overview.enrolledCourses || 0}
                  </span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.overview.enrolledCourses ? Math.round(((stats.overview.completedCourses || 0) / stats.overview.enrolledCourses) * 100) : 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.overview.enrolledCourses ? Math.round(((stats.overview.completedCourses || 0) / stats.overview.enrolledCourses) * 100) : 0}% {accessibilitySettings.language === 'fil' ? 'kumpleto' : 'complete'}
                </p>
              </div>

              {/* Average Score */}
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">{accessibilitySettings.language === 'fil' ? 'Avg na Marka' : 'Avg Score'}</span>
                  <span className="text-sm font-bold text-purple-400">{Math.round(stats.overview.averageScore || 0)}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      (stats.overview.averageScore || 0) >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      (stats.overview.averageScore || 0) >= 60 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                      'bg-gradient-to-r from-red-500 to-orange-500'
                    }`}
                    style={{ width: `${stats.overview.averageScore || 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {(stats.overview.averageScore || 0) >= 80 ? (accessibilitySettings.language === 'fil' ? 'Mahusay!' : 'Excellent!') :
                   (stats.overview.averageScore || 0) >= 60 ? (accessibilitySettings.language === 'fil' ? 'Magaling' : 'Good') :
                   (accessibilitySettings.language === 'fil' ? 'Kailangan ng pagpapabuti' : 'Needs improvement')}
                </p>
              </div>

              {/* Time Spent */}
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">{accessibilitySettings.language === 'fil' ? 'Oras ng Pag-aaral' : 'Learning Time'}</span>
                  <span className="text-sm font-bold text-green-400">{formatTime(stats.overview.totalTimeSpent || 0)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-slate-400">
                    {rankProgress?.stats?.totalTimeSpentHours 
                      ? `${Math.round(rankProgress.stats.totalTimeSpentHours * 10) / 10}h ${accessibilitySettings.language === 'fil' ? 'kabuuan' : 'total'}`
                      : accessibilitySettings.language === 'fil' ? 'Patuloy na pag-aaral!' : 'Keep learning!'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-7xl mx-auto px-6">
        {isStudent ? (
          <>
            <StatCard
              icon={<BookOpen className="w-10 h-10" />}
              label={t.dashboard.stats.enrolled}
              value={stats?.overview.enrolledCourses || 0}
              gradient="from-cyan-500 to-blue-600"
            />
            <StatCard
              icon={<Trophy className="w-10 h-10" />}
              label={t.dashboard.stats.completed}
              value={stats?.overview.completedCourses || 0}
              gradient="from-purple-500 to-pink-600"
            />
            <StatCard
              icon={<Target className="w-10 h-10" />}
              label={
                accessibilitySettings.language === "fil"
                  ? "Avg na Marka"
                  : "Avg Score"
              }
              value={`${Math.round(stats?.overview.averageScore || 0)}%`}
              gradient="from-indigo-500 to-purple-600"
            />
            <StatCard
              icon={<Clock className="w-10 h-10" />}
              label={t.progress.timeSpent}
              value={formatTime(stats?.overview.totalTimeSpent || 0)}
              gradient="from-teal-500 to-cyan-600"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={<Brain className="w-10 h-10" />}
              label={
                accessibilitySettings.language === "fil"
                  ? "Kabuuang Kurso"
                  : "Total Courses"
              }
              value={stats?.overview.totalCourses || 0}
              gradient="from-cyan-500 to-blue-600"
            />
            <StatCard
              icon={<Zap className="w-10 h-10" />}
              label={
                accessibilitySettings.language === "fil"
                  ? "Aktibong Estudyante"
                  : "Active Students"
              }
              value={stats?.overview.totalStudents || 0}
              gradient="from-purple-500 to-pink-600"
            />
            <StatCard
              icon={<TrendingUp className="w-10 h-10" />}
              label={
                accessibilitySettings.language === "fil"
                  ? "Mga Enrollment"
                  : "Enrollments"
              }
              value={stats?.overview.totalEnrollments || 0}
              gradient="from-indigo-500 to-purple-600"
            />
            <StatCard
              icon={<Award className="w-10 h-10" />}
              label={t.dashboard.stats.achievements}
              value={stats?.achievements?.length || 0}
              gradient="from-pink-500 to-rose-600"
            />
          </>
        )}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto px-6">
        {/* Recent Activity */}
        <div className="backdrop-blur-2xl bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
            {isStudent
              ? accessibilitySettings.language === "fil"
                ? "Kamakailang Progreso"
                : "Recent Progress"
              : accessibilitySettings.language === "fil"
                ? "Kamakailang Enrollment"
                : "Recent Enrollments"}
          </h2>

          <div className="space-y-4 max-h-96 overflow-y-auto content-scrollbar">
            {isStudent ? (
              stats?.recentProgress?.length ? (
                stats.recentProgress
                  .filter((p: any) => p?.Lesson)
                  .map((p: any, i: number) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-5 bg-white/60 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-cyan-500/50 transition-all group"
                      >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="p-3 bg-cyan-500/20 rounded-xl group-hover:bg-cyan-500/40 transition">
                          <Play className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium text-slate-900 dark:text-white truncate">
                              {p.Lesson?.title || "Untitled Lesson"}
                            </p>
                            {p.score && (
                              <span className="text-cyan-400 font-bold text-lg ml-2 flex-shrink-0">
                                {Math.round(p.score)}%
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-gray-400">
                            {p.completed
                              ? accessibilitySettings.language === "fil"
                                ? "Natapos"
                                : "Completed"
                              : accessibilitySettings.language === "fil"
                                ? "Ginagawa"
                                : "In Progress"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-center text-slate-600 dark:text-gray-500 py-12">
                  {accessibilitySettings.language === "fil"
                    ? "Wala pang kamakailang aktibidad"
                    : "No recent activity yet"}
                </p>
              )
            ) : stats?.recentEnrollments?.length ? (
              stats.recentEnrollments
                ?.filter((e) => e?.Course && e?.User)
                .map((e: any, i: number) => (
                  <div
                    key={i}
                    className="p-5 bg-white/5 rounded-2xl border border-white/10"
                  >
                    <p className="font-medium text-slate-900 dark:text-white">
                      {e.User.firstName} {e.User.lastName}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-gray-400 truncate">
                      {e.Course?.title || "Unknown Course"}
                    </p>
                    <p className="text-xs text-cyan-400 mt-1">
                      {new Date(e.enrolledAt).toLocaleDateString("en-PH")}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-center text-slate-600 dark:text-gray-500 py-12">
                {accessibilitySettings.language === "fil"
                  ? "Wala pang kamakailang enrollment"
                  : "No recent enrollments"}
              </p>
            )}
          </div>
        </div>

        {/* Achievements / Stats */}
        <div className="backdrop-blur-2xl bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            {isStudent
              ? accessibilitySettings.language === "fil"
                ? "Kamakailang Tagumpay"
                : "Recent Achievements"
              : accessibilitySettings.language === "fil"
                ? "Pinakamahusay na Kurso"
                : "Top Performing Courses"}
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto content-scrollbar">
            {isStudent ? (
              stats?.achievements?.length ? (
                stats.achievements.map((a: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-5 p-5 bg-gradient-to-r from-purple-900/30 to-pink-900/20 rounded-2xl border border-purple-500/30"
                  >
                    <div className="text-4xl">{a.icon}</div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {a.title}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-gray-400">
                        {a.description}
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-purple-400" />
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-600 dark:text-gray-500 py-12">
                  {accessibilitySettings.language === "fil"
                    ? "Magpatuloy sa pag-aaral upang makakuha ng mga tagumpay!"
                    : "Keep learning to unlock achievements!"}
                </p>
              )
            ) : stats?.courseStats?.length ? (
              stats.courseStats?.filter(Boolean).map((c: any, i: number) => (
                <div
                  key={i}
                  className="p-5 bg-white/5 rounded-2xl border border-white/10"
                >
                  <p className="font-bold text-slate-900 dark:text-white">
                    {c?.title || "Untitled Course"}
                  </p>
                  <div className="flex gap-4 mt-3 text-sm text-slate-600 dark:text-gray-400">
                    <span>
                      {c?._count?.enrollments || 0}{" "}
                      {accessibilitySettings.language === "fil"
                        ? "estudyante"
                        : "students"}
                    </span>
                    <span>•</span>
                    <span>
                      {c?._count?.Lesson || 0}{" "}
                      {accessibilitySettings.language === "fil"
                        ? "aralin"
                        : "lessons"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-600 dark:text-gray-500 py-12">
                {accessibilitySettings.language === "fil"
                  ? "Wala pang data ng kurso"
                  : "No course data yet"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Gamification Preview - Students Only */}
      {isStudent && gamification && (
        <div className="mt-8 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Badges Preview */}
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  {accessibilitySettings.language === "fil"
                    ? "Aking mga Badge"
                    : "My Badges"}
                </h2>
                <Link
                  to="/achievements"
                  className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {accessibilitySettings.language === "fil"
                    ? "Tingnan lahat"
                    : "View all"}{" "}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Points Banner */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/10 border border-yellow-500/30 rounded-2xl mb-4">
                <Star className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-black text-2xl">
                    {gamification.totalPoints}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-500">
                    {accessibilitySettings.language === "fil"
                      ? "Kabuuang Puntos"
                      : "Total Points"}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-slate-900 dark:text-white font-bold text-lg">
                    {gamification.earned.length}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-gray-500">
                    {accessibilitySettings.language === "fil"
                      ? "Badge"
                      : "Badges"}
                  </p>
                </div>
              </div>

              {gamification.earned.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {gamification.earned.slice(0, 6).map((a: any, i: number) => (
                    <div
                          key={i}
                          title={a.title}
                          className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-yellow-900/20 to-orange-900/10 border border-yellow-500/20 rounded-2xl hover:border-yellow-400/40 transition-all cursor-default"
                        >
                      <span className="text-3xl">{a.icon}</span>
                      <span className="text-xs text-slate-600 dark:text-gray-400 max-w-[60px] text-center truncate">
                        {a.title}
                      </span>
                    </div>
                  ))}
                  {gamification.earned.length > 6 && (
                    <Link
                      to="/achievements"
                      className="flex flex-col items-center justify-center gap-1 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all w-[76px]"
                    >
                      <span className="text-slate-400 font-bold">
                        +{gamification.earned.length - 6}
                      </span>
                      <span className="text-xs text-slate-500">more</span>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Trophy className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                  <p className="text-slate-500 dark:text-gray-500 text-sm">
                    {accessibilitySettings.language === "fil"
                      ? "Kumpletuhin ang mga kurso para makakuha ng badge!"
                      : "Complete courses to earn badges!"}
                  </p>
                </div>
              )}
            </div>

            {/* Leaderboard Preview */}
            <div className="backdrop-blur-2xl bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent flex items-center gap-2">
                  <Crown className="w-6 h-6 text-cyan-400" />
                  {accessibilitySettings.language === "fil"
                    ? "Leaderboard"
                    : "Leaderboard"}
                </h2>
                <Link
                  to="/leaderboard"
                  className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {accessibilitySettings.language === "fil"
                    ? "Tingnan lahat"
                    : "View all"}{" "}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Your Rank Banner */}
              {gamification.topLeaderboard && (
                <div className="p-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/10 border border-cyan-500/30 rounded-2xl mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-black text-cyan-400">
                      #{gamification.topLeaderboard.rank}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 dark:text-white font-bold text-sm">
                        {accessibilitySettings.language === "fil" ? "Iyong Ranggo" : "Your Rank"}
                      </p>
                      <p className="text-xs text-slate-500">{gamification.topLeaderboard.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">{gamification.topLeaderboard.value}</p>
                      <p className="text-xs text-slate-500">{accessibilitySettings.language === "fil" ? "puntos" : "points"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Users List */}
              {leaderboardEntries.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-medium mb-3">
                    {accessibilitySettings.language === "fil" ? "Nangungunang Mag-aaral" : "Top Students"}
                  </p>
                  {leaderboardEntries.map((entry, idx) => (
                    <div key={entry.userId} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      entry.userId === user?.id 
                        ? 'bg-cyan-500/20 border border-cyan-500/30' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx === 0 ? 'bg-yellow-500 text-black' :
                        idx === 1 ? 'bg-slate-400 text-black' :
                        idx === 2 ? 'bg-amber-600 text-white' :
                        'bg-white/10 text-slate-400'
                      }`}>
                        {entry.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${entry.userId === user?.id ? 'text-cyan-400' : 'text-slate-900 dark:text-white'}`}>
                          {entry.name} {entry.userId === user?.id && '(You)'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900 dark:text-white">{entry.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Crown className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                  <p className="text-slate-500 dark:text-gray-500 text-sm">
                    {accessibilitySettings.language === "fil"
                      ? "Kumpletuhin ang mga gawain para lumabas sa leaderboard!"
                      : "Complete activities to appear on the leaderboard!"}
                  </p>
                </div>
              )}

              <Link
                to="/leaderboard"
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 font-semibold hover:from-cyan-500/30 hover:to-purple-500/20 transition-all"
              >
                <Crown className="w-5 h-5" />
                {accessibilitySettings.language === "fil"
                  ? "Tingnan ang Buong Leaderboard"
                  : "View Full Leaderboard"}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Students Only */}
      {isStudent && (
        <div className="mt-8 max-w-7xl mx-auto px-6">
          <div className="backdrop-blur-2xl bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Link
                to="/courses"
                className="group p-8 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-3xl border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 transition-all text-center shadow-xl hover:shadow-cyan-500/30 transform hover:scale-105"
              >
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-cyan-400 group-hover:scale-110 transition" />
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  Browse Courses
                </p>
              </Link>
              <Link
                to="/ai-tutor"
                className="group p-8 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-3xl border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/20 transition-all text-center shadow-xl hover:shadow-purple-500/30 transform hover:scale-105"
              >
                <Brain className="w-16 h-16 mx-auto mb-4 text-purple-400 group-hover:scale-110 transition" />
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  AI Tutor
                </p>
              </Link>
              <Link
                to="/my-courses"
                className="group p-8 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-3xl border border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-500/20 transition-all text-center shadow-xl hover:shadow-indigo-500/30 transform hover:scale-105"
              >
                <Trophy className="w-16 h-16 mx-auto mb-4 text-indigo-400 group-hover:scale-110 transition" />
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  My Courses
                </p>
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
    <div className={`backdrop-blur-2xl bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl hover:border-cyan-500/50 transition-all group`}>
      <div className="flex flex-col items-center text-center">
        <div className={`p-5 rounded-2xl mb-4 bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <p className="text-sm text-slate-700 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mt-2">{value}</p>
      </div>
    </div>
  );
}