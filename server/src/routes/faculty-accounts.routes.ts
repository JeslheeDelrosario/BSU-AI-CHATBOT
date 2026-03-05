// server/src/routes/faculty-accounts.routes.ts
// Admin-only faculty account management routes
import { Router, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createFacultyAccount,
  linkFacultyAccount,
  listFacultyAccounts,
  toggleFacultyAccountStatus,
  getFacultyUsageStats,
  unlinkFacultyAccount,
} from '../controllers/faculty-accounts.controller';

const router = Router();

// Middleware: only ADMIN can access
const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied - Admin only' });
    return;
  }
  return next();
};

// All routes require admin
router.use(isAdmin);

// GET /api/admin/faculty-accounts - List all faculty accounts + unlinked records
router.get('/', listFacultyAccounts);

// GET /api/admin/faculty-accounts/usage - Faculty usage statistics (before /:id routes)
router.get('/usage', getFacultyUsageStats);

// POST /api/admin/faculty-accounts - Create a new faculty user account
router.post('/', createFacultyAccount);

// POST /api/admin/faculty-accounts/link - Link existing user to faculty record
router.post('/link', linkFacultyAccount);

// PUT /api/admin/faculty-accounts/:id/status - Activate/deactivate
router.put('/:id/status', toggleFacultyAccountStatus);

// DELETE /api/admin/faculty-accounts/:id/unlink - Unlink faculty record from user
router.delete('/:id/unlink', unlinkFacultyAccount);

export default router;
