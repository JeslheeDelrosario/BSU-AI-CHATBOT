// server/src/routes/consultation.routes.ts
// Production-grade consultation booking routes
import { Router } from 'express';
import {
  bookConsultation,
  getMyBookings,
  getFacultyBookings,
  updateBookingStatus,
  cancelBooking,
  clearCancelledBookings,
  getAvailableSlots,
  updateMySchedule,
  getMyFacultyProfile,
  getFacultyCalendar,
  getConsultationConfig,
  updateConsultationConfig,
  getFacultyWithConsultation,
  lockConsultationSlot,
  unlockConsultationSlot,
  getBookingHistoryEndpoint,
  getAnalyticsEndpoint,
  getBookingRulesEndpoint,
  getFacultyAvailability,
} from '../controllers/consultation.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

// ─── Student Routes ────────────────────────────────────────────────────────────
router.post('/book', bookConsultation);
router.get('/my-bookings', getMyBookings);
router.delete('/:id/cancel', cancelBooking);
router.delete('/clear-cancelled', clearCancelledBookings);

// ─── Faculty Self-Management Routes ────────────────────────────────────────────
router.get('/my-profile', getMyFacultyProfile);
router.put('/my-schedule', updateMySchedule);

// ─── Calendar & Availability ───────────────────────────────────────────────────
router.get('/calendar', getFacultyCalendar);
router.get('/available-slots', getAvailableSlots);
router.get('/faculty-list', getFacultyWithConsultation);
router.get('/rules', getBookingRulesEndpoint);
router.get('/faculty/:facultyId/availability', getFacultyAvailability);

// ─── Admin/Faculty: Slot Locking ───────────────────────────────────────────────
router.post('/slots/lock', lockConsultationSlot);
router.post('/slots/unlock', unlockConsultationSlot);

// ─── Admin/Faculty: Booking Management ─────────────────────────────────────────
router.get('/faculty/:facultyId', getFacultyBookings);
router.put('/:id/status', updateBookingStatus);

// ─── Admin: History & Analytics ────────────────────────────────────────────────
router.get('/history', getBookingHistoryEndpoint);
router.get('/analytics', getAnalyticsEndpoint);

// ─── Admin: Configuration ──────────────────────────────────────────────────────
router.get('/config', getConsultationConfig);
router.put('/config', updateConsultationConfig);

export default router;