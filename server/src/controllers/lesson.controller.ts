import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getLessonById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        resources: true,
      },
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    // Check if user is enrolled in the course
    if (userId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: lesson.courseId,
          },
        },
      });

      if (!enrollment) {
        res.status(403).json({ error: 'Not enrolled in this course' });
        return;
      }

      // Get or create progress for this lesson
      let progress = await prisma.progress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId: id,
          },
        },
      });

      if (!progress) {
        progress = await prisma.progress.create({
          data: {
            userId,
            lessonId: id,
          },
        });
      }

      res.json({ lesson, progress });
    } else {
      res.json({ lesson });
    }
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ error: 'Server error fetching lesson' });
  }
};

export const updateProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.userId;
    const { completed, timeSpent, lastPosition, score } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify enrollment
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
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
      res.status(403).json({ error: 'Not enrolled in this course' });
      return;
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
      },
      create: {
        userId,
        lessonId,
        completed: completed || false,
        timeSpent: timeSpent || 0,
        lastPosition,
        score,
        completedAt: completed ? new Date() : undefined,
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
          lesson: {
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

    res.json({ progress });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Server error updating progress' });
  }
};

export const getMyProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { courseId } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const where: any = { userId };

    if (courseId) {
      where.lesson = {
        courseId: courseId as string,
      };
    }

    const progressRecords = await prisma.progress.findMany({
      where,
      include: {
        lesson: {
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

    res.json({ progress: progressRecords });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Server error fetching progress' });
  }
};
