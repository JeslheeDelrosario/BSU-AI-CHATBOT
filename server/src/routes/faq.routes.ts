import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth.middleware';
import {
  getAllFAQs,
  getFAQById,
  getFAQCategories,
  voteFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getAdminFAQs,
  getFAQAnalytics,
} from '../controllers/faq.controller';

const router = Router();

const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied - Admin only' });
    return;
  }
  next();
};

router.get('/public', getAllFAQs);
router.get('/public/categories', getFAQCategories);
router.get('/public/:id', getFAQById);
router.post('/public/:id/vote', voteFAQ);

router.use(authenticateToken);
router.use(isAdmin);

router.get('/admin', getAdminFAQs);
router.get('/admin/analytics', getFAQAnalytics);
router.post('/admin', createFAQ);
router.put('/admin/:id', updateFAQ);
router.delete('/admin/:id', deleteFAQ);

export default router;
