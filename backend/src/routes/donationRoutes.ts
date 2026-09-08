import { Router } from 'express';
import { DonationController } from '../controllers/donationController.js';
import { authenticateJWT, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/my-donations', authenticateJWT, DonationController.getMyDonations);
router.get('/:id', authenticateJWT, DonationController.getDonationById);
router.post('/verify', authenticateJWT, requireRoles('HOSPITAL', 'BLOOD_BANK', 'ADMIN'), DonationController.verifyDonation);

export default router;
