import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as holidayController from '../controllers/holiday.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', holidayController.getHolidays);
router.get('/upcoming', holidayController.getUpcomingHolidays);
router.get('/:id', holidayController.getHolidayById);
router.post('/', holidayController.createHoliday);
router.put('/:id', holidayController.updateHoliday);
router.delete('/:id', holidayController.deleteHoliday);

export default router;
