import { Router } from 'express';
import {
  askAITutor,
  getAIHistory,
  rateAIResponse,
} from '../controllers/ai-tutor.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/ask', authenticateToken, askAITutor);
router.get('/history', authenticateToken, getAIHistory);
router.post('/:id/rate', authenticateToken, rateAIResponse);

export default router;