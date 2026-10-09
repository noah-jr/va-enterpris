import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();
router.use(authMiddleware);

router.get('/', rbacMiddleware(['projects:view']), ProjectController.getProjects);
router.post('/', rbacMiddleware(['projects:create']), ProjectController.createProject);
router.put('/:id', rbacMiddleware(['projects:update']), ProjectController.updateProject);
router.delete('/:id', rbacMiddleware(['projects:delete']), ProjectController.deleteProject);
router.post('/:id/tasks', rbacMiddleware(['projects:update']), ProjectController.addTask);
router.patch('/:id/tasks/:taskId', rbacMiddleware(['projects:update']), ProjectController.updateTask);

export { router as projectRoutes };
