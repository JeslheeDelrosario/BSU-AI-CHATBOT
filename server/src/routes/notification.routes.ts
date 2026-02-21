import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
// Specific routes MUST come before parameterized routes to avoid Express matching them as params
router.put('/mark-all-read', notificationController.markAllAsRead);
router.put('/:notificationId/read', notificationController.markAsRead);
router.delete('/read/all', notificationController.deleteAllRead);
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;
