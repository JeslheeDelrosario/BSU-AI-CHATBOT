import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getUserProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.userId;

    if (!userId) {
      res.status(400).json({ error: 'User ID required' });
      return;
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            level: true,
            _count: { select: { lessons: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const progress = await prisma.progress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
            type: true,
            duration: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const totalTimeSpent = progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const completedLessons = progress.filter(p => p.completed).length;
    const totalLessons = progress.length;
    const averageScore = progress.filter(p => p.score !== null).reduce((sum, p, _, arr) => sum + (p.score || 0) / arr.length, 0);

    const progressByDate = progress.reduce((acc, p) => {
      const date = p.updatedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, lessonsCompleted: 0, timeSpent: 0 };
      }
      if (p.completed) acc[date].lessonsCompleted++;
      acc[date].timeSpent += p.timeSpent || 0;
      return acc;
    }, {} as Record<string, { date: string; lessonsCompleted: number; timeSpent: number }>);

    const progressTimeline = Object.values(progressByDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    const courseProgress = enrollments.map(e => {
      const courseLessons = progress.filter(p => p.lesson.courseId === e.courseId);
      const completed = courseLessons.filter(p => p.completed).length;
      const total = e.course._count.lessons;
      return {
        courseId: e.courseId,
        courseTitle: e.course.title,
        thumbnail: e.course.thumbnail,
        level: e.course.level,
        enrolledAt: e.enrolledAt,
        status: e.status,
        lessonsCompleted: completed,
        totalLessons: total,
        progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        timeSpent: courseLessons.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
        averageScore: courseLessons.filter(p => p.score !== null).length > 0
          ? courseLessons.filter(p => p.score !== null).reduce((sum, p) => sum + (p.score || 0), 0) / courseLessons.filter(p => p.score !== null).length
          : null,
      };
    });

    res.json({
      summary: {
        totalEnrollments: enrollments.length,
        completedLessons,
        totalLessons,
        totalTimeSpent,
        averageScore: averageScore || null,
        completionRate: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      },
      courseProgress,
      progressTimeline,
      recentActivity: progress.slice(0, 10).map(p => ({
        lessonId: p.lessonId,
        lessonTitle: p.lesson.title,
        courseId: p.lesson.courseId,
        completed: p.completed,
        score: p.score,
        timeSpent: p.timeSpent,
        updatedAt: p.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ error: 'Server error fetching progress' });
  }
};

export const getProgressAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.userId;

    if (!userId) {
      res.status(400).json({ error: 'User ID required' });
      return;
    }

    const progress = await prisma.progress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
            type: true,
            course: { select: { title: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const byLessonType = progress.reduce((acc, p) => {
      const type = p.lesson.type;
      if (!acc[type]) {
        acc[type] = { type, count: 0, completed: 0, totalTime: 0, avgScore: 0, scores: [] as number[] };
      }
      acc[type].count++;
      if (p.completed) acc[type].completed++;
      acc[type].totalTime += p.timeSpent || 0;
      if (p.score !== null) acc[type].scores.push(p.score);
      return acc;
    }, {} as Record<string, any>);

    Object.values(byLessonType).forEach((item: any) => {
      item.avgScore = item.scores.length > 0 
        ? Math.round(item.scores.reduce((a: number, b: number) => a + b, 0) / item.scores.length) 
        : null;
      delete item.scores;
    });

    const weeklyProgress = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayProgress = progress.filter(p => 
        p.updatedAt.toISOString().split('T')[0] === dateStr
      );
      weeklyProgress.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        lessonsCompleted: dayProgress.filter(p => p.completed).length,
        timeSpent: dayProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
      });
    }

    const scoreDistribution = { excellent: 0, good: 0, average: 0, needsImprovement: 0 };
    progress.filter(p => p.score !== null).forEach(p => {
      const score = p.score!;
      if (score >= 90) scoreDistribution.excellent++;
      else if (score >= 75) scoreDistribution.good++;
      else if (score >= 60) scoreDistribution.average++;
      else scoreDistribution.needsImprovement++;
    });

    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { earnedAt: 'desc' },
    });

    res.json({
      byLessonType: Object.values(byLessonType),
      weeklyProgress,
      scoreDistribution,
      achievements,
      streakData: calculateStreak(progress),
    });
  } catch (error) {
    console.error('Get progress analytics error:', error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};

function calculateStreak(progress: any[]): { currentStreak: number; longestStreak: number; lastActiveDate: string | null } {
  if (progress.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  }

  const dates = [...new Set(progress.map(p => p.updatedAt.toISOString().split('T')[0]))].sort();
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  const lastDate = dates[dates.length - 1];
  if (lastDate === today || lastDate === yesterday) {
    currentStreak = tempStreak;
  }

  return {
    currentStreak,
    longestStreak,
    lastActiveDate: lastDate,
  };
}

export const getAIInteractionHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId || req.user?.userId;
    const { page = '1', limit = '20', type } = req.query;

    if (!userId) {
      res.status(400).json({ error: 'User ID required' });
      return;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId };
    if (type) where.type = type;

    const [interactions, total] = await Promise.all([
      prisma.aIInteraction.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          context: true,
          userMessage: true,
          aiResponse: true,
          helpful: true,
          createdAt: true,
        },
      }),
      prisma.aIInteraction.count({ where }),
    ]);

    const helpfulCount = await prisma.aIInteraction.count({
      where: { userId, helpful: true },
    });
    const notHelpfulCount = await prisma.aIInteraction.count({
      where: { userId, helpful: false },
    });

    const typeCounts = await prisma.aIInteraction.groupBy({
      by: ['type'],
      where: { userId },
      _count: { type: true },
    });

    res.json({
      interactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      stats: {
        total,
        helpful: helpfulCount,
        notHelpful: notHelpfulCount,
        unrated: total - helpfulCount - notHelpfulCount,
        byType: typeCounts.map(t => ({ type: t.type, count: t._count.type })),
      },
    });
  } catch (error) {
    console.error('Get AI interaction history error:', error);
    res.status(500).json({ error: 'Server error fetching AI history' });
  }
};

export const getSystemAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalCourses,
      totalEnrollments,
      totalLessons,
      totalProgress,
      totalAIInteractions,
      recentEnrollments,
      coursePopularity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.lesson.count(),
      prisma.progress.count({ where: { completed: true } }),
      prisma.aIInteraction.count(),
      prisma.enrollment.findMany({
        take: 10,
        orderBy: { enrolledAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true } },
          course: { select: { title: true } },
        },
      }),
      prisma.enrollment.groupBy({
        by: ['courseId'],
        _count: { courseId: true },
        orderBy: { _count: { courseId: 'desc' } },
        take: 5,
      }),
    ]);

    const courseDetails = await prisma.course.findMany({
      where: { id: { in: coursePopularity.map(c => c.courseId) } },
      select: { id: true, title: true },
    });

    const popularCourses = coursePopularity.map(cp => {
      const course = courseDetails.find(c => c.id === cp.courseId);
      return {
        courseId: cp.courseId,
        title: course?.title || 'Unknown',
        enrollments: cp._count.courseId,
      };
    });

    const aiUsageByDay = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const count = await prisma.aIInteraction.count({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      });
      
      aiUsageByDay.push({
        date: startOfDay.toISOString().split('T')[0],
        day: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
        interactions: count,
      });
    }

    res.json({
      overview: {
        totalUsers,
        totalStudents,
        totalCourses,
        totalEnrollments,
        totalLessons,
        completedLessons: totalProgress,
        totalAIInteractions,
      },
      recentEnrollments: recentEnrollments.map(e => ({
        studentName: `${e.user.firstName} ${e.user.lastName}`,
        courseName: e.course.title,
        enrolledAt: e.enrolledAt,
      })),
      popularCourses,
      aiUsageByDay,
    });
  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({ error: 'Server error fetching system analytics' });
  }
};
