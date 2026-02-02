// server\src\routes\lesson.routes.ts
import { Router } from 'express';
import {
  getLessonById,
  updateProgress,
  getMyProgress,
} from '../controllers/lesson.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/:id', authenticateToken, getLessonById);
router.post('/:lessonId/progress', authenticateToken, updateProgress);
router.get('/progress/my', authenticateToken, getMyProgress);

export default router;
