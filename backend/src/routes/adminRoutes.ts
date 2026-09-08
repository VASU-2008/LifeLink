import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes
router.use(authenticateJWT, requireRoles('ADMIN'));

router.get('/metrics', AdminController.getMetrics);
router.get('/users', AdminController.getUsers);
router.put('/users/:id/verify', AdminController.verifyUser);
router.get('/fraud-alerts', AdminController.getFraudAlerts);
router.put('/fraud-alerts/:id/resolve', AdminController.resolveFraudAlert);
router.get('/analytics', AdminController.getAnalytics);

export default router;
