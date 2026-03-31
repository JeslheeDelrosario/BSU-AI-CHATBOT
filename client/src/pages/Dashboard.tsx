// client/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTranslation } from '../lib/translations';
import api from '../lib/api';
import { 
  BookOpen, Trophy, Clock, TrendingUp, Play, Award, Zap, Target, 
  Brain, Crown, Star, ChevronRight, LayoutGrid, Activity, Medal, 
  BarChart3, Users, GraduationCap, Sparkles 
} from 'lucide-react';

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

type DashboardTab = 'progress' | 'achievements' | 'badges' | 'leaderboard';

// StatCard component - Larger
function StatCard({ icon, label, value, gradient }: { icon: React.ReactNode; label: string; value: any; gradient: string }) {
  return (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-cyan-500/50 transition-all group">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Tab Button Component - Larger
function TabButton({ tab, currentTab, icon, label, onClick }: { 
  tab: DashboardTab; 
  currentTab: DashboardTab; 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-2.5 rounded-xl font-semibold text-base transition-all ${
        currentTab === tab
          ? 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-2 border-cyan-500 text-cyan-600 dark:text-cyan-400 shadow-sm'
          : 'bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:border-cyan-500/30'
      }`}
    >
      {icon}
      {label}
    </button>
  );
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
  const [activeTab, setActiveTab] = useState<DashboardTab>('progress');

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
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isStudent = user?.role === 'STUDENT';

  return (
    <div className="min-h-screen">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          
          {/* Combined Welcome Header + Rank + Quick Actions Nav Bar */}
          <div className="space-y-4">
            {/* Welcome + Rank Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Welcome Section */}
              {/* Welcome Section */}
              <div className="flex-1">
                <h1 className="text-5xl lg:text-6xl xl:text-6xl font-black bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {t.dashboard.welcome}, {user?.firstName}!
                </h1>
                <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mt-2">
                  {isStudent
                    ? "Ready to level up your knowledge today?"
                    : "Monitoring the future of learning — in real time."}
                </p>
              </div>

              {/* Rank Badge - Larger */}
              {isStudent && rankProgress && (
                <div className="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${rankProgress.currentRank.color} flex items-center justify-center shadow-md`}>
                    <span className="text-2xl">{rankProgress.currentRank.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current Rank</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{rankProgress.currentRank.title}</p>
                  </div>
                  {rankProgress.nextRank && (
                    <div className="hidden md:block pl-4 border-l border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Next: <span className="font-semibold">{rankProgress.nextRank.title}</span></p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${rankProgress.nextRank.color} rounded-full transition-all duration-500`}
                            style={{ width: `${rankProgress.nextRank.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{rankProgress.nextRank.percentage}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions Nav Bar - Larger */}
            {isStudent && (
              <div className="flex flex-wrap gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl">
                <Link
                  to="/courses"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/20 transition-all font-medium text-gray-700 dark:text-gray-300"
                >
                  <BookOpen className="w-5 h-5 text-cyan-500" />
                  Browse Courses
                </Link>
                <Link
                  to="/ai-tutor"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-600/10 border border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/20 transition-all font-medium text-gray-700 dark:text-gray-300"
                >
                  <Brain className="w-5 h-5 text-purple-500" />
                  AI Tutor
                </Link>
                <Link
                  to="/my-courses"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/20 transition-all font-medium text-gray-700 dark:text-gray-300"
                >
                  <GraduationCap className="w-5 h-5 text-indigo-500" />
                  My Courses
                </Link>
                <Link
                  to="/achievements"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-600/10 border border-yellow-500/30 hover:border-yellow-500 hover:bg-yellow-500/20 transition-all font-medium text-gray-700 dark:text-gray-300"
                >
                  <Medal className="w-5 h-5 text-yellow-600" />
                  Achievements
                </Link>
                <Link
                  to="/leaderboard"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-500/30 hover:border-green-500 hover:bg-green-500/20 transition-all font-medium text-gray-700 dark:text-gray-300"
                >
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Leaderboard
                </Link>
              </div>
            )}

            {/* Faculty Quick Actions - Larger */}
            {user?.role === 'TEACHER' && (
              <div className="flex flex-wrap gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl">
                <Link
                  to="/classrooms"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500 hover:bg-cyan-500/20 transition-all font-medium"
                >
                  <BookOpen className="w-5 h-5 text-cyan-500" />
                  Classrooms
                </Link>
                <Link
                  to="/consultations"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/20 transition-all font-medium"
                >
                  <Clock className="w-5 h-5 text-purple-500" />
                  Consultations
                </Link>
                <Link
                  to="/faculty-calendar"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-pink-500/10 border border-pink-500/30 hover:border-pink-500 hover:bg-pink-500/20 transition-all font-medium"
                >
                  <Target className="w-5 h-5 text-pink-500" />
                  Calendar
                </Link>
              </div>
            )}
          </div>

          {/* Stats Grid - Larger */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {isStudent ? (
              <>
                <StatCard
                  icon={<BookOpen className="w-6 h-6 text-white" />}
                  label={t.dashboard.stats.enrolled}
                  value={stats?.overview.enrolledCourses || 0}
                  gradient="from-cyan-500 to-blue-600"
                />
                <StatCard
                  icon={<Trophy className="w-6 h-6 text-white" />}
                  label={t.dashboard.stats.completed}
                  value={stats?.overview.completedCourses || 0}
                  gradient="from-purple-500 to-pink-600"
                />
                <StatCard
                  icon={<Target className="w-6 h-6 text-white" />}
                  label="Avg Score"
                  value={`${Math.round(stats?.overview.averageScore || 0)}%`}
                  gradient="from-indigo-500 to-purple-600"
                />
                <StatCard
                  icon={<Clock className="w-6 h-6 text-white" />}
                  label="Time Spent"
                  value={formatTime(stats?.overview.totalTimeSpent || 0)}
                  gradient="from-teal-500 to-cyan-600"
                />
              </>
            ) : (
              <>
                <StatCard
                  icon={<Brain className="w-6 h-6 text-white" />}
                  label="Total Courses"
                  value={stats?.overview.totalCourses || 0}
                  gradient="from-cyan-500 to-blue-600"
                />
                <StatCard
                  icon={<Users className="w-6 h-6 text-white" />}
                  label="Active Students"
                  value={stats?.overview.totalStudents || 0}
                  gradient="from-purple-500 to-pink-600"
                />
                <StatCard
                  icon={<TrendingUp className="w-6 h-6 text-white" />}
                  label="Enrollments"
                  value={stats?.overview.totalEnrollments || 0}
                  gradient="from-indigo-500 to-purple-600"
                />
                <StatCard
                  icon={<Award className="w-6 h-6 text-white" />}
                  label="Achievements"
                  value={stats?.achievements?.length || 0}
                  gradient="from-pink-500 to-rose-600"
                />
              </>
            )}
          </div>

          {/* Course Progress Bar - Only for Students */}
          {isStudent && stats?.overview && (stats.overview.enrolledCourses || 0) > 0 && (
            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Course Completion Progress</span>
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  {stats.overview.completedCourses || 0}/{stats.overview.enrolledCourses || 0} completed
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.overview.enrolledCourses ? Math.round(((stats.overview.completedCourses || 0) / stats.overview.enrolledCourses) * 100) : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Tabbed Section - Recent Progress, Achievements, Badges, Leaderboard */}
          <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
              <TabButton
                tab="progress"
                currentTab={activeTab}
                icon={<Activity className="w-5 h-5" />}
                label="Recent Progress"
                onClick={() => setActiveTab('progress')}
              />
              <TabButton
                tab="achievements"
                currentTab={activeTab}
                icon={<Medal className="w-5 h-5" />}
                label="Achievements"
                onClick={() => setActiveTab('achievements')}
              />
              <TabButton
                tab="badges"
                currentTab={activeTab}
                icon={<Sparkles className="w-5 h-5" />}
                label="My Badges"
                onClick={() => setActiveTab('badges')}
              />
              <TabButton
                tab="leaderboard"
                currentTab={activeTab}
                icon={<Crown className="w-5 h-5" />}
                label="Leaderboard"
                onClick={() => setActiveTab('leaderboard')}
              />
            </div>

            {/* Tab Content */}
            <div className="p-5 max-h-[500px] overflow-y-auto">
              {/* Recent Progress Tab */}
              {activeTab === 'progress' && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-500" />
                    {isStudent ? "Your Recent Activity" : "Recent Enrollments"}
                  </h3>
                  {isStudent ? (
                    stats?.recentProgress?.length ? (
                      stats.recentProgress
                        .filter((p: any) => p?.Lesson)
                        .slice(0, 8)
                        .map((p: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 transition-all group"
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="p-2 bg-cyan-500/10 rounded-xl group-hover:bg-cyan-500/20 transition">
                                <Play className="w-5 h-5 text-cyan-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">
                                  {p.Lesson?.title || "Untitled Lesson"}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {p.completed ? "Completed" : "In Progress"}
                                </p>
                              </div>
                              {p.score && (
                                <span className="text-cyan-600 dark:text-cyan-400 font-bold text-lg ml-2 flex-shrink-0">
                                  {Math.round(p.score)}%
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-12">
                        <Activity className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">No recent activity yet. Start learning!</p>
                      </div>
                    )
                  ) : (
                    stats?.recentEnrollments?.length ? (
                      stats.recentEnrollments
                        ?.filter((e) => e?.Course && e?.User)
                        .slice(0, 8)
                        .map((e: any, i: number) => (
                          <div
                            key={i}
                            className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700"
                          >
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {e.User.firstName} {e.User.lastName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                              {e.Course?.title || "Unknown Course"}
                            </p>
                            <p className="text-sm text-cyan-600 dark:text-cyan-400 mt-2">
                              {new Date(e.enrolledAt).toLocaleDateString("en-PH")}
                            </p>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">No recent enrollments yet</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <Medal className="w-5 h-5 text-purple-500" />
                    {isStudent ? "Your Achievements" : "Top Performing Courses"}
                  </h3>
                  {isStudent ? (
                    stats?.achievements?.length ? (
                      stats.achievements.slice(0, 8).map((a: any, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl border border-purple-500/20"
                        >
                          <div className="text-3xl">{a.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {a.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {a.description}
                            </p>
                          </div>
                          <Award className="w-6 h-6 text-purple-500 flex-shrink-0" />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Medal className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">Keep learning to unlock achievements!</p>
                      </div>
                    )
                  ) : (
                    stats?.courseStats?.length ? (
                      stats.courseStats?.filter(Boolean).slice(0, 8).map((c: any, i: number) => (
                        <div
                          key={i}
                          className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700"
                        >
                          <p className="font-bold text-gray-900 dark:text-white">
                            {c?.title || "Untitled Course"}
                          </p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>{c?._count?.enrollments || 0} students</span>
                            <span>•</span>
                            <span>{c?._count?.Lesson || 0} lessons</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">No course data yet</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Badges Tab */}
              {activeTab === 'badges' && isStudent && gamification && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/30">
                    <div className="flex items-center gap-4">
                      <Star className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="text-yellow-600 dark:text-yellow-400 font-black text-2xl">{gamification.totalPoints}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 dark:text-white font-bold text-xl">{gamification.earned.length}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</p>
                    </div>
                  </div>

                  {gamification.earned.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {gamification.earned.slice(0, 8).map((a: any, i: number) => (
                        <div
                          key={i}
                          title={a.title}
                          className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border border-yellow-500/20 rounded-xl hover:border-yellow-500/40 transition-all cursor-default"
                        >
                          <span className="text-3xl">{a.icon}</span>
                          <span className="text-sm text-gray-700 dark:text-gray-300 text-center truncate w-full font-medium">
                            {a.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">Complete courses to earn badges!</p>
                    </div>
                  )}
                  <Link
                    to="/achievements"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl text-yellow-600 dark:text-yellow-400 font-semibold hover:from-yellow-500/20 hover:to-orange-500/20 transition-all"
                  >
                    <Medal className="w-5 h-5" />
                    View All Achievements
                  </Link>
                </div>
              )}

              {/* Leaderboard Tab */}
              {activeTab === 'leaderboard' && isStudent && (
                <div className="space-y-4">
                  {gamification?.topLeaderboard && (
                    <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400">#{gamification.topLeaderboard.rank}</div>
                        <div className="flex-1">
                          <p className="text-gray-900 dark:text-white font-bold">Your Rank</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{gamification.topLeaderboard.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-cyan-600 dark:text-cyan-400 font-bold text-xl">{gamification.topLeaderboard.value}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">points</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {leaderboardEntries.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Top Students</p>
                      {leaderboardEntries.slice(0, 8).map((entry, idx) => (
                        <div key={entry.userId} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          entry.userId === user?.id 
                            ? 'bg-cyan-500/10 border-2 border-cyan-500' 
                            : 'bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            idx === 0 ? 'bg-yellow-500 text-white' :
                            idx === 1 ? 'bg-gray-400 text-white' :
                            idx === 2 ? 'bg-amber-600 text-white' :
                            'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {entry.rank}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${entry.userId === user?.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-900 dark:text-white'}`}>
                              {entry.name} {entry.userId === user?.id && '(You)'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">{entry.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Crown className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">Complete activities to appear on the leaderboard!</p>
                    </div>
                  )}
                  <Link
                    to="/leaderboard"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl text-cyan-600 dark:text-cyan-400 font-semibold hover:from-cyan-500/20 hover:to-purple-500/20 transition-all"
                  >
                    <BarChart3 className="w-5 h-5" />
                    View Full Leaderboard
                  </Link>
                </div>
              )}

              {/* Placeholder for non-student leaderboard/badges */}
              {activeTab !== 'progress' && !isStudent && (
                <div className="text-center py-12">
                  <LayoutGrid className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">This feature is available for students only</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Summary for Teachers */}
          {!isStudent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-500" />
                  Recent Activity
                </h3>
                {stats?.recentEnrollments?.slice(0, 5).map((e: any, i: number) => (
                  <div key={i} className="mb-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white">{e.User?.firstName} {e.User?.lastName}</p>
                    <p className="text-sm text-gray-500">Enrolled in {e.Course?.title}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Platform Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Total Students</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{stats?.overview.totalStudents || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Total Courses</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{stats?.overview.totalCourses || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 dark:text-gray-400">Total Enrollments</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{stats?.overview.totalEnrollments || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}