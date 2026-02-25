import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, BookOpen, Clock, Award, Target, 
  MessageSquare, Flame, BarChart3, Loader2, ChevronRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import api from '../lib/api';

interface ProgressSummary {
  totalEnrollments: number;
  completedLessons: number;
  totalLessons: number;
  totalTimeSpent: number;
  averageScore: number | null;
  completionRate: number;
}

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  thumbnail: string | null;
  level: string;
  enrolledAt: string;
  status: string;
  lessonsCompleted: number;
  totalLessons: number;
  progressPercent: number;
  timeSpent: number;
  averageScore: number | null;
}

interface ProgressData {
  summary: ProgressSummary;
  courseProgress: CourseProgress[];
  progressTimeline: Array<{ date: string; lessonsCompleted: number; timeSpent: number }>;
  recentActivity: Array<{
    lessonId: string;
    lessonTitle: string;
    courseId: string;
    completed: boolean;
    score: number | null;
    timeSpent: number;
    updatedAt: string;
  }>;
}

interface Analytics {
  byLessonType: Array<{ type: string; count: number; completed: number; totalTime: number; avgScore: number | null }>;
  weeklyProgress: Array<{ date: string; day: string; lessonsCompleted: number; timeSpent: number }>;
  scoreDistribution: { excellent: number; good: number; average: number; needsImprovement: number };
  achievements: Array<{ id: string; type: string; title: string; description: string; earnedAt: string }>;
  streakData: { currentStreak: number; longestStreak: number; lastActiveDate: string | null };
}

const COLORS = ['#00D9FF', '#A855F7', '#EC4899', '#10B981', '#F59E0B'];

export default function Progress() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'analytics'>('overview');

  useEffect(() => {
    fetchProgress();
    fetchAnalytics();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await api.get('/progress/me');
      setProgressData(res.data);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/progress/me/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

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
              <TrendingUp className="w-16 h-16 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 pb-3">
            My Progress
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Track your learning journey and achievements
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {(['overview', 'courses', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-white/5 border border-white/10 text-foreground hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && progressData && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <BookOpen className="w-8 h-8 text-cyan-400 mb-3" />
                <div className="text-3xl font-black text-foreground">{progressData.summary.totalEnrollments}</div>
                <div className="text-sm text-gray-400">Enrolled Courses</div>
              </div>
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <Target className="w-8 h-8 text-green-400 mb-3" />
                <div className="text-3xl font-black text-foreground">{progressData.summary.completedLessons}</div>
                <div className="text-sm text-gray-400">Lessons Completed</div>
              </div>
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <Clock className="w-8 h-8 text-purple-400 mb-3" />
                <div className="text-3xl font-black text-foreground">{formatTime(progressData.summary.totalTimeSpent)}</div>
                <div className="text-sm text-gray-400">Time Spent</div>
              </div>
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <Award className="w-8 h-8 text-yellow-400 mb-3" />
                <div className="text-3xl font-black text-foreground">
                  {progressData.summary.averageScore ? `${Math.round(progressData.summary.averageScore)}%` : 'N/A'}
                </div>
                <div className="text-sm text-gray-400">Average Score</div>
              </div>
            </div>

            {/* Streak & Completion */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Flame className="w-8 h-8 text-orange-400" />
                    <h3 className="text-xl font-bold text-foreground">Learning Streak</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-4xl font-black text-orange-400">{analytics.streakData.currentStreak}</div>
                      <div className="text-sm text-gray-400">Current Streak (days)</div>
                    </div>
                    <div>
                      <div className="text-4xl font-black text-purple-400">{analytics.streakData.longestStreak}</div>
                      <div className="text-sm text-gray-400">Longest Streak (days)</div>
                    </div>
                  </div>
                </div>

                <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="w-8 h-8 text-cyan-400" />
                    <h3 className="text-xl font-bold text-foreground">Completion Rate</h3>
                  </div>
                  <div className="relative pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        {progressData.summary.completedLessons} / {progressData.summary.totalLessons} lessons
                      </span>
                      <span className="text-lg font-bold text-cyan-400">{progressData.summary.completionRate}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${progressData.summary.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Progress Chart */}
            {analytics && analytics.weeklyProgress.length > 0 && (
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">Weekly Activity</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="day" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="lessonsCompleted" fill="#00D9FF" name="Lessons" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {progressData.recentActivity.length > 0 && (
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {progressData.recentActivity.slice(0, 5).map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${activity.completed ? 'bg-green-400' : 'bg-yellow-400'}`} />
                        <div>
                          <div className="font-medium text-foreground">{activity.lessonTitle}</div>
                          <div className="text-sm text-gray-400">
                            {new Date(activity.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {activity.score !== null && (
                          <div className="text-cyan-400 font-bold">{activity.score}%</div>
                        )}
                        <div className="text-sm text-gray-400">{formatTime(activity.timeSpent)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && progressData && (
          <div className="space-y-4">
            {progressData.courseProgress.length === 0 ? (
              <div className="text-center py-12 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">No courses enrolled yet</p>
                <a href="/courses" className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl">
                  Browse Courses
                </a>
              </div>
            ) : (
              progressData.courseProgress.map(course => (
                <div key={course.courseId} className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{course.courseTitle}</h3>
                        <span className={`px-2 py-1 text-xs rounded-lg ${
                          course.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                          course.status === 'ACTIVE' ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <span>{course.level}</span>
                        <span>•</span>
                        <span>{course.lessonsCompleted} / {course.totalLessons} lessons</span>
                        <span>•</span>
                        <span>{formatTime(course.timeSpent)}</span>
                        {course.averageScore !== null && (
                          <>
                            <span>•</span>
                            <span>Avg: {Math.round(course.averageScore)}%</span>
                          </>
                        )}
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-cyan-400">{course.progressPercent}%</div>
                      <a href={`/courses/${course.courseId}`} className="text-sm text-cyan-400 hover:underline flex items-center gap-1 mt-2">
                        Continue <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-8">
            {/* Score Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">Score Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Excellent (90+)', value: analytics.scoreDistribution.excellent },
                          { name: 'Good (75-89)', value: analytics.scoreDistribution.good },
                          { name: 'Average (60-74)', value: analytics.scoreDistribution.average },
                          { name: 'Needs Work (<60)', value: analytics.scoreDistribution.needsImprovement },
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#00D9FF]" />
                    <span className="text-sm text-gray-400">Excellent: {analytics.scoreDistribution.excellent}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#A855F7]" />
                    <span className="text-sm text-gray-400">Good: {analytics.scoreDistribution.good}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EC4899]" />
                    <span className="text-sm text-gray-400">Average: {analytics.scoreDistribution.average}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <span className="text-sm text-gray-400">Needs Work: {analytics.scoreDistribution.needsImprovement}</span>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">By Lesson Type</h3>
                <div className="space-y-4">
                  {analytics.byLessonType.map((item, idx) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-foreground">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">{item.completed}/{item.count} done</span>
                        {item.avgScore !== null && (
                          <span className="text-cyan-400">{item.avgScore}% avg</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Achievements */}
            {analytics.achievements.length > 0 && (
              <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-foreground mb-6">Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.achievements.map(achievement => (
                    <div key={achievement.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4">
                      <div className="p-3 bg-yellow-500/20 rounded-xl">
                        <Award className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{achievement.title}</div>
                        <div className="text-sm text-gray-400">{achievement.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
