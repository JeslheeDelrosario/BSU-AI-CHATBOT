import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as weatherController from '../controllers/weather.controller';

const router = Router();

router.use(authenticateToken);

router.get('/forecast', weatherController.getBulacanWeather);
router.post('/cache/clear', weatherController.clearWeatherCache);
router.get('/icon/:icon', weatherController.getWeatherIcon);

export default router;
