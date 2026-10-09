import { Router } from 'express';
import { RecruitmentController } from '../controllers/RecruitmentController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';

const router = Router();

router.get('/', rbacMiddleware(['recruitment:view']), RecruitmentController.getCandidates);
router.get('/kpis', rbacMiddleware(['recruitment:view']), RecruitmentController.getKpis);
router.get('/options', rbacMiddleware(['recruitment:view']), RecruitmentController.getOptions);
router.post('/', rbacMiddleware(['hr:manage']), RecruitmentController.createCandidate);
router.patch('/:id', rbacMiddleware(['hr:manage']), RecruitmentController.updateCandidate);

export { router as recruitmentRoutes };
