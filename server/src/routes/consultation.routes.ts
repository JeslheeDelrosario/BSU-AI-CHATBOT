// server/src/routes/consultation.routes.ts
import { Router } from 'express';
import {
  bookConsultation,
  getMyBookings,
  getFacultyBookings,
  updateBookingStatus,
  cancelBooking,
  getAvailableSlots
} from '../controllers/consultation.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Student routes
router.post('/book', bookConsultation);
router.get('/my-bookings', getMyBookings);
router.delete('/:id/cancel', cancelBooking);

// Faculty routes
router.get('/faculty/:facultyId', getFacultyBookings);
router.put('/:id/status', updateBookingStatus);

// Utility routes
router.get('/available-slots', getAvailableSlots);

export default router;
