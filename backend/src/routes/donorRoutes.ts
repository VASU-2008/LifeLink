import { Router } from 'express';
import { DonorController } from '../controllers/donorController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = Router();

router.get('/me/dashboard', authenticateJWT, DonorController.getDonorDashboard);
router.put('/me/availability', authenticateJWT, DonorController.toggleAvailability);
router.put('/me/profile', authenticateJWT, DonorController.updateProfile);
router.get('/leaderboard', authenticateJWT, DonorController.getLeaderboard);
router.get('/matches', authenticateJWT, DonorController.searchMatches);

export default router;
