import { Router, Response, NextFunction } from 'express';
import { AuthRequest, authenticateToken } from '../middleware/auth.middleware';
import {
  getAllStudents,
  getStudentById,
  updateStudent,
  toggleStudentStatus,
  resetStudentPassword,
  deleteStudent,
  getStudentStats,
  createStudent,
} from '../controllers/students.controller';

const router = Router();

const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied - Admin only' });
    return;
  }
  next();
};

router.use(authenticateToken);
router.use(isAdmin);

router.get('/', getAllStudents);
router.get('/stats', getStudentStats);
router.get('/:id', getStudentById);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.patch('/:id/toggle-status', toggleStudentStatus);
router.post('/:id/reset-password', resetStudentPassword);
router.delete('/:id', deleteStudent);

export default router;
