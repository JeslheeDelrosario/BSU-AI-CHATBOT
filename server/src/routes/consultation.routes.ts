// server/src/routes/consultation.routes.ts
import { Router } from 'express';
import {
  bookConsultation,
  getMyBookings,
  getFacultyBookings,
  updateBookingStatus,
  cancelBooking,
  getAvailableSlots,
  updateMySchedule,
  getMyFacultyProfile,
  getFacultyCalendar,
  getConsultationConfig,
  updateConsultationConfig,
  getFacultyWithConsultation
} from '../controllers/consultation.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Student routes
router.post('/book', bookConsultation);
router.get('/my-bookings', getMyBookings);
router.delete('/:id/cancel', cancelBooking);

// Faculty self-management routes
router.get('/my-profile', getMyFacultyProfile);
router.put('/my-schedule', updateMySchedule);

// Faculty + Student: weekly calendar view
router.get('/calendar', getFacultyCalendar);

// Admin config routes
router.get('/config', getConsultationConfig);
router.put('/config', updateConsultationConfig);

// Faculty routes (admin/teacher access)
router.get('/faculty/:facultyId', getFacultyBookings);
router.put('/:id/status', updateBookingStatus);

// Utility routes
router.get('/available-slots', getAvailableSlots);
router.get('/faculty-list', getFacultyWithConsultation);

export default router;
