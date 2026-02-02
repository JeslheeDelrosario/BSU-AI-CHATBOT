import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as calendarController from '../controllers/calendar.controller';

const router = Router();

router.use(authenticateToken);

router.get('/preferences', calendarController.getCalendarPreference);
router.put('/preferences', calendarController.updateCalendarPreference);
router.get('/visibilities', calendarController.getCalendarVisibilities);
router.post('/visibilities/toggle', calendarController.toggleCalendarVisibility);
router.post('/visibilities/bulk', calendarController.bulkUpdateVisibilities);

export default router;
