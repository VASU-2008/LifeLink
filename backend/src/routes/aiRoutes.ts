import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';

const router = Router();

router.post('/chat', AIController.chat);
router.get('/predict-shortage', AIController.predictShortage);
router.post('/match', AIController.explainMatch);

export default router;
