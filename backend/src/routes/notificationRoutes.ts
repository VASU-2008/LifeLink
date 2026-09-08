import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateJWT, NotificationController.getNotifications);
router.put('/:id/read', authenticateJWT, NotificationController.markAsRead);
router.put('/read-all', authenticateJWT, NotificationController.markAllAsRead);

export default router;
