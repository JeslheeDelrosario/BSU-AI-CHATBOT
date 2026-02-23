import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  getRoomLayout,
  updateRoomLayout,
  addFurniture,
  updateFurniture,
  deleteFurniture,
  bulkUpdateFurniture,
  getRoomChatMessages,
  sendChatMessage,
  clearRoomChat,
  getFurnitureTemplates,
  resetRoomLayout
} from '../controllers/roomLayout.controller';

const router = Router();

// Furniture templates (public)
router.get('/templates', getFurnitureTemplates);

// Room layout routes
router.get('/:roomId/layout', authenticateToken, getRoomLayout);
router.put('/:roomId/layout', authenticateToken, updateRoomLayout);
router.post('/:roomId/layout/reset', authenticateToken, resetRoomLayout);

// Furniture routes
router.post('/:roomId/furniture', authenticateToken, addFurniture);
router.put('/furniture/:furnitureId', authenticateToken, updateFurniture);
router.delete('/furniture/:furnitureId', authenticateToken, deleteFurniture);
router.post('/:roomId/furniture/bulk', authenticateToken, bulkUpdateFurniture);

// Chat routes
router.get('/:roomId/chat', authenticateToken, getRoomChatMessages);
router.post('/:roomId/chat', authenticateToken, sendChatMessage);
router.delete('/:roomId/chat', authenticateToken, clearRoomChat);

export default router;
