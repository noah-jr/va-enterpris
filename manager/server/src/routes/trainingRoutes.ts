import { Router } from 'express';
import { TrainingController } from '../controllers/TrainingController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

// Courses
router.get('/courses', rbacMiddleware(['training:view']), TrainingController.getCourses);
router.post('/courses', rbacMiddleware(['training:manage']), TrainingController.createCourse);
router.put('/courses/:id', rbacMiddleware(['training:manage']), TrainingController.updateCourse);
router.delete('/courses/:id', rbacMiddleware(['training:manage']), TrainingController.deleteCourse);

// Lessons
router.get('/courses/:courseId/lessons', rbacMiddleware(['training:view']), TrainingController.getLessons);
router.post('/lessons', rbacMiddleware(['training:manage']), TrainingController.createLesson);
router.delete('/lessons/:id', rbacMiddleware(['training:manage']), TrainingController.deleteLesson);

export { router as trainingRoutes };
