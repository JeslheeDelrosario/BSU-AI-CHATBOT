// server/src/routes/roomSchedule.routes.ts
// Public routes for viewing room schedules

import { Router } from 'express';
import {
  getPublicRoomSchedules,
  getPublicBuildingsList,
  getPublicRoomTypes,
} from '../controllers/adminRoom.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication but not admin role
router.use(authenticateToken);

router.get('/schedules', getPublicRoomSchedules);
router.get('/buildings', getPublicBuildingsList);
router.get('/types', getPublicRoomTypes);

export default router;
