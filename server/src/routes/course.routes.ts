import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  enrollInCourse,
  getMyEnrollments,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseModules,
  createModule,
  deleteModule,
  updateModule,
  createLesson,
  assignLessonsToModules
} from '../controllers/course.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

// ========================================
// IMPORTANT ORDER: Specific routes first, then generic :id
// ========================================

// Public-ish routes (but require login for personalized data like isEnrolled/enrollment)
// Students/admins/teachers can see courses list & details
router.get('/', authenticateToken, getCourses);                    // ← ADDED authenticateToken
             // ← ADDED authenticateToken

// Enrollment routes (require login)
router.get('/my-enrollments', authenticateToken, getMyEnrollments);
router.post('/enroll', authenticateToken, enrollInCourse);
router.get('/:id', authenticateToken, getCourseById); 

// Admin/Teacher/Content Creator only routes
router.post(
  '/',
  authenticateToken,
  authorizeRoles('TEACHER', 'ADMIN', 'CONTENT_CREATOR'),
  createCourse
);

// Module routes
router.get('/:courseId/modules', authenticateToken, getCourseModules);  // Students can see modules
router.post('/:courseId/modules', authenticateToken, authorizeRoles('ADMIN'), createModule);
router.put('/modules/:id', authenticateToken, authorizeRoles('ADMIN'), updateModule);
router.delete('/modules/:id', authenticateToken, authorizeRoles('ADMIN'), deleteModule);
router.post('/assign-lessons-to-modules', authenticateToken, authorizeRoles('ADMIN'), assignLessonsToModules);

// Lesson routes (admin only)
router.post('/lessons', authenticateToken, authorizeRoles('ADMIN'), createLesson);

// Update & Delete course (admin only)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  updateCourse
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('ADMIN'),
  deleteCourse
);

export default router;