import { Router } from 'express';
import { RequestController } from '../controllers/requestController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateJWT, RequestController.createRequest);
router.get('/', authenticateJWT, RequestController.getRequests);
router.get('/:id', authenticateJWT, RequestController.getRequestById);
router.post('/:id/respond', authenticateJWT, RequestController.respondToRequest);
router.put('/:id/status', authenticateJWT, RequestController.updateStatus);
router.post('/:id/broadcast-escalate', authenticateJWT, RequestController.escalateRadius);

export default router;
