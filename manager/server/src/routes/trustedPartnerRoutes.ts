import { Router } from 'express';
import { TrustedPartnerController } from '../controllers/TrustedPartnerController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';
import { uploadAsset } from '../lib/uploadAsset';

const trustedPartnerRoutes = Router();

trustedPartnerRoutes.use(authMiddleware);
trustedPartnerRoutes.use(rbacMiddleware([], ['SUPER_ADMIN']));

// Apenas Super Admin ou admins globais devem gerir os parceiros
trustedPartnerRoutes.get('/', TrustedPartnerController.listAll);
trustedPartnerRoutes.post('/', TrustedPartnerController.create);
trustedPartnerRoutes.patch('/:id', TrustedPartnerController.update);
trustedPartnerRoutes.delete('/:id', TrustedPartnerController.delete);
trustedPartnerRoutes.post('/:id/upload', uploadAsset, TrustedPartnerController.uploadLogo);

export { trustedPartnerRoutes };
