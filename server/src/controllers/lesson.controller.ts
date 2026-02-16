// server\src\controllers\lesson.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

export const getLessonById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        Course: {
          select: {
            id: true,
            title: true,
          },
        },
        Resource: true,
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Get all published lessons of this course in correct order
    const courseLessons = await prisma.lesson.findMany({
      where: {
        courseId: lesson.courseId,
        isPublished: true,
      },
      orderBy: [
        { module: { order: 'asc' } }, // module order first
        { order: 'asc' },             // lesson order inside module
      ],
      select: {
        id: true,
        title: true,
        type: true,
        order: true,
        moduleId: true,
      },
    });


    // Check if user is enrolled in the course
    if (userId) {
      // Skip enrollment check for admins
      if (req.user?.role !== 'ADMIN') {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: { userId, courseId: lesson.courseId },
          },
        });

        if (!enrollment) {
          return res.status(403).json({ error: 'Not enrolled in this course' });
        }
      }

      // Get or create progress for this lesson
      let progress = await prisma.progress.findUnique({
        where: { userId_lessonId: { userId, lessonId: id } },
      });

      if (!progress) {
        progress = await prisma.progress.create({
          data: { userId, lessonId: id, updatedAt: new Date() },
        });
      }

      return res.json({ lesson, progress, courseLessons });
    } else {
      return res.json({ lesson });
    }
  } catch (error) {
    console.error('Get lesson error:', error);
    return res.status(500).json({ error: 'Server error fetching lesson' });
  }
};

export const updateProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.userId;
    const { completed, timeSpent, lastPosition, score } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify enrollment
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId,
        },
      },
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        completed: completed !== undefined ? completed : undefined,
        timeSpent: timeSpent !== undefined ? timeSpent : undefined,
        lastPosition: lastPosition !== undefined ? lastPosition : undefined,
        score: score !== undefined ? score : undefined,
        completedAt: completed ? new Date() : undefined,
        updatedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        completed: completed || false,
        timeSpent: timeSpent || 0,
        lastPosition,
        score,
        completedAt: completed ? new Date() : undefined,
        updatedAt: new Date(),
      },
    });

    // Update enrollment progress
    if (completed) {
      const totalLessons = await prisma.lesson.count({
        where: { courseId: lesson.courseId, isPublished: true },
      });

      const completedLessons = await prisma.progress.count({
        where: {
          userId,
          completed: true,
          Lesson: {
            courseId: lesson.courseId,
          },
        },
      });

      const progressPercentage = (completedLessons / totalLessons) * 100;

      await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId,
            courseId: lesson.courseId,
          },
        },
        data: {
          progress: progressPercentage,
          lastAccessedAt: new Date(),
          completedAt: progressPercentage === 100 ? new Date() : null,
        },
      });
    }

    return res.json({ progress });
  } catch (error) {
    console.error('Update progress error:', error);
    return res.status(500).json({ error: 'Server error updating progress' });
  }
};

export const getMyProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { courseId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const where: any = { userId };

    if (courseId) {
      where.Lesson = {
        courseId: courseId as string,
      };
    }

    const progressRecords = await prisma.progress.findMany({
      where,
      include: {
        Lesson: {
          select: {
            id: true,
            title: true,
            courseId: true,
            order: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return res.json({ progress: progressRecords });
  } catch (error) {
    console.error('Get progress error:', error);
    return res.status(500).json({ error: 'Server error fetching progress' });
  }
};
