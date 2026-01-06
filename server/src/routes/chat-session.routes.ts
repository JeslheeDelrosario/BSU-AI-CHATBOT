// server/src/routes/chat-session.routes.ts
import { Router } from 'express';
import {
  listChatSessions,
  createChatSession,
  getChatSession,
  updateChatSession,
  renameChatSession,
  deleteChatSession,
} from '../controllers/chat-session.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken); // all require auth

router.get('/', listChatSessions);
router.post('/', createChatSession);
router.get('/:id', getChatSession);
router.put('/:id', updateChatSession);
router.put('/:id/rename', renameChatSession);
router.delete('/:id', deleteChatSession);

export default router;
