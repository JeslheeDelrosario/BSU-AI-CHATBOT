import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (userRole === 'STUDENT') {
      // Student dashboard
      const [
        enrollmentCount,
        completedCourses,
        totalProgress,
        recentProgress,
        achievements,
        upcomingLessons,
      ] = await Promise.all([
        prisma.enrollment.count({ where: { userId } }),
        prisma.enrollment.count({ where: { userId, status: 'COMPLETED' } }),
        prisma.progress.aggregate({
          where: { userId },
          _avg: { score: true },
          _sum: { timeSpent: true },
        }),
        prisma.progress.findMany({
          where: { userId },
          include: {
            Lesson: {
              select: {
                title: true,
                courseId: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }),
        prisma.achievement.findMany({
          where: { userId },
          orderBy: { earnedAt: 'desc' },
          take: 5,
        }),
        prisma.progress.findMany({
          where: {
            userId,
            completed: false,
          },
          include: {
            Lesson: {
              select: {
                title: true,
                duration: true,
                courseId: true,
              },
            },
          },
          take: 3,
        }),
      ]);

      return res.json({
        overview: {
          enrolledCourses: enrollmentCount,
          completedCourses,
          averageScore: totalProgress._avg.score || 0,
          totalTimeSpent: totalProgress._sum.timeSpent || 0,
        },
        recentProgress,
        achievements,
        upcomingLessons,
      });
    } else if (userRole === 'TEACHER' || userRole === 'ADMIN') {
      // Teacher/Admin dashboard
      const [
        totalStudents,
        totalCourses,
        totalEnrollments,
        recentEnrollments,
        courseStats,
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.course.count({ where: userRole === 'TEACHER' ? { teacherId: userId } : {} }),
        prisma.enrollment.count(),
        prisma.enrollment.findMany({
          include: {
            User: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            Course: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { enrolledAt: 'desc' },
          take: 10,
        }),
        prisma.course.findMany({
          where: userRole === 'TEACHER' ? { teacherId: userId } : {},
          include: {
            _count: {
              select: {
                Enrollment: true,
                Lesson: true,
              },
            },
          },
          take: 5,
        }),
      ]);

      return res.json({
        overview: {
          totalStudents,
          totalCourses,
          totalEnrollments,
        },
        recentEnrollments,
        courseStats,
      });
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({ error: 'Server error fetching dashboard stats' });
  }
};
