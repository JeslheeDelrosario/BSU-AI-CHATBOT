// server\src\controllers\course.controller.ts
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
    } else if (req.user?.role?.toUpperCase() !== 'ADMIN') {
      where.status = CourseStatus.PUBLISHED; // non-admins see only published
    }
    
    //pansamantalang log for checking sa terminal
    if (process.env.NODE_ENV === 'development') {
      console.log(`getCourses: User ${req.user?.email || 'anonymous'} (role: ${req.user?.role || 'none'}) - showing ${status ? `status=${status}` : 'all statuses'}`);
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

    // CHANGED: Restrict to ADMIN only (extra safety even if middleware already checks)
    if (!userId || userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can create courses' });
    }

    // NEW: Accept status from request body
    const { title, description, level, duration, price, tags, status } = req.body;

    // NEW: Validate status if provided
    let finalStatus: CourseStatus = CourseStatus.DRAFT; // default
    if (status) {
      if (status !== CourseStatus.DRAFT && status !== CourseStatus.PUBLISHED) {
        return res.status(400).json({ error: 'Invalid status. Must be "DRAFT" or "PUBLISHED"' });
      }
      finalStatus = status;
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        level,
        duration,
        price,
        tags: tags || [],
        creatorId: userId,
        teacherId: undefined, // CHANGED: No auto-assign teacher since only ADMIN creates
        status: finalStatus,  // NEW: Use the provided or default status
        updatedAt: new Date(),
      },
    });

    return res.status(201).json({ course });
  } catch (error) {
    console.error('Create course error:', error);
    return res.status(500).json({ error: 'Server error creating course' });
  }
};

export const updateCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can update courses' });
    }

    const { title, description, level, duration, price, tags, status, teacherId } = req.body;

    // Validate status if sent
    if (status && status !== CourseStatus.DRAFT && status !== CourseStatus.PUBLISHED) {
      return res.status(400).json({ error: 'Invalid status. Must be "DRAFT" or "PUBLISHED"' });
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (level !== undefined) updateData.level = level;
    if (duration !== undefined) updateData.duration = duration;
    if (price !== undefined) updateData.price = price;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) updateData.status = status;

    // FIXED: Handle teacherId properly
    if (teacherId !== undefined) {
      if (teacherId === '' || teacherId === null) {
        // Allow clearing teacher assignment (set to null)
        updateData.teacherId = null;
      } else {
        // Validate that teacherId exists in User table
        const teacherExists = await prisma.user.findUnique({
          where: { id: teacherId },
          select: { id: true, role: true },
        });

        if (!teacherExists) {
          return res.status(400).json({ error: 'Invalid teacher ID - user not found' });
        }

        if (teacherExists.role !== 'TEACHER') {
          return res.status(400).json({ error: 'Assigned user must have TEACHER role' });
        }

        updateData.teacherId = teacherId;
      }
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
    });

    return res.json({ course: updatedCourse });
  } catch (error: any) {
    console.error('Update course error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Invalid teacher ID - foreign key constraint failed' });
    }
    return res.status(500).json({ error: 'Server error updating course' });
  }
};

export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can delete courses' });
    }

    const course = await prisma.course.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // RESTRICTION: Only allow delete if status is DRAFT
    if (course.status !== CourseStatus.DRAFT) {
      return res.status(400).json({ error: 'Cannot delete a published course. Set status to DRAFT first.' });
    }

    await prisma.course.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    console.error('Delete course error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Course not found' });
    }
    return res.status(500).json({ error: 'Server error deleting course' });
  }
};