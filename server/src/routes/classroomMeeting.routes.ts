import { Router } from 'express';
import {
  getClassroomMeetings,
  getCalendarMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  joinMeeting,
  getUpcomingMeetings,
  updateMeetingStatus
} from '../controllers/classroomMeeting.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticateToken);

router.get('/', getClassroomMeetings);
router.get('/calendar', getCalendarMeetings);
router.get('/upcoming', getUpcomingMeetings);
router.get('/:meetingId', getMeetingById);
router.post('/', createMeeting);
router.put('/:meetingId', updateMeeting);
router.delete('/:meetingId', deleteMeeting);
router.post('/:meetingId/join', joinMeeting);
router.put('/:meetingId/status', updateMeetingStatus);

export default router;
