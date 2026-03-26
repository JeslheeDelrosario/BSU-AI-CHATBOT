// server/src/routes/faculty.routes.ts
import { Router } from 'express';
import {
  linkFacultyToUser,
  autoLinkFacultyByEmail,
  getFacultyLinkStatus,
  unlinkFacultyFromUser
} from '../controllers/faculty.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Admin: Link faculty to user
router.post('/link-to-user', linkFacultyToUser);

// Admin: Auto-link faculty by email
router.post('/auto-link-by-email', autoLinkFacultyByEmail);

// Admin: Get faculty link status
router.get('/link-status', getFacultyLinkStatus);

// Admin: Unlink faculty from user
router.post('/unlink-from-user', unlinkFacultyFromUser);

export default router;
