// server\src\routes\course.routes.ts
import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  enrollInCourse,
  getMyEnrollments,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  createLesson,
  deleteModule,
  deleteLesson,
  getQuizForLesson,
} from '../controllers/course.controller';
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
  updateCourse                      // Calls the new updateCourse function in controller
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  deleteCourse
);

router.post(
  '/:courseId/modules',
  authenticateToken,
  authorizeRoles('ADMIN'),
  createModule
);

router.post(
  '/:courseId/modules/:moduleId/lessons',
  authenticateToken,
  authorizeRoles('ADMIN'),
  createLesson
);

router.delete(
  '/modules/:moduleId',
  authenticateToken,
  authorizeRoles('ADMIN'),
  deleteModule
);

router.delete(
  '/lessons/:lessonId',
  authenticateToken,
  authorizeRoles('ADMIN'),
  deleteLesson
);

export default router;
