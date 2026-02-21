// client/src/pages/Leaderboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Crown, Medal, Trophy, Users, Zap, Target, Clock, CheckCircle, RefreshCw } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  value: number;
  displayValue?: string;
  label: string;
}

interface LeaderboardConfig {
  id: string;
  name: string;
  metric: string;
  courseId: string | null;
  topN: number;
  isActive: boolean;
}

interface LeaderboardData {
  config: LeaderboardConfig;
  entries: LeaderboardEntry[];
}

const METRIC_ICONS: Record<string, React.ReactNode> = {
  COURSE_COMPLETION: <Trophy className="w-5 h-5" />,
  QUIZ_SCORE: <Target className="w-5 h-5" />,
  CORRECT_ANSWERS: <CheckCircle className="w-5 h-5" />,
  COMPLETION_TIME: <Clock className="w-5 h-5" />,
  ACHIEVEMENT_POINTS: <Zap className="w-5 h-5" />,
};

const METRIC_COLORS: Record<string, string> = {
  COURSE_COMPLETION: 'from-yellow-500 to-orange-500',
  QUIZ_SCORE: 'from-cyan-500 to-blue-500',
  CORRECT_ANSWERS: 'from-green-500 to-emerald-500',
  COMPLETION_TIME: 'from-purple-500 to-pink-500',
  ACHIEVEMENT_POINTS: 'from-indigo-500 to-violet-500',
};

const RANK_STYLES: Record<number, { bg: string; text: string; icon: React.ReactNode }> = {
  1: { bg: 'from-yellow-500/30 to-yellow-600/10 border-yellow-500/50', text: 'text-yellow-400', icon: <Crown className="w-5 h-5 text-yellow-400" /> },
  2: { bg: 'from-slate-400/30 to-slate-500/10 border-slate-400/50', text: 'text-slate-300', icon: <Medal className="w-5 h-5 text-slate-300" /> },
  3: { bg: 'from-orange-600/30 to-orange-700/10 border-orange-600/50', text: 'text-orange-400', icon: <Medal className="w-5 h-5 text-orange-400" /> },
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboards, setLeaderboards] = useState<LeaderboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeBoard, setActiveBoard] = useState(0);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gamification/leaderboards');
      setLeaderboards(res.data.leaderboards ?? []);
    } catch (err) {
      console.error('Failed to fetch leaderboards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboards();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (leaderboards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-16 text-center shadow-xl">
          <Trophy className="w-20 h-20 mx-auto text-slate-600 dark:text-gray-600 mb-4" />
          <p className="text-2xl font-bold text-slate-900 dark:text-white">No Leaderboards Yet</p>
          <p className="text-slate-600 dark:text-gray-400 mt-2">
            Ask an admin to configure leaderboards in the Admin Panel.
          </p>
        </div>
      </div>
    );
  }

  const currentBoard = leaderboards[activeBoard];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">

      {/* Header */}
      <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
              <Crown className="w-10 h-10 text-yellow-400" />
              Leaderboards
            </h1>
            <p className="text-slate-600 dark:text-gray-400 mt-2 text-lg">
              Top performers in the Integrated Learning System
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-white/20 text-slate-900 dark:text-white rounded-2xl font-medium hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Board Selector Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        {leaderboards.map((board, idx) => {
          const colorClass = METRIC_COLORS[board.config.metric] ?? 'from-cyan-500 to-purple-500';
          return (
            <button
              key={board.config.id}
              onClick={() => setActiveBoard(idx)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all ${
                activeBoard === idx
                  ? `bg-gradient-to-r ${colorClass} text-white shadow-lg`
                  : 'bg-white/5 border border-white/10 text-slate-600 dark:text-gray-400 hover:bg-white/10'
              }`}
            >
              {METRIC_ICONS[board.config.metric] ?? <Users className="w-4 h-4" />}
              {board.config.name}
            </button>
          );
        })}
      </div>

      {/* Active Leaderboard */}
      {currentBoard && (
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Board Header */}
          <div className={`bg-gradient-to-r ${METRIC_COLORS[currentBoard.config.metric] ?? 'from-cyan-500 to-purple-500'} p-6`}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl">
                {METRIC_ICONS[currentBoard.config.metric] ?? <Users className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{currentBoard.config.name}</h2>
                <p className="text-white/70 text-sm mt-0.5">Top {currentBoard.config.topN} performers</p>
              </div>
            </div>
          </div>

          {/* Entries */}
          <div className="p-6">
            {currentBoard.entries.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-slate-600 dark:text-gray-600 mb-3" />
                <p className="text-slate-600 dark:text-gray-400 text-lg">No data yet for this leaderboard.</p>
                <p className="text-slate-500 dark:text-gray-500 text-sm mt-1">Students need to complete activities first.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Top 3 Podium */}
                {currentBoard.entries.length >= 3 && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {/* 2nd Place */}
                    <PodiumCard entry={currentBoard.entries[1]} position={2} isCurrentUser={currentBoard.entries[1]?.userId === user?.id} />
                    {/* 1st Place */}
                    <PodiumCard entry={currentBoard.entries[0]} position={1} isCurrentUser={currentBoard.entries[0]?.userId === user?.id} />
                    {/* 3rd Place */}
                    <PodiumCard entry={currentBoard.entries[2]} position={3} isCurrentUser={currentBoard.entries[2]?.userId === user?.id} />
                  </div>
                )}

                {/* Full Rankings */}
                <div className="space-y-2">
                  {currentBoard.entries.map((entry) => {
                    const rankStyle = RANK_STYLES[entry.rank];
                    const isMe = entry.userId === user?.id;
                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                          isMe
                            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                            : rankStyle
                            ? `bg-gradient-to-r ${rankStyle.bg} border`
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {/* Rank */}
                        <div className="w-10 flex-shrink-0 flex items-center justify-center">
                          {rankStyle ? (
                            rankStyle.icon
                          ) : (
                            <span className="text-lg font-black text-slate-500 dark:text-gray-500">#{entry.rank}</span>
                          )}
                        </div>

                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 bg-gradient-to-br ${
                          isMe ? 'from-cyan-400 to-purple-600' : 'from-slate-500 to-slate-700'
                        }`}>
                          {entry.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate ${isMe ? 'text-cyan-400' : 'text-slate-900 dark:text-white'}`}>
                            {entry.name} {isMe && <span className="text-xs text-cyan-500 ml-1">(You)</span>}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-gray-500">{entry.label}</p>
                        </div>

                        {/* Value */}
                        <div className="text-right flex-shrink-0">
                          <p className={`text-xl font-black ${rankStyle ? rankStyle.text : isMe ? 'text-cyan-400' : 'text-slate-900 dark:text-white'}`}>
                            {entry.displayValue ?? entry.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PodiumCard({ entry, position, isCurrentUser }: { entry: LeaderboardEntry; position: number; isCurrentUser: boolean }) {
  const configs = {
    1: { height: 'pt-0', bg: 'from-yellow-500/30 to-yellow-600/10 border-yellow-500/40', text: 'text-yellow-400', icon: <Crown className="w-6 h-6 text-yellow-400" />, size: 'text-2xl' },
    2: { height: 'pt-4', bg: 'from-slate-400/20 to-slate-500/10 border-slate-400/30', text: 'text-slate-300', icon: <Medal className="w-5 h-5 text-slate-300" />, size: 'text-xl' },
    3: { height: 'pt-4', bg: 'from-orange-600/20 to-orange-700/10 border-orange-600/30', text: 'text-orange-400', icon: <Medal className="w-5 h-5 text-orange-400" />, size: 'text-xl' },
  };
  const cfg = configs[position as 1 | 2 | 3];

  return (
    <div className={`${cfg.height} flex flex-col items-center`}>
      <div className={`w-full bg-gradient-to-b ${cfg.bg} border rounded-2xl p-4 text-center ${isCurrentUser ? 'ring-2 ring-cyan-400' : ''}`}>
        <div className="flex justify-center mb-2">{cfg.icon}</div>
        <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-lg mb-2 ${isCurrentUser ? 'bg-gradient-to-br from-cyan-400 to-purple-600' : 'bg-gradient-to-br from-slate-500 to-slate-700'}`}>
          {entry.name.charAt(0).toUpperCase()}
        </div>
        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{entry.name}</p>
        <p className={`font-black ${cfg.size} ${cfg.text} mt-1`}>{entry.displayValue ?? entry.value}</p>
      </div>
    </div>
  );
}
