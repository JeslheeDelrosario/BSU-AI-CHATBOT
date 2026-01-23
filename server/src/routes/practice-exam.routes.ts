// Practice Exam Routes - Production Ready
import { Router } from 'express';
import {
  createPracticeExam,
  submitPracticeExam,
  getUserPracticeExams,
  getPracticeExamById,
  deletePracticeExam
} from '../controllers/practice-exam.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create new practice exam
router.post('/', createPracticeExam);

// Get user's practice exams (with optional status filter)
router.get('/', getUserPracticeExams);

// Get specific practice exam by ID
router.get('/:examId', getPracticeExamById);

// Submit practice exam answers
router.post('/:examId/submit', submitPracticeExam);

// Delete practice exam
router.delete('/:examId', deletePracticeExam);

export default router;
