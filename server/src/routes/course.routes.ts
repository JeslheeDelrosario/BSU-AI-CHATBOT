// server\src\routes\course.routes.ts
import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  enrollInCourse,
  getMyEnrollments,
  createCourse,
  updateCourse,
  deleteCourse
} from '../controllers/course.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getCourses);
router.get('/my-enrollments', authenticateToken, getMyEnrollments);
router.get('/:id', getCourseById);
router.post('/enroll', authenticateToken, enrollInCourse);



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

export default router;
