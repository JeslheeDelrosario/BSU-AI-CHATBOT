// server/src/routes/program.routes.ts
import { Router } from 'express';
import { getPrograms } from '../controllers/program.controller';

const router = Router();

router.get('/', getPrograms);

export default router;
