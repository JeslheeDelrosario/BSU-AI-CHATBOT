// server/src/controllers/gamification.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { AchievementType } from '@prisma/client';

// ─── ACHIEVEMENT DEFINITIONS (Admin CRUD) ────────────────────────────────────

export const getAchievementDefinitions = async (req: AuthRequest, res: Response) => {
  try {
    const definitions = await prisma.achievementDefinition.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { Achievements: true } } },
    });
    return res.json({ definitions });
  } catch (error) {
    console.error('getAchievementDefinitions error:', error);
    return res.status(500).json({ error: 'Server error fetching achievement definitions' });
  }
};

export const createAchievementDefinition = async (req: AuthRequest, res: Response) => {
  try {
    const { type, title, description, icon, points, requirementType, requirementValue } = req.body;
    if (!type || !title || !description || !icon || !requirementType || requirementValue === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await prisma.achievementDefinition.findUnique({ where: { type } });
    if (existing) return res.status(409).json({ error: 'Achievement definition for this type already exists' });
    const definition = await prisma.achievementDefinition.create({
      data: { type, title, description, icon, points: points ?? 0, requirementType, requirementValue },
    });
    return res.status(201).json({ definition });
  } catch (error) {
    console.error('createAchievementDefinition error:', error);
    return res.status(500).json({ error: 'Server error creating achievement definition' });
  }
};

export const updateAchievementDefinition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, icon, points, requirementType, requirementValue, isActive } = req.body;
    const definition = await prisma.achievementDefinition.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(points !== undefined && { points }),
        ...(requirementType !== undefined && { requirementType }),
        ...(requirementValue !== undefined && { requirementValue }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    return res.json({ definition });
  } catch (error) {
    console.error('updateAchievementDefinition error:', error);
    return res.status(500).json({ error: 'Server error updating achievement definition' });
  }
};

export const deleteAchievementDefinition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.achievementDefinition.delete({ where: { id } });
    return res.json({ message: 'Achievement definition deleted' });
  } catch (error) {
    console.error('deleteAchievementDefinition error:', error);
    return res.status(500).json({ error: 'Server error deleting achievement definition' });
  }
};

// ─── USER ACHIEVEMENTS ────────────────────────────────────────────────────────

export const getUserAchievements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId || req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const [earned, definitions] = await Promise.all([
      prisma.achievement.findMany({ where: { userId }, orderBy: { earnedAt: 'desc' }, include: { Definition: true } }),
      prisma.achievementDefinition.findMany({ where: { isActive: true } }),
    ]);
    const earnedTypes = new Set(earned.map(a => a.type));
    const locked = definitions.filter(d => !earnedTypes.has(d.type));
    const totalPoints = earned.reduce((sum, a) => sum + a.points, 0);
    return res.json({ earned, locked, totalPoints });
  } catch (error) {
    console.error('getUserAchievements error:', error);
    return res.status(500).json({ error: 'Server error fetching achievements' });
  }
};

// ─── ACHIEVEMENT EVALUATION ENGINE ───────────────────────────────────────────

export const evaluateAndAwardAchievements = async (userId: string): Promise<void> => {
  try {
    const [definitions, alreadyEarned, enrollments, progress, user] = await Promise.all([
      prisma.achievementDefinition.findMany({ where: { isActive: true } }),
      prisma.achievement.findMany({ where: { userId }, select: { type: true } }),
      prisma.enrollment.findMany({ where: { userId } }),
      prisma.progress.findMany({ where: { userId }, include: { Lesson: { select: { type: true } } } }),
      prisma.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
    ]);

    const earnedTypes = new Set(alreadyEarned.map(a => a.type));
    const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length;
    const completedLessons = progress.filter(p => p.completed).length;
    const totalTimeSpentMinutes = progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const totalTimeSpentHours = totalTimeSpentMinutes / 60;
    
    // Quiz scores live in Progress for QUIZ-type lessons
    const quizProgress = progress.filter(p => p.completed && p.score !== null && (p as any).Lesson?.type === 'QUIZ');
    const correctAnswers = quizProgress.reduce((sum, p) => sum + Math.round(((p.score ?? 0) / 100) * 10), 0);
    const perfectScores = quizProgress.filter(p => (p.score ?? 0) >= 100).length;

    const dates = [...new Set(progress.map(p => p.updatedAt.toISOString().split('T')[0]))].sort();
    let streak = 0;
    if (dates.length > 0) {
      let temp = 1;
      for (let i = 1; i < dates.length; i++) {
        const diff = Math.round((new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / 86400000);
        if (diff === 1) temp++;
        else temp = 1;
      }
      streak = temp;
    }

    // Check if user has logged in (account exists)
    const hasLoggedIn = !!user;
    
    // Get total courses in system for Master Scholar check
    const totalCoursesInSystem = await prisma.course.count({ where: { status: 'PUBLISHED' } });
    const hasCompletedAllCourses = completedCourses >= totalCoursesInSystem && totalCoursesInSystem > 0;

    const toAward: { type: AchievementType; title: string; description: string; icon: string; points: number; definitionId: string }[] = [];

    for (const def of definitions) {
      if (earnedTypes.has(def.type)) continue;
      let qualifies = false;
      switch (def.requirementType) {
        case 'COURSE_COMPLETION': qualifies = completedCourses >= def.requirementValue; break;
        case 'LESSON_COMPLETION': qualifies = completedLessons >= def.requirementValue; break;
        case 'CORRECT_ANSWERS': qualifies = correctAnswers >= def.requirementValue; break;
        case 'PERFECT_SCORE': qualifies = perfectScores >= def.requirementValue; break;
        case 'STREAK': qualifies = streak >= def.requirementValue; break;
        case 'ENROLLMENT': qualifies = enrollments.length >= def.requirementValue; break;
        case 'TIME_SPENT': qualifies = totalTimeSpentHours >= def.requirementValue; break;
        case 'FIRST_LOGIN': qualifies = hasLoggedIn; break;
        case 'LESSONS_BROWSED': qualifies = progress.length >= def.requirementValue; break;
        case 'ALL_COURSES': qualifies = hasCompletedAllCourses && totalTimeSpentHours >= def.requirementValue; break;
        case 'RANK_COMPOSITE': {
          // Composite requirement: courses completed AND time spent (value format: courses * 100 + hours)
          const requiredCourses = Math.floor(def.requirementValue / 100);
          const requiredHours = def.requirementValue % 100;
          qualifies = completedCourses >= requiredCourses && totalTimeSpentHours >= requiredHours;
          break;
        }
      }
      if (qualifies) {
        toAward.push({ type: def.type, title: def.title, description: def.description, icon: def.icon, points: def.points, definitionId: def.id });
      }
    }

    if (toAward.length > 0) {
      await prisma.achievement.createMany({ data: toAward.map(a => ({ userId, ...a })), skipDuplicates: true });
    }
  } catch (error) {
    console.error('evaluateAndAwardAchievements error:', error);
  }
};

export const triggerAchievementCheck = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    await evaluateAndAwardAchievements(userId);
    const earned = await prisma.achievement.findMany({ where: { userId }, orderBy: { earnedAt: 'desc' } });
    return res.json({ message: 'Achievement check complete', earned });
  } catch (error) {
    console.error('triggerAchievementCheck error:', error);
    return res.status(500).json({ error: 'Server error checking achievements' });
  }
};

// ─── RANK PROGRESSION SYSTEM ─────────────────────────────────────────────────

const RANK_ORDER = [
  'RANK_NEWCOMER',
  'RANK_LEARNER', 
  'RANK_EXPLORER',
  'RANK_ACHIEVER',
  'RANK_SCHOLAR',
  'RANK_EXPERT',
  'RANK_MASTER_SCHOLAR'
] as const;

const RANK_DETAILS: Record<string, { title: string; icon: string; color: string; description: string }> = {
  RANK_NEWCOMER: { title: 'Newcomer', icon: '🌱', color: 'from-gray-400 to-gray-500', description: 'Welcome to the learning journey!' },
  RANK_LEARNER: { title: 'Learner', icon: '📖', color: 'from-green-400 to-emerald-500', description: 'Building your foundation' },
  RANK_EXPLORER: { title: 'Explorer', icon: '🔍', color: 'from-blue-400 to-cyan-500', description: 'Discovering new knowledge' },
  RANK_ACHIEVER: { title: 'Achiever', icon: '🏅', color: 'from-yellow-400 to-amber-500', description: 'Making real progress' },
  RANK_SCHOLAR: { title: 'Scholar', icon: '🎓', color: 'from-purple-400 to-violet-500', description: 'Dedicated to excellence' },
  RANK_EXPERT: { title: 'Expert', icon: '⭐', color: 'from-orange-400 to-red-500', description: 'Mastering the curriculum' },
  RANK_MASTER_SCHOLAR: { title: 'Master Scholar', icon: '👑', color: 'from-yellow-300 to-yellow-500', description: 'The pinnacle of achievement' },
};

export const getUserRankProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId || req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const [earnedAchievements, enrollments, progress, rankDefinitions] = await Promise.all([
      prisma.achievement.findMany({ where: { userId }, select: { type: true, earnedAt: true } }),
      prisma.enrollment.findMany({ where: { userId } }),
      prisma.progress.findMany({ where: { userId } }),
      prisma.achievementDefinition.findMany({ 
        where: { type: { in: RANK_ORDER as unknown as AchievementType[] }, isActive: true },
        orderBy: { requirementValue: 'asc' }
      }),
    ]);

    const earnedTypes = new Set(earnedAchievements.map(a => a.type));
    const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length;
    const completedLessons = progress.filter(p => p.completed).length;
    const totalTimeSpentMinutes = progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const totalTimeSpentHours = totalTimeSpentMinutes / 60;
    const coursesEnrolled = enrollments.length;

    // Find current rank (highest earned rank)
    let currentRankType = 'RANK_NEWCOMER';
    for (const rankType of RANK_ORDER) {
      if (earnedTypes.has(rankType as AchievementType)) {
        currentRankType = rankType;
      }
    }

    // Find next rank
    const currentRankIndex = RANK_ORDER.indexOf(currentRankType as typeof RANK_ORDER[number]);
    const nextRankType = currentRankIndex < RANK_ORDER.length - 1 ? RANK_ORDER[currentRankIndex + 1] : null;

    // Get next rank requirements
    let nextRankProgress = null;
    if (nextRankType) {
      const nextRankDef = rankDefinitions.find(d => d.type === nextRankType);
      if (nextRankDef) {
        let currentValue = 0;
        let targetValue = nextRankDef.requirementValue;
        let progressType = nextRankDef.requirementType;

        switch (nextRankDef.requirementType) {
          case 'TIME_SPENT':
            currentValue = totalTimeSpentHours;
            break;
          case 'COURSE_COMPLETION':
            currentValue = completedCourses;
            break;
          case 'LESSON_COMPLETION':
            currentValue = completedLessons;
            break;
          case 'LESSONS_BROWSED':
            currentValue = progress.length;
            break;
          case 'ENROLLMENT':
            currentValue = coursesEnrolled;
            break;
          case 'RANK_COMPOSITE': {
            const requiredCourses = Math.floor(targetValue / 100);
            const requiredHours = targetValue % 100;
            const courseProgress = Math.min(completedCourses / requiredCourses, 1);
            const timeProgress = Math.min(totalTimeSpentHours / requiredHours, 1);
            currentValue = Math.round((courseProgress + timeProgress) / 2 * 100);
            targetValue = 100;
            progressType = 'COMPOSITE';
            break;
          }
          case 'ALL_COURSES': {
            const totalCourses = await prisma.course.count({ where: { status: 'PUBLISHED' } });
            currentValue = completedCourses;
            targetValue = totalCourses;
            break;
          }
        }

        nextRankProgress = {
          type: nextRankType,
          ...RANK_DETAILS[nextRankType],
          requirementType: progressType,
          currentValue: Math.round(currentValue * 10) / 10,
          targetValue,
          percentage: Math.min(Math.round((currentValue / targetValue) * 100), 100),
        };
      }
    }

    const currentRank = {
      type: currentRankType,
      ...RANK_DETAILS[currentRankType],
      earnedAt: earnedAchievements.find(a => a.type === currentRankType)?.earnedAt || null,
    };

    // Get all ranks with earned status
    const allRanks = RANK_ORDER.map(rankType => ({
      type: rankType,
      ...RANK_DETAILS[rankType],
      earned: earnedTypes.has(rankType as AchievementType),
      earnedAt: earnedAchievements.find(a => a.type === rankType)?.earnedAt || null,
    }));

    return res.json({
      currentRank,
      nextRank: nextRankProgress,
      allRanks,
      stats: {
        completedCourses,
        completedLessons,
        totalTimeSpentHours: Math.round(totalTimeSpentHours * 10) / 10,
        coursesEnrolled,
      },
    });
  } catch (error) {
    console.error('getUserRankProgress error:', error);
    return res.status(500).json({ error: 'Server error fetching rank progress' });
  }
};

// ─── LEADERBOARD CONFIG (Admin CRUD) ─────────────────────────────────────────

export const getLeaderboardConfigs = async (req: AuthRequest, res: Response) => {
  try {
    const configs = await prisma.leaderboardConfig.findMany({ orderBy: { createdAt: 'asc' } });
    return res.json({ configs });
  } catch (error) {
    console.error('getLeaderboardConfigs error:', error);
    return res.status(500).json({ error: 'Server error fetching leaderboard configs' });
  }
};

export const createLeaderboardConfig = async (req: AuthRequest, res: Response) => {
  try {
    const { name, metric, courseId, topN } = req.body;
    if (!name || !metric) return res.status(400).json({ error: 'name and metric are required' });
    const config = await prisma.leaderboardConfig.create({
      data: { name, metric, courseId: courseId || null, topN: topN ?? 10 },
    });
    return res.status(201).json({ config });
  } catch (error) {
    console.error('createLeaderboardConfig error:', error);
    return res.status(500).json({ error: 'Server error creating leaderboard config' });
  }
};

export const updateLeaderboardConfig = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, metric, courseId, topN, isActive } = req.body;
    const config = await prisma.leaderboardConfig.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(metric !== undefined && { metric }),
        ...(courseId !== undefined && { courseId }),
        ...(topN !== undefined && { topN }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    return res.json({ config });
  } catch (error) {
    console.error('updateLeaderboardConfig error:', error);
    return res.status(500).json({ error: 'Server error updating leaderboard config' });
  }
};

export const deleteLeaderboardConfig = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.leaderboardConfig.delete({ where: { id } });
    return res.json({ message: 'Leaderboard config deleted' });
  } catch (error) {
    console.error('deleteLeaderboardConfig error:', error);
    return res.status(500).json({ error: 'Server error deleting leaderboard config' });
  }
};

// ─── LEADERBOARD DATA ─────────────────────────────────────────────────────────

async function buildLeaderboardEntries(metric: string, courseId: string | undefined, topN: number): Promise<any[]> {
  switch (metric) {
    case 'COURSE_COMPLETION': {
      const completions = await prisma.enrollment.groupBy({
        by: ['userId'],
        where: { status: 'COMPLETED', ...(courseId ? { courseId } : {}) },
        _count: { courseId: true },
        orderBy: { _count: { courseId: 'desc' } },
        take: topN,
      });
      const users = await prisma.user.findMany({ where: { id: { in: completions.map(c => c.userId) } }, select: { id: true, firstName: true, lastName: true, avatar: true } });
      return completions.map((c, idx) => {
        const u = users.find(u => u.id === c.userId);
        return { rank: idx + 1, userId: c.userId, name: u ? `${u.firstName} ${u.lastName}` : 'Unknown', avatar: u?.avatar ?? null, value: c._count.courseId, label: 'Courses Completed' };
      });
    }
    case 'QUIZ_SCORE': {
      // Quiz scores are stored in Progress.score for QUIZ-type lessons
      const quizProgress = await prisma.progress.findMany({
        where: {
          completed: true,
          score: { not: null },
          Lesson: {
            type: 'QUIZ',
            ...(courseId ? { courseId } : {}),
          },
        },
        select: { userId: true, score: true },
      });
      const scoreMap: Record<string, { total: number; count: number }> = {};
      for (const p of quizProgress) {
        if (!scoreMap[p.userId]) scoreMap[p.userId] = { total: 0, count: 0 };
        scoreMap[p.userId].total += p.score ?? 0;
        scoreMap[p.userId].count += 1;
      }
      const sorted = Object.entries(scoreMap)
        .map(([userId, { total, count }]) => ({ userId, avg: Math.round(total / count) }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, topN);
      const users = await prisma.user.findMany({ where: { id: { in: sorted.map(r => r.userId) } }, select: { id: true, firstName: true, lastName: true, avatar: true } });
      return sorted.map((r, idx) => {
        const u = users.find(u => u.id === r.userId);
        return { rank: idx + 1, userId: r.userId, name: u ? `${u.firstName} ${u.lastName}` : 'Unknown', avatar: u?.avatar ?? null, value: r.avg, label: 'Avg Quiz Score (%)' };
      });
    }
    case 'CORRECT_ANSWERS': {
      // Correct answers = quiz lessons completed with score, estimated from score × question count
      // We store score as a percentage; count correct answers as score/100 * estimated questions (10)
      const quizProgress = await prisma.progress.findMany({
        where: {
          completed: true,
          score: { not: null },
          Lesson: {
            type: 'QUIZ',
            ...(courseId ? { courseId } : {}),
          },
        },
        select: { userId: true, score: true },
      });
      const countMap: Record<string, number> = {};
      for (const p of quizProgress) {
        const estimated = Math.round(((p.score ?? 0) / 100) * 10);
        countMap[p.userId] = (countMap[p.userId] ?? 0) + estimated;
      }
      const sorted = Object.entries(countMap).sort(([, a], [, b]) => b - a).slice(0, topN);
      const users = await prisma.user.findMany({ where: { id: { in: sorted.map(([id]) => id) } }, select: { id: true, firstName: true, lastName: true, avatar: true } });
      return sorted.map(([userId, count], idx) => {
        const u = users.find(u => u.id === userId);
        return { rank: idx + 1, userId, name: u ? `${u.firstName} ${u.lastName}` : 'Unknown', avatar: u?.avatar ?? null, value: count, label: 'Correct Answers' };
      });
    }
    case 'COMPLETION_TIME': {
      // Use Progress.timeSpent for completed quiz lessons (fastest completers rank highest)
      const quizProgress = await prisma.progress.findMany({
        where: {
          completed: true,
          timeSpent: { gt: 0 },
          Lesson: {
            type: 'QUIZ',
            ...(courseId ? { courseId } : {}),
          },
        },
        select: { userId: true, timeSpent: true },
      });
      const timeMap: Record<string, { total: number; count: number }> = {};
      for (const p of quizProgress) {
        if (!timeMap[p.userId]) timeMap[p.userId] = { total: 0, count: 0 };
        timeMap[p.userId].total += p.timeSpent ?? 0;
        timeMap[p.userId].count += 1;
      }
      const sorted = Object.entries(timeMap)
        .map(([userId, { total, count }]) => ({ userId, avg: Math.round(total / count) }))
        .sort((a, b) => a.avg - b.avg)
        .slice(0, topN);
      const users = await prisma.user.findMany({ where: { id: { in: sorted.map(r => r.userId) } }, select: { id: true, firstName: true, lastName: true, avatar: true } });
      return sorted.map((r, idx) => {
        const u = users.find(u => u.id === r.userId);
        const s = r.avg;
        return { rank: idx + 1, userId: r.userId, name: u ? `${u.firstName} ${u.lastName}` : 'Unknown', avatar: u?.avatar ?? null, value: s, displayValue: `${Math.floor(s / 60)}m ${s % 60}s`, label: 'Avg Completion Time' };
      });
    }
    case 'ACHIEVEMENT_POINTS': {
      const pointsData = await prisma.achievement.groupBy({ by: ['userId'], _sum: { points: true }, orderBy: { _sum: { points: 'desc' } }, take: topN });
      const users = await prisma.user.findMany({ where: { id: { in: pointsData.map(p => p.userId) } }, select: { id: true, firstName: true, lastName: true, avatar: true } });
      return pointsData.map((p, idx) => {
        const u = users.find(u => u.id === p.userId);
        return { rank: idx + 1, userId: p.userId, name: u ? `${u.firstName} ${u.lastName}` : 'Unknown', avatar: u?.avatar ?? null, value: p._sum.points ?? 0, label: 'Achievement Points' };
      });
    }
    default:
      return [];
  }
}

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { configId, metric, courseId, topN: topNParam } = req.query;
    let resolvedMetric = metric as string;
    let resolvedCourseId = courseId as string | undefined;
    let resolvedTopN = parseInt(topNParam as string) || 10;

    if (configId) {
      const config = await prisma.leaderboardConfig.findUnique({ where: { id: configId as string } });
      if (!config) return res.status(404).json({ error: 'Leaderboard config not found' });
      resolvedMetric = config.metric;
      resolvedCourseId = config.courseId ?? undefined;
      resolvedTopN = config.topN;
    }

    if (!resolvedMetric) return res.status(400).json({ error: 'metric is required' });

    const entries = await buildLeaderboardEntries(resolvedMetric, resolvedCourseId, resolvedTopN);
    return res.json({ metric: resolvedMetric, courseId: resolvedCourseId ?? null, entries });
  } catch (error) {
    console.error('getLeaderboard error:', error);
    return res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
};

export const getAllLeaderboards = async (req: AuthRequest, res: Response) => {
  try {
    const configs = await prisma.leaderboardConfig.findMany({ where: { isActive: true } });
    const results = await Promise.all(
      configs.map(async (config) => {
        const entries = await buildLeaderboardEntries(config.metric, config.courseId ?? undefined, config.topN);
        return { config, entries };
      })
    );
    return res.json({ leaderboards: results });
  } catch (error) {
    console.error('getAllLeaderboards error:', error);
    return res.status(500).json({ error: 'Server error fetching all leaderboards' });
  }
};

// ─── SEQUENTIAL LEARNING ─────────────────────────────────────────────────────

export const getCourseSequentialProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' }, select: { id: true, title: true, type: true, order: true, duration: true } } },
        },
      },
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const progressRecords = await prisma.progress.findMany({ where: { userId, Lesson: { courseId } }, select: { lessonId: true, completed: true, score: true } });
    const lessonProgressMap: Record<string, { completed: boolean; score: number | null }> = {};
    for (const p of progressRecords) lessonProgressMap[p.lessonId] = { completed: p.completed, score: p.score };

    const isSatisfactorilyCompleted = (lessonId: string, lessonType: string): boolean => {
      const prog = lessonProgressMap[lessonId];
      if (!prog || !prog.completed) return false;
      if (lessonType === 'QUIZ') return (prog.score ?? 0) >= 85;
      return true;
    };

    const enrichedModules = course.modules.map((mod, modIdx) => {
      let moduleUnlocked = modIdx === 0;
      if (modIdx > 0) {
        const prevMod = course.modules[modIdx - 1];
        if (prevMod.lessons.length > 0) {
          const lastLesson = prevMod.lessons[prevMod.lessons.length - 1];
          moduleUnlocked = isSatisfactorilyCompleted(lastLesson.id, lastLesson.type);
        }
      }

      const enrichedLessons = mod.lessons.map((lesson, lessonIdx) => {
        let isUnlocked = false;
        if (moduleUnlocked) {
          isUnlocked = lessonIdx === 0 || isSatisfactorilyCompleted(mod.lessons[lessonIdx - 1].id, mod.lessons[lessonIdx - 1].type);
        }
        const prog = lessonProgressMap[lesson.id];
        return { ...lesson, completed: prog?.completed ?? false, score: prog?.score ?? null, isUnlocked };
      });

      const completedCount = enrichedLessons.filter(l => l.completed).length;
      return {
        ...mod,
        lessons: enrichedLessons,
        isUnlocked: moduleUnlocked,
        progressPercent: mod.lessons.length > 0 ? Math.round((completedCount / mod.lessons.length) * 100) : 0,
        completedLessons: completedCount,
        totalLessons: mod.lessons.length,
      };
    });

    const totalLessons = enrichedModules.reduce((s, m) => s + m.totalLessons, 0);
    const completedLessons = enrichedModules.reduce((s, m) => s + m.completedLessons, 0);

    return res.json({
      courseId,
      modules: enrichedModules,
      overallProgress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      completedLessons,
      totalLessons,
    });
  } catch (error) {
    console.error('getCourseSequentialProgress error:', error);
    return res.status(500).json({ error: 'Server error fetching sequential progress' });
  }
};

export const markLessonComplete = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.userId;
    const { timeSpent, score } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { lessons: { orderBy: { order: 'asc' } } } } },
    });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const progress = await prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: { userId, lessonId, completed: true, timeSpent: timeSpent ?? 0, score: score ?? null, completedAt: new Date() },
      update: { completed: true, timeSpent: timeSpent ?? 0, score: score ?? null, completedAt: new Date() },
    });

    if (lesson.moduleId && lesson.module) {
      const allLessonIds = lesson.module.lessons.map(l => l.id);
      const completedProgresses = await prisma.progress.findMany({ where: { userId, lessonId: { in: allLessonIds }, completed: true } });
      if (completedProgresses.length === allLessonIds.length) {
        await prisma.userModuleProgress.upsert({
          where: { userId_moduleId: { userId, moduleId: lesson.moduleId } },
          create: { userId, moduleId: lesson.moduleId, completed: true, completedAt: new Date() },
          update: { completed: true, completedAt: new Date() },
        });
      }
    }

    await evaluateAndAwardAchievements(userId);
    return res.json({ progress, message: 'Lesson marked as complete' });
  } catch (error) {
    console.error('markLessonComplete error:', error);
    return res.status(500).json({ error: 'Server error marking lesson complete' });
  }
};

// ─── SEED DEFAULT ACHIEVEMENT DEFINITIONS ────────────────────────────────────

export const seedDefaultAchievements = async (req: AuthRequest, res: Response) => {
  try {
    const defaults = [
      // ── Enrollment milestones ─────────────────────────────────────────────
      { type: 'FIRST_COURSE' as AchievementType,        title: 'First Step',           description: 'Enrolled in your first course',                    icon: '🎯', points: 10,  requirementType: 'ENROLLMENT',        requirementValue: 1   },
      { type: 'FIVE_COURSES' as AchievementType,        title: 'Course Collector',     description: 'Enrolled in 5 courses',                            icon: '📚', points: 50,  requirementType: 'ENROLLMENT',        requirementValue: 5   },
      { type: 'TEN_COURSES' as AchievementType,         title: 'Knowledge Seeker',     description: 'Enrolled in 10 courses',                           icon: '🏆', points: 100, requirementType: 'ENROLLMENT',        requirementValue: 10  },
      // ── Course completion ─────────────────────────────────────────────────
      { type: 'COURSE_COMPLETION' as AchievementType,   title: 'Course Graduate',      description: 'Completed your first course',                      icon: '🎓', points: 75,  requirementType: 'COURSE_COMPLETION', requirementValue: 1   },
      { type: 'MODULE_COMPLETE' as AchievementType,     title: 'Module Master',        description: 'Completed 3 courses',                              icon: '📖', points: 120, requirementType: 'COURSE_COMPLETION', requirementValue: 3   },
      { type: 'LEADERBOARD_TOP3' as AchievementType,    title: 'Overachiever',         description: 'Completed 5 courses',                              icon: '🌠', points: 200, requirementType: 'COURSE_COMPLETION', requirementValue: 5   },
      { type: 'LEADERBOARD_TOP1' as AchievementType,    title: 'Course Champion',      description: 'Completed 10 courses',                             icon: '�', points: 400, requirementType: 'COURSE_COMPLETION', requirementValue: 10  },
      // ── Lesson completion ─────────────────────────────────────────────────
      { type: 'MILESTONE' as AchievementType,           title: 'Getting Started',      description: 'Completed your first 5 lessons',                   icon: '🌱', points: 15,  requirementType: 'LESSON_COMPLETION', requirementValue: 5   },
      { type: 'SPEED_LEARNER' as AchievementType,       title: 'Lesson Explorer',      description: 'Completed 10 lessons',                             icon: '🌟', points: 30,  requirementType: 'LESSON_COMPLETION', requirementValue: 10  },
      { type: 'HELPFUL_PEER' as AchievementType,        title: 'Consistent Learner',   description: 'Completed 25 lessons',                             icon: '�', points: 60,  requirementType: 'LESSON_COMPLETION', requirementValue: 25  },
      { type: 'EARLY_BIRD' as AchievementType,          title: 'Lesson Veteran',       description: 'Completed 50 lessons',                             icon: '⚡', points: 120, requirementType: 'LESSON_COMPLETION', requirementValue: 50  },
      { type: 'NIGHT_OWL' as AchievementType,           title: 'Lesson Legend',        description: 'Completed 100 lessons',                            icon: '🦅', points: 250, requirementType: 'LESSON_COMPLETION', requirementValue: 100 },
      // ── Quiz / perfect scores ─────────────────────────────────────────────
      { type: 'PERFECT_SCORE' as AchievementType,       title: 'Perfect Score',        description: 'Achieved 100% on a quiz',                          icon: '💯', points: 50,  requirementType: 'PERFECT_SCORE',     requirementValue: 1   },
      { type: 'QUIZ_MASTER' as AchievementType,         title: 'Quiz Master',          description: 'Achieved 100% on 5 quizzes',                       icon: '🧠', points: 150, requirementType: 'PERFECT_SCORE',     requirementValue: 5   },
      // ── Correct answers ───────────────────────────────────────────────────
      { type: 'CORRECT_ANSWERS_100' as AchievementType, title: 'Sharp Mind',           description: 'Got 100 correct answers total',                     icon: '✅', points: 60,  requirementType: 'CORRECT_ANSWERS',   requirementValue: 100 },
      { type: 'CORRECT_ANSWERS_500' as AchievementType, title: 'Answer Machine',       description: 'Got 500 correct answers total',                     icon: '🚀', points: 200, requirementType: 'CORRECT_ANSWERS',   requirementValue: 500 },
      // ── Streaks ───────────────────────────────────────────────────────────
      { type: 'STREAK' as AchievementType,              title: 'On Fire!',             description: 'Maintained a 7-day learning streak',               icon: '🔥', points: 80,  requirementType: 'STREAK',            requirementValue: 7   },
      { type: 'DEDICATED_LEARNER' as AchievementType,   title: 'Dedicated Learner',    description: 'Maintained a 30-day learning streak',              icon: '💪', points: 300, requirementType: 'STREAK',            requirementValue: 30  },
    ];

    let created = 0;
    let skipped = 0;
    for (const def of defaults) {
      const existing = await prisma.achievementDefinition.findUnique({ where: { type: def.type } });
      if (!existing) {
        await prisma.achievementDefinition.create({ data: def });
        created++;
      } else {
        skipped++;
      }
    }

    return res.json({ message: `Seeded ${created} definitions, skipped ${skipped} existing` });
  } catch (error) {
    console.error('seedDefaultAchievements error:', error);
    return res.status(500).json({ error: 'Server error seeding achievements' });
  }
};
