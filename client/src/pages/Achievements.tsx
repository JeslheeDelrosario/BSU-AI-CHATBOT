// client/src/pages/Achievements.tsx
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Trophy, Lock, Star, Zap, Award, RefreshCw } from 'lucide-react';

interface AchievementDef {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  requirementType: string;
  requirementValue: number;
  isActive: boolean;
}

interface EarnedAchievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  earnedAt: string;
  Definition?: AchievementDef;
}

export default function Achievements() {
  const [earned, setEarned] = useState<EarnedAchievement[]>([]);
  const [locked, setLocked] = useState<AchievementDef[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<'earned' | 'locked'>('earned');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gamification/achievements/me');
      setEarned(res.data.earned ?? []);
      setLocked(res.data.locked ?? []);
      setTotalPoints(res.data.totalPoints ?? 0);
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAchievements = async () => {
    try {
      setChecking(true);
      await api.post('/gamification/achievements/check');
      await fetchAchievements();
    } catch (err) {
      console.error('Failed to check achievements:', err);
    } finally {
      setChecking(false);
    }
  };

  const requirementLabel = (type: string, value: number): string => {
    switch (type) {
      case 'COURSE_COMPLETION': return `Complete ${value} course${value > 1 ? 's' : ''}`;
      case 'LESSON_COMPLETION': return `Complete ${value} lesson${value > 1 ? 's' : ''}`;
      case 'CORRECT_ANSWERS': return `Get ${value} correct answers`;
      case 'PERFECT_SCORE': return `Score 100% on ${value} quiz${value > 1 ? 'zes' : ''}`;
      case 'STREAK': return `Maintain a ${value}-day streak`;
      case 'ENROLLMENT': return `Enroll in ${value} course${value > 1 ? 's' : ''}`;
      default: return `Requirement: ${value}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">

      {/* Header */}
      <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3 pb-3 ">
              <Trophy className="w-10 h-10 text-yellow-400" />
              Achievements & Badges
            </h1>
            <p className="text-slate-600 dark:text-gray-400 mt-2 text-lg">
              Track your learning milestones and earn badges
            </p>
          </div>
          <button
            onClick={handleCheckAchievements}
            disabled={checking}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
          >
            <RefreshCw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Checking...' : 'Check Progress'}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-yellow-400">{earned.length}</p>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">Badges Earned</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-purple-400">{totalPoints}</p>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">Total Points</p>
          </div>
          <div className="bg-gradient-to-br from-slate-500/20 to-slate-600/10 border border-slate-500/30 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-slate-400">{locked.length}</p>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">Locked</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab('earned')}
          className={`px-6 py-3 rounded-2xl font-semibold text-base transition-all ${
            activeTab === 'earned'
              ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/20 border border-yellow-500/50 text-yellow-400'
              : 'bg-white/5 border border-white/10 text-slate-600 dark:text-gray-400 hover:border-yellow-500/30'
          }`}
        >
          <Award className="w-5 h-5 inline mr-2" />
          Earned ({earned.length})
        </button>
        <button
          onClick={() => setActiveTab('locked')}
          className={`px-6 py-3 rounded-2xl font-semibold text-base transition-all ${
            activeTab === 'locked'
              ? 'bg-gradient-to-r from-slate-500/30 to-slate-600/20 border border-slate-500/50 text-slate-300'
              : 'bg-white/5 border border-white/10 text-slate-600 dark:text-gray-400 hover:border-slate-500/30'
          }`}
        >
          <Lock className="w-5 h-5 inline mr-2" />
          Locked ({locked.length})
        </button>
      </div>

      {/* Earned Badges */}
      {activeTab === 'earned' && (
        <div>
          {earned.length === 0 ? (
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-16 text-center shadow-xl">
              <Trophy className="w-20 h-20 mx-auto text-slate-600 dark:text-gray-600 mb-4" />
              <p className="text-xl font-semibold text-slate-600 dark:text-gray-400">No badges earned yet</p>
              <p className="text-slate-500 dark:text-gray-500 mt-2">Complete courses and quizzes to earn your first badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {earned.map((achievement) => (
                <div
                  key={achievement.id}
                  className="backdrop-blur-2xl bg-gradient-to-br from-yellow-900/20 to-orange-900/10 border border-yellow-500/30 rounded-3xl p-6 shadow-xl hover:shadow-yellow-500/20 hover:border-yellow-400/50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">{achievement.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">{achievement.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-bold text-sm">{achievement.points} pts</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-gray-500 mt-2">
                        Earned {new Date(achievement.earnedAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Locked Badges */}
      {activeTab === 'locked' && (
        <div>
          {locked.length === 0 ? (
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-16 text-center shadow-xl">
              <Zap className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
              <p className="text-xl font-semibold text-slate-900 dark:text-white">All badges unlocked!</p>
              <p className="text-slate-600 dark:text-gray-400 mt-2">Amazing — you've earned every available badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {locked.map((def) => (
                <div
                  key={def.id}
                  className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl opacity-70 hover:opacity-90 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-5xl flex-shrink-0 grayscale group-hover:grayscale-0 transition-all relative">
                      {def.icon}
                      <div className="absolute -bottom-1 -right-1 bg-slate-700 rounded-full p-0.5">
                        <Lock className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-600 dark:text-gray-300 truncate">{def.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-gray-500 mt-1">{def.description}</p>
                      <div className="mt-3 px-3 py-1.5 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <p className="text-xs text-slate-400 font-medium">
                          🎯 {requirementLabel(def.requirementType, def.requirementValue)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-500 font-bold text-sm">{def.points} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
