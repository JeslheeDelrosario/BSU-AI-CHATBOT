import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth.middleware';
import {
  getUserProgress,
  getProgressAnalytics,
  getAIInteractionHistory,
  getSystemAnalytics,
} from '../controllers/progress.controller';

const router = Router();

const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied - Admin only' });
    return;
  }
  next();
};

router.use(authenticateToken);

router.get('/me', getUserProgress);
router.get('/me/analytics', getProgressAnalytics);
router.get('/me/ai-history', getAIInteractionHistory);

router.get('/system', isAdmin, getSystemAnalytics);
router.get('/user/:userId', isAdmin, getUserProgress);
router.get('/user/:userId/analytics', isAdmin, getProgressAnalytics);
router.get('/user/:userId/ai-history', isAdmin, getAIInteractionHistory);

export default router;
