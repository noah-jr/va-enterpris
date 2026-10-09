import { Router } from 'express';
import { CalendarController } from '../controllers/CalendarController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/', rbacMiddleware(['hr:view']), CalendarController.getEvents);
router.post('/', rbacMiddleware(['hr:view']), CalendarController.createEvent);
router.patch('/:id', rbacMiddleware(['hr:view']), CalendarController.updateEvent);
router.delete('/:id', rbacMiddleware(['hr:view']), CalendarController.deleteEvent);

export { router as calendarRoutes };
