import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  enrollInCourse,
  getMyEnrollments,
  createCourse,
} from '../controllers/course.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getCourses);
router.get('/my-enrollments', authenticateToken, getMyEnrollments);
router.get('/:id', getCourseById);
router.post('/enroll', authenticateToken, enrollInCourse);
router.post(
  '/',
  authenticateToken,
  authorizeRoles('TEACHER', 'ADMIN', 'CONTENT_CREATOR'),
  createCourse
);

export default router;
