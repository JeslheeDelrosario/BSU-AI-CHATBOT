// server\src\controllers\course.controller.ts
import { Response } from 'express';
import { PrismaClient, CourseStatus, CourseLevel } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  // DEBUG LOGS - added here so we see them when loading /courses page
  console.log('[getCourses] Request received for courses list');
  console.log('[getCourses] Authenticated user:', req.user 
    ? { 
        userId: req.user.userId, 
        role: req.user.role, 
        email: req.user.email || 'no-email' 
      } 
    : 'NO USER - Not authenticated');

  try {
    const { status, level, search } = req.query;

    const where: any = {};

    if (status) {
      where.status = status as CourseStatus;
    } else {
      where.status = CourseStatus.PUBLISHED;
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

    // Fetch all matching courses (same as before)
    const courses = await prisma.course.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // ─────────────────────────────────────────────────────────────
    // NEW: Add isEnrolled field for logged-in users
    // This makes the badge possible in the courses list page
    // ─────────────────────────────────────────────────────────────
    let finalCourses = courses; // default = original courses

    if (req.user?.userId) {
      const userId = req.user.userId;

      // Get all course IDs this user is enrolled in (very efficient - one query)
      const enrolled = await prisma.enrollment.findMany({
        where: { userId },
        select: { courseId: true }, // we only need the IDs
      });

      // Convert to Set for fast lookup
      const enrolledIds = new Set(enrolled.map(e => e.courseId));

      // Add isEnrolled to every course
      finalCourses = courses.map(course => ({
        ...course,
        isEnrolled: enrolledIds.has(course.id), // true if user enrolled, false otherwise
      }));
    }

    // Send back the enriched list
    res.json({ courses: finalCourses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Server error fetching courses' });
  }
};
export const getCourseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Optional debug - keep if you want to see in terminal
    // console.log('[getCourseById] Loading course:', id, 'User:', req.user?.userId || 'none');

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        lessons: {
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
        reviews: {
          include: {
            user: {
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
      res.status(404).json({ error: 'Course not found' });
      return;
    }

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

    // Always return enrollment status (null or object)
    res.json({ course, enrollment });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Server error fetching course' });
  }
};

// UPDATED: Enroll in course - returns 200 if already enrolled
export const enrollInCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
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

    // If already enrolled → return 200 with message (frontend will handle UI update)
    if (existingEnrollment) {
      res.status(200).json({ 
        message: 'Already enrolled', 
        enrollment: existingEnrollment 
      });
      return;
    }

    // Create new enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
      },
      include: {
        course: true,
      },
    });

    res.status(201).json({ enrollment });
  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({ error: 'Server error enrolling in course' });
  }
};

export const getMyEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                lessons: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });

    res.json({ enrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Server error fetching enrollments' });
  }
};

export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || (userRole !== 'TEACHER' && userRole !== 'ADMIN' && userRole !== 'CONTENT_CREATOR')) {
      res.status(403).json({ error: 'Only teachers, admins, and content creators can create courses' });
      return;
    }

    const { title, description, level, duration, price, tags } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        level: level as CourseLevel,
        duration,
        price: price || 0,
        tags: tags || [],
        status: CourseStatus.PUBLISHED, // Default to published so it appears immediately
        creatorId: userId,
        teacherId: userRole === 'TEACHER' ? userId : undefined,
      },
    });

    res.status(201).json({ course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Server error creating course' });
  }
};

/**
 * NEW: Update an existing course
 * Only ADMIN can update any course
 * Allowed fields: title, description, duration, level, tags
 */
export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Only administrators can update courses' });
      return;
    }

    const { title, description, duration, level, tags } = req.body;

    // Optional: Add validation for required fields if needed
    if (!title || !description) {
      res.status(400).json({ error: 'Title and description are required' });
      return;
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        title,
        description,
        duration: duration !== undefined ? Number(duration) : undefined,
        level: level ? (level as CourseLevel) : undefined,
        tags: tags !== undefined ? tags : undefined,
        updatedAt: new Date(),
      },
    });

    res.json({ course: updatedCourse });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Server error updating course' });
  }
};

/**
 * NEW: Delete (soft delete) a course
 * Only ADMIN can delete
 * Sets status = ARCHIVED (soft delete)
 * Hard delete can be added later if needed
 */
export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Only administrators can delete courses' });
      return;
    }

    // Soft delete: update status to ARCHIVED
    await prisma.course.update({
      where: { id },
      data: {
        status: CourseStatus.ARCHIVED,
        updatedAt: new Date(),
      },
    });

    // Alternative: Hard delete (uncomment if you prefer)
    // await prisma.course.delete({ where: { id } });

    res.json({ message: 'Course deleted successfully (archived)' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Server error deleting course' });
  }
};

// NEW: Get all modules for a specific course
export const getCourseModules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;

    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            duration: true,
            order: true,
            isPublished: true,
          },
          orderBy: { order: 'asc' },
        }
      }
    });


    res.json({ modules });
  } catch (error) {
    console.error('Get course modules error:', error);
    res.status(500).json({ error: 'Server error fetching modules' });
  }
};

// NEW: Create a new module for a course (admin only)
export const createModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userRole = req.user?.role;

    if (userRole !== 'ADMIN') { // only ADMIN for now
      res.status(403).json({ error: 'Only administrators can create modules' });
      return;
    }

    const { title, description, order, estTimeMin, difficulty } = req.body;

    if (!title || !order) {
      res.status(400).json({ error: 'Title and order are required' });
      return;
    }

    const existingCourse = await prisma.course.findUnique({ where: { id: courseId } });
    if (!existingCourse) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    const module = await prisma.module.create({
      data: {
        title,
        description: description || null,
        order: Number(order),
        estTimeMin: estTimeMin ? Number(estTimeMin) : null,
        difficulty: difficulty || null,
        courseId,
      },
    });

    res.status(201).json({ module });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Server error creating module' });
  }
};

// NEW: Delete a module (admin only, soft delete or hard - here hard delete)
export const deleteModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Only administrators can delete modules' });
      return;
    }

    const module = await prisma.module.findUnique({ where: { id } });
    if (!module) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    await prisma.module.delete({ where: { id } });

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ error: 'Server error deleting module' });
  }
};


// NEW: Update a module (admin only)
export const updateModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Only administrators can update modules' });
      return;
    }

    const { title, description, order, estTimeMin, difficulty } = req.body;

    if (!title || !order) {
      res.status(400).json({ error: 'Title and order are required' });
      return;
    }

    const updatedModule = await prisma.module.update({
      where: { id },
      data: {
        title,
        description: description || null,
        order: Number(order),
        estTimeMin: estTimeMin ? Number(estTimeMin) : null,
        difficulty: difficulty || null,
        updatedAt: new Date(),
      },
    });

    res.json({ module: updatedModule });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ error: 'Server error updating module' });
  }
};

// NEW: Create a new lesson (admin only, can be attached to a module)
export const createLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Only administrators can create lessons' });
      return;
    }

    const { title, type, content, moduleId, courseId, order, isPublished } = req.body;

    // FIXED: Missing return statement
    if (!title || !type || !courseId) {
      res.status(400).json({ error: 'Title, type, and courseId are required' });
      return; // <-- THIS WAS MISSING
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        type,
        content: content || '',
        moduleId: moduleId || null,
        courseId,
        order: order ? Number(order) : 0,
        isPublished: isPublished ?? true,
      },
    });

    res.status(201).json({ lesson });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Server error creating lesson' });
  }
};


export const assignLessonsToModules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;

    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Only admins can run this' });
      return;
    }

    // 1. Get all courses
    const courses = await prisma.course.findMany({
      include: { modules: true }
    });

    let updatedCount = 0;

    for (const course of courses) {
      if (course.modules.length === 0) continue; // skip courses with no modules

      const firstModuleId = course.modules
        .sort((a, b) => a.order - b.order)[0].id; // first module

      // 2. Find unassigned lessons for this course
      const unassignedLessons = await prisma.lesson.findMany({
        where: { courseId: course.id, moduleId: null }
      });

      // 3. Assign each unassigned lesson to the first module
      for (const lesson of unassignedLessons) {
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { moduleId: firstModuleId }
        });
        updatedCount++;
      }
    }

    res.json({ message: `Assigned ${updatedCount} lessons to their first modules` });
  } catch (error) {
    console.error('Assign lessons error:', error);
    res.status(500).json({ error: 'Server error assigning lessons' });
  }
};
