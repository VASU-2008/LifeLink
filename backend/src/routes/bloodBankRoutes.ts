import { Router } from 'express';
import { BloodBankController } from '../controllers/bloodBankController.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateJWT, BloodBankController.getBloodBanks);
router.get('/inventory', authenticateJWT, BloodBankController.getInventory);
router.get('/:id/inventory', authenticateJWT, BloodBankController.getInventory);
router.post('/inventory', authenticateJWT, requireRoles('BLOOD_BANK', 'ADMIN'), BloodBankController.addInventory);
router.put('/inventory/:id', authenticateJWT, requireRoles('BLOOD_BANK', 'ADMIN'), BloodBankController.updateInventory);
router.delete('/inventory/:id', authenticateJWT, requireRoles('BLOOD_BANK', 'ADMIN'), BloodBankController.deleteInventory);
router.get('/alerts/shortages', authenticateJWT, BloodBankController.getShortageAlerts);

export default router;
