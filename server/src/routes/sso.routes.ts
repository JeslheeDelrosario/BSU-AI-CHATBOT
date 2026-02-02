import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as ssoController from '../controllers/sso.controller';

const router = Router();

router.get('/auth-url', ssoController.getAuthorizationUrl);
router.get('/callback', ssoController.handleCallback);
router.post('/refresh', authenticateToken, ssoController.refreshSSOToken);
router.delete('/unlink/:provider', authenticateToken, ssoController.unlinkSSO);
router.get('/providers', authenticateToken, ssoController.getSSOProviders);

export default router;
