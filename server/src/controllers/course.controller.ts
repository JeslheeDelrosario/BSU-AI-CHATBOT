// server\src\controllers\course.controller.ts
import { Response } from 'express';
import { CourseStatus, CourseLevel, LessonType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

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
    const userId = req.user?.userId;

    // Fetch course with modules and nested lessons (published only, ordered)
    const courseData = await prisma.course.findUnique({
      where: { id },
      include: {
        User_Course_teacherIdToUser: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                duration: true,
                order: true,
                content: true,
                videoUrl: true,
                audioUrl: true,
                isPublished: true,
              },
            },
          },
        },
        CourseReview: {
          include: {
            User: { select: { firstName: true, lastName: true, avatar: true } },
          },
        },
        _count: {
          select: {
            Enrollment: true,   // number of learners (enrollments)
            Lesson: true,       // total lessons in the course
          },
        },
      },
    });

    if (!courseData) {
      return res.status(404).json({ error: 'Course not found' });
    }

    let enrollment = null;
    let progressMap: Record<string, { completed: boolean; score: number | null }> = {};

    if (userId) {
      // Lookup enrollment for the current user
      enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: id } },
      });

      // Get progress for all lessons in this course
      const progressRecords = await prisma.progress.findMany({
        where: {
          userId,
          Lesson: { courseId: id },
        },
        select: { lessonId: true, completed: true, score: true },
      });

      progressMap = progressRecords.reduce((acc, p) => {
        acc[p.lessonId] = { completed: p.completed, score: p.score };
        return acc;
      }, {} as Record<string, { completed: boolean; score: number | null }>);
    }

    // ────────────────────────────────────────────────────────────────
    // HELPER: Check if a lesson is "satisfactorily completed"
    // ────────────────────────────────────────────────────────────────
    const isSatisfactorilyCompleted = (lessonId: string): boolean => {
      const prog = progressMap[lessonId];
      if (!prog || !prog.completed) return false;

      const lesson = courseData.modules
        .flatMap(m => m.lessons)
        .find(l => l.id === lessonId);

      if (!lesson) return false;

      if (lesson.type === 'QUIZ') {
        return (prog.score ?? 0) >= 85;
      }
      return true; // non-quiz → just completed === true
    };

    // ────────────────────────────────────────────────────────────────
    // MAIN ENRICHMENT LOGIC – now with module-to-module dependency
    // ────────────────────────────────────────────────────────────────
    const enrichedModules = courseData.modules.map((module, moduleIdx) => {
      const enrichedLessons = module.lessons.map((lesson, lessonIdx) => {
        const progress = progressMap[lesson.id] || null;

        let isUnlocked = false;

        // ── Rule 1: First module ─────────────────────────────────────
        if (moduleIdx === 0) {
          // Inside first module: classic sequential unlocking
          isUnlocked = lessonIdx === 0 || isSatisfactorilyCompleted(module.lessons[lessonIdx - 1].id);
        }
        // ── Rule 2: Subsequent modules ───────────────────────────────
        else {
          // Get the LAST lesson of the PREVIOUS module
          const prevModule = courseData.modules[moduleIdx - 1];
          if (prevModule && prevModule.lessons.length > 0) {
            const lastLessonOfPrev = prevModule.lessons[prevModule.lessons.length - 1];
            const prevModulePassed = isSatisfactorilyCompleted(lastLessonOfPrev.id);

            // If previous module's last lesson is passed → this whole module is open
            // Then apply intra-module sequential rule
            if (prevModulePassed) {
              isUnlocked =
                lessonIdx === 0 ||
                isSatisfactorilyCompleted(module.lessons[lessonIdx - 1].id);
            }
            // else → entire module stays locked (isUnlocked = false for all lessons)
          }
        }

        return {
          ...lesson,
          completed: progress?.completed ?? false,
          score: progress?.score ?? null,
          isUnlocked,
        };
      });

      return { ...module, lessons: enrichedLessons };
    });

    return res.json({
      course: {
        ...courseData,
        modules: enrichedModules,
      },
      enrollment,
    });
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

    // 1. Get all enrollments + course basic data
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
                Lesson: true,           // total lessons in the course
              },
            },
          },
        },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });

    // 2. Bulk fetch progress + necessary lesson fields for strict completion check
    const courseIds = enrollments.map((e) => e.courseId);

    const progressRecords = await prisma.progress.findMany({
      where: {
        userId,
        Lesson: {
          courseId: { in: courseIds },
        },
      },
      select: {
        lessonId: true,
        completed: true,
        score: true,                  // needed for quiz strict check
        Lesson: {
          select: {
            courseId: true,
            type: true,               // needed to know if it's QUIZ
          },
        },
      },
    });

    // 3. Count "satisfactorily completed" lessons per course
    //    → same rule as in getCourseById / LessonViewer
    const completedByCourse = progressRecords.reduce((acc, record) => {
      const isSatisfactorilyCompleted =
        record.completed &&
        (record.Lesson.type !== 'QUIZ' || (record.score ?? 0) >= 85);

      if (isSatisfactorilyCompleted) {
        const courseId = record.Lesson.courseId;
        acc[courseId] = (acc[courseId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // 4. Enrich each enrollment
    const enrichedEnrollments = enrollments.map((enrollment) => {
      const courseId = enrollment.courseId;
      const totalLessons = enrollment.Course._count.Lesson || 0;
      const completedLessons = completedByCourse[courseId] || 0;

      const progressPercentage =
        totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...enrollment,
        completedLessonsCount: completedLessons,
        totalLessonsCount: totalLessons,
        progress: progressPercentage,           // now consistent with unlocking logic
      };
    });

    return res.json({ enrollments: enrichedEnrollments });
  } catch (error) {
    console.error('Get my enrollments error:', error);
    return res.status(500).json({ error: 'Server error fetching your courses' });
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

export const createModule = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Auto-calculate next order
    const maxOrder = await prisma.module.aggregate({
      where: { courseId },
      _max: { order: true },
    });

    const nextOrder = (maxOrder._max.order || 0) + 1;

    const module = await prisma.module.create({
      data: {
        title,
        description: description || null,
        order: nextOrder,
        courseId,
      },
    });

    return res.status(201).json({ module });
  } catch (error) {
    console.error('Create module error:', error);
    return res.status(500).json({ error: 'Failed to create module' });
  }
};

// server/src/controllers/course.controller.ts
// ─────────────────────────────────────────────────────────────
// Updated createLesson – QUIZ questions now stored in content (JSON)
// ─────────────────────────────────────────────────────────────
export const createLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { moduleId } = req.params;
    const {
      title,
      description,
      type,
      duration,
      content,
      videoUrl,
      audioUrl,
      isPublished = false,
      questions, // only used when type = QUIZ
    } = req.body;

    // Basic validation
    if (!title?.trim() || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    const validTypes: LessonType[] = ['VIDEO', 'TEXT', 'AUDIO', 'INTERACTIVE', 'QUIZ', 'ASSIGNMENT'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid lesson type' });
    }

    // For QUIZ: validate and prepare questions as JSON
    let finalContent = typeof content === 'string' ? content.trim() : '';

    if (type === 'QUIZ') {
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: 'Quiz lessons require at least one question' });
      }

      // Basic structure validation
      for (const q of questions) {
        if (!q.text?.trim()) throw new Error('Question text is required');
        if (!Array.isArray(q.answers) || q.answers.length < 2) {
          throw new Error('Each question needs at least 2 answers');
        }
        const correctCount = q.answers.filter((a: any) => a.isCorrect).length;
        if (correctCount !== 1) {
          throw new Error('Each question must have exactly one correct answer');
        }
      }

      // Store questions as JSON string in content
      finalContent = JSON.stringify({
        instructions: content?.trim() || 'Answer the following questions.',
        questions: questions.map((q: any) => ({
          text: q.text.trim(),
          explanation: q.explanation?.trim() || null,
          answers: q.answers.map((a: any) => ({
            text: a.text.trim(),
            isCorrect: !!a.isCorrect,
          })),
        })),
      });
    }

    // Auto-calculate next order in this module
    const maxOrder = await prisma.lesson.aggregate({
      where: { moduleId },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order || 0) + 1;

    // Get courseId from module
    const moduleData = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true },
    });

    if (!moduleData) {
      return res.status(404).json({ error: 'Module not found' });
    }

    // Create the lesson
    const lesson = await prisma.lesson.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        type: type as LessonType,
        duration: duration ? Number(duration) : null,
        content: finalContent,           // ← now contains JSON for quizzes
        videoUrl: videoUrl?.trim() || null,
        audioUrl: audioUrl?.trim() || null,
        order: nextOrder,
        isPublished: !!isPublished,
        moduleId,
        courseId: moduleData.courseId,
      },
    });

    return res.status(201).json({ lesson });
  } catch (error: any) {
    console.error('Create lesson error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create lesson',
    });
  }
};

// export const deleteModule = async (req: AuthRequest, res: Response) => {
//   try {
//     const { moduleId } = req.params;

//     // Check if module exists
//     const module = await prisma.module.findUnique({
//       where: { id: moduleId },
//       include: {
//         lessons: { select: { id: true } }, // only count, no need full data
//         quiz: { select: { id: true } },
//       },
//     });

//     if (!module) {
//       return res.status(404).json({ error: 'Module not found' });
//     }

//     // Prevent delete if has content
//     if (module.lessons.length > 0) {
//       return res.status(400).json({
//         error: `Cannot delete module: it contains ${module.lessons.length} lesson(s). Please delete or move the lessons first.`
//       });
//     }

//     if (module.quiz) {
//       return res.status(400).json({
//         error: 'Cannot delete module: it has an attached quiz. Delete the quiz first or remove the association.'
//       });
//     }

//     // Safe to delete
//     await prisma.module.delete({ where: { id: moduleId } });

//     return res.json({ message: 'Module deleted successfully' });
//   } catch (error: any) {
//     console.error('Delete module error:', error);
//     return res.status(500).json({ error: 'Failed to delete module: ' + (error.message || 'unknown error') });
//   }
// };

export const deleteModule = async (req: AuthRequest, res: Response) => {
  try {
    const { moduleId } = req.params;

    // 1. Find the module and load related data
    const moduleData = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        lessons: { select: { id: true } },
        quiz: { select: { id: true } },
      },
    });

    if (!moduleData) {
      return res.status(404).json({ error: 'Module not found' });
    }

    console.warn(`[FORCE DELETE] Deleting module ${moduleId} and all related data`);

    // 2. If there is a quiz → delete questions → answers → quiz
    if (moduleData.quiz) {
      console.log(`Deleting quiz ${moduleData.quiz.id} and its questions/answers...`);

      // Delete all answers for questions in this quiz
      await prisma.answer.deleteMany({
        where: {
          question: {
            quizId: moduleData.quiz.id,
          },
        },
      });

      // Delete all questions
      await prisma.question.deleteMany({
        where: { quizId: moduleData.quiz.id },
      });

      // Delete the quiz itself
      await prisma.quiz.delete({
        where: { id: moduleData.quiz.id },
      });
    }

    // 3. Delete all lessons in this module
    if (moduleData.lessons.length > 0) {
      console.log(`Deleting ${moduleData.lessons.length} lessons...`);

      // Delete progress records for these lessons
      await prisma.progress.deleteMany({
        where: {
          lessonId: {
            in: moduleData.lessons.map(l => l.id),
          },
        },
      });

      // Delete the lessons
      await prisma.lesson.deleteMany({
        where: { moduleId },
      });
    }

    // 4. Delete user module progress (if any)
    await prisma.userModuleProgress.deleteMany({
      where: { moduleId },
    });

    // 5. Finally delete the module itself
    await prisma.module.delete({
      where: { id: moduleId },
    });

    console.log(`Module ${moduleId} and all related data deleted successfully`);

    return res.json({ message: 'Module and all related content deleted (force mode)' });
  } catch (error: any) {
    console.error('Force delete module error:', error);
    return res.status(500).json({
      error: 'Failed to force delete module: ' + (error.message || 'unknown error'),
    });
  }
};
export const deleteLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    await prisma.lesson.delete({ where: { id: lessonId } });

    return res.json({ message: 'Lesson deleted' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    return res.status(500).json({ error: 'Failed to delete lesson' });
  }
};

export const createQuizWithQuestions = async (
  lessonId: string,
  questions: Array<{
    text: string;
    answers: Array<{ text: string; isCorrect: boolean }>;
  }>
) => {
  if (questions.length === 0) {
    throw new Error('At least one question is required for a quiz');
  }

  // Get the lesson → we need its moduleId
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { moduleId: true },
  });

  if (!lesson?.moduleId) {
    throw new Error('Lesson has no associated module → cannot create quiz');
  }

  // Create Quiz attached to MODULE (schema confirms moduleId is required)
  const quiz = await prisma.quiz.create({
    data: {
      moduleId: lesson.moduleId,     // ← this is correct per your schema
      // You can add more fields later, e.g.:
      // passingScore: 75,
    },
  });

  // Create questions + answers
  for (const q of questions) {
    const correctCount = q.answers.filter(
      // ── Added explicit type to fix TS7006 ────────────────────────
      (a: { text: string; isCorrect: boolean }) => a.isCorrect
    ).length;

    if (correctCount !== 1) {
      throw new Error('Each question must have exactly one correct answer');
    }

    const question = await prisma.question.create({
      data: {
        quizId: quiz.id,
        text: q.text,
        type: 'MULTIPLE_CHOICE',
      },
    });

    await prisma.answer.createMany({
      data: q.answers.map((a: { text: string; isCorrect: boolean }) => ({
        questionId: question.id,
        text: a.text,
        isCorrect: a.isCorrect,
      })),
    });
  }

  return quiz;
};

// Fetch quiz questions for a lesson by going through its module (hide correct answers!)
export const getQuizForLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Include module + quiz + questions + answers (only id & text)
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            quiz: {
              include: {
                questions: {
                  include: {
                    answers: {
                      select: {
                        id: true,
                        text: true,      // NEVER send isCorrect to client!
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    if (lesson.type !== 'QUIZ') {
      return res.status(400).json({ error: 'This lesson is not a quiz type' });
    }

    const quiz = lesson.module?.quiz;

    if (!quiz) {
      return res.status(404).json({ error: 'No quiz attached to this lesson\'s module' });
    }

    // Safe client response – hide correct answers & any internal fields
    const safeQuestions = quiz.questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.answers.map((a) => ({
        id: a.id,
        text: a.text,
      })),
    }));

    return res.json({
      questions: safeQuestions,
      totalQuestions: safeQuestions.length,
      // Optional: passingScore: quiz.passingScore  (if you want frontend to know)
    });
  } catch (error) {
    console.error('Get quiz for lesson error:', error);
    return res.status(500).json({ error: 'Failed to fetch quiz questions' });
  }
};

// Update Module (title, description, optional order)
export const updateModule = async (req: AuthRequest, res: Response) => {
  try {
    const { moduleId } = req.params;
    const { title, description, order } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Module title is required' });
    }

    const updated = await prisma.module.update({
      where: { id: moduleId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        order: order !== undefined ? Number(order) : undefined,
        updatedAt: new Date(),
      },
    });

    return res.json({ module: updated });
  } catch (error: any) {
    console.error('Update module error:', error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Module not found' });
    return res.status(500).json({ error: 'Failed to update module' });
  }
};

// Update Lesson (basic fields – quiz questions handled separately later)
export const updateLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const {
      title,
      description,
      type,
      duration,
      content,
      videoUrl,
      audioUrl,
      isPublished,
    } = req.body;

    if (!title?.trim() || !type) {
      return res.status(400).json({ error: 'Title and type are required' });
    }

    const validTypes = ['VIDEO', 'TEXT', 'AUDIO', 'INTERACTIVE', 'QUIZ', 'ASSIGNMENT'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid lesson type' });
    }

    const updated = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        type: type as LessonType,
        duration: duration ? Number(duration) : null,
        content: content ?? '',
        videoUrl: videoUrl?.trim() || null,
        audioUrl: audioUrl?.trim() || null,
        isPublished: isPublished ?? false,
        updatedAt: new Date(),
      },
    });

    return res.json({ lesson: updated });
  } catch (error: any) {
    console.error('Update lesson error:', error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Lesson not found' });
    return res.status(500).json({ error: 'Failed to update lesson' });
  }
};