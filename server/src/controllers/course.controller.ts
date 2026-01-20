import { Response } from 'express';
import { PrismaClient, CourseStatus, CourseLevel } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const { status, level, search } = req.query;

    const where: any = {};

    if (status) {
      where.status = status as CourseStatus;
    } else {
      where.status = CourseStatus.PUBLISHED; // Default to published only
    }

    if (level) {
      where.level = level as CourseLevel;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        User_Course_teacherIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            Lesson: true,
            Enrollment: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    return res.status(500).json({ error: 'Server error fetching courses' });
  }
};

export const getCourseById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        User_Course_teacherIdToUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        Lesson: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            duration: true,
            order: true,
          },
        },
        CourseReview: {
          include: {
            User: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is enrolled
    let enrollment = null;
    if (req.user?.userId) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: req.user.userId,
            courseId: id,
          },
        },
      });
    }

    return res.json({ course, enrollment });
  } catch (error) {
    console.error('Get course error:', error);
    return res.status(500).json({ error: 'Server error fetching course' });
  }
};

export const enrollInCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
      include: {
        Course: true,
      },
    });

    return res.status(201).json({ enrollment });
  } catch (error) {
    console.error('Enroll in course error:', error);
    return res.status(500).json({ error: 'Server error enrolling in course' });
  }
};

export const getMyEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        Course: {
          include: {
            User_Course_teacherIdToUser: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                Lesson: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });

    return res.json({ enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    return res.status(500).json({ error: 'Server error fetching enrollments' });
  }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || (userRole !== 'TEACHER' && userRole !== 'ADMIN' && userRole !== 'CONTENT_CREATOR')) {
      return res.status(403).json({ error: 'Only teachers, admins, and content creators can create courses' });
    }

    const { title, description, level, duration, price, tags } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        level,
        duration,
        price,
        tags: tags || [],
        creatorId: userId,
        teacherId: userRole === 'TEACHER' ? userId : undefined,
        updatedAt: new Date(),
      },
    });

    return res.status(201).json({ course });
  } catch (error) {
    console.error('Create course error:', error);
    return res.status(500).json({ error: 'Server error creating course' });
  }
};
