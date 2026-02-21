import { Router } from 'express';
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomStatistics,
  getBuildingsList,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from '../controllers/adminRoom.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/statistics', getRoomStatistics);
router.get('/buildings', getBuildingsList);

// Meeting/Schedule CRUD
router.post('/meetings', createMeeting);
router.put('/meetings/:id', updateMeeting);
router.delete('/meetings/:id', deleteMeeting);

// Room CRUD
router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

export default router;
