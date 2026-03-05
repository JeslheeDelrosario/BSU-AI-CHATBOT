import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as aiSettingsController from '../controllers/ai-settings.controller';

const router = Router();

router.get('/settings', authenticateToken, aiSettingsController.getAISettings);
router.put('/settings', authenticateToken, aiSettingsController.updateAISettings);
router.post('/settings/reset', authenticateToken, aiSettingsController.resetAISettings);
router.get('/analytics', authenticateToken, aiSettingsController.getContextAnalytics);
router.post('/clear-context', authenticateToken, aiSettingsController.clearUserContext);

export default router;
