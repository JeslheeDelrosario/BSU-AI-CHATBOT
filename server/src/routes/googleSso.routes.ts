import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as googleSsoController from '../controllers/googleSso.controller';

const router = Router();

router.get('/available', googleSsoController.checkGoogleSSOAvailability);
router.get('/auth-url', googleSsoController.getGoogleAuthUrl);
router.get('/callback', googleSsoController.handleGoogleCallback);
router.post('/refresh', authenticateToken, googleSsoController.refreshGoogleToken);
router.delete('/unlink', authenticateToken, googleSsoController.unlinkGoogle);
router.get('/status', authenticateToken, googleSsoController.getGoogleSSOStatus);

export default router;
