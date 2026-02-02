import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as taskController from '../controllers/task.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/:id/complete', taskController.completeTask);
router.post('/bulk', taskController.bulkCreateTasks);
router.get('/classroom/:classroomId', taskController.getClassroomTasks);

export default router;
