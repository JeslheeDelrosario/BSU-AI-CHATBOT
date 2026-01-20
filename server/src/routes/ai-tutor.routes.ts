import { Router } from 'express';
import {
  askAITutor,
  getAIHistory,
  rateAIResponse,
  generateQuiz,
  getChatSuggestions,
  getGreeting,
} from '../controllers/ai-tutor.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/ask', authenticateToken, askAITutor);
router.get('/history', authenticateToken, getAIHistory);
router.post('/:id/rate', authenticateToken, rateAIResponse);
router.post('/generate-quiz', authenticateToken, generateQuiz);
router.get('/suggestions', authenticateToken, getChatSuggestions);
router.get('/greeting', authenticateToken, getGreeting);

export default router;