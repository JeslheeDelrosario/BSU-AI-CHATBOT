
// C:\Users\John Jeslhee\bulsu ai\BSU-AI-Tutor\server\src\routes\auth.routes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, getCurrentUser } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.post('/logout', authenticateToken, logout);

router.get('/me', authenticateToken, getCurrentUser);

export default router;
