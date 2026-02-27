// server\src\routes\course.routes.ts
import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  getMyEnrollments,

  enrollInCourse,
  unenrollFromCourse,

  createCourse,
  updateCourse,
  deleteCourse,

  createModule,
  updateModule,
  deleteModule,
  
  createLesson,
  updateLesson,
  reorderLessonsInModule,
  deleteLesson,
  getQuizForLesson,
} from "../controllers/course.controller";
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getCourses);
router.get('/my-enrollments', authenticateToken, getMyEnrollments);
router.get('/:id', authenticateToken, getCourseById);
router.post('/enroll', authenticateToken, enrollInCourse);
router.get('/lessons/:lessonId/quiz', authenticateToken, getQuizForLesson);



router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN'),          // CHANGED: Only ADMIN can create courses now
  createCourse
);

// para sa updating or editing a course
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),          // Restrict to ADMIN
  updateCourse                      
);
// para sa deleting ng course
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  deleteCourse
);
// Create module within a course
router.post(
  '/:courseId/modules',
  authenticateToken,
  authorizeRoles('ADMIN'),
  createModule
);
// Create lesson within a module
router.post(
  '/:courseId/modules/:moduleId/lessons',
  authenticateToken,
  authorizeRoles('ADMIN'),
  createLesson
);
// Delete module
router.delete(
  '/modules/:moduleId',
  authenticateToken,
  authorizeRoles('ADMIN'),
  deleteModule
);
// Delete lesson
router.delete(
  '/lessons/:lessonId',
  authenticateToken,
  authorizeRoles('ADMIN'),
  deleteLesson
);

// Update module
router.put(
  '/modules/:moduleId',
  authenticateToken,
  authorizeRoles('ADMIN'),
  updateModule
);

// Update lesson
router.put(
  '/lessons/:lessonId',
  authenticateToken,
  authorizeRoles('ADMIN'),
  updateLesson
);
// Reorder lessons within a module
router.patch(
  "/modules/:moduleId/lessons/reorder",
  authenticateToken,
  authorizeRoles("ADMIN"),
  reorderLessonsInModule, 
);

// Unenroll from course
router.delete(
  "/unenroll/:courseId", // or POST /unenroll if you prefer
  authenticateToken,
  unenrollFromCourse,
);

export default router;
