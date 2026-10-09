import { Router } from 'express';
import { AIController } from '../controllers/AIController';

const aiRoutes = Router();

// Rota pública para o Chatbot da Landing Page
aiRoutes.post('/chat', AIController.chat);

export { aiRoutes };
