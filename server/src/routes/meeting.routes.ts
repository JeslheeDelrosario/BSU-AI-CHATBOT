import { Router } from 'express';
import {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
  updateParticipantStatus,
  addParticipants,
  getRooms,
  getRoomAvailability,
  getCalendarEvents,
} from '../controllers/meeting.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', createMeeting);
router.get('/', getMeetings);
router.get('/calendar', getCalendarEvents);
router.get('/:id', getMeetingById);
router.put('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);
router.post('/:id/participants', addParticipants);
router.put('/:meetingId/participants/:participantId/status', updateParticipantStatus);

router.get('/rooms/list', getRooms);
router.get('/rooms/availability', getRoomAvailability);

export default router;
