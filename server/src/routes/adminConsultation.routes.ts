// server/src/routes/adminConsultation.routes.ts
// Admin routes for managing faculty consultation availability

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getAllFacultyForConsultation,
  updateFacultyConsultation,
  bulkUpdateConsultation,
  getConsultationStats,
} from '../controllers/adminConsultation.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all faculty with consultation info
router.get('/faculty', getAllFacultyForConsultation);

// Get consultation statistics
router.get('/stats', getConsultationStats);

// Update single faculty consultation settings
router.put('/faculty/:id', updateFacultyConsultation);

// Bulk update faculty consultation settings
router.post('/bulk-update', bulkUpdateConsultation);

export default router;
