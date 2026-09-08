import { Response, NextFunction } from 'express';
import { Donation } from '../models/Donation.js';
import { User } from '../models/User.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { AuthRequest } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';

export class DonationController {
  /**
   * Get logged-in donor donation history
   */
  static async getMyDonations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const donations = await Donation.find({ donor: req.user._id })
        .sort({ date: -1 })
        .populate('bloodRequest', 'patientName urgency hospital')
        .populate('verifiedBy', 'name role')
        .lean();

      res.status(200).json({
        success: true,
        count: donations.length,
        donations,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single donation details & certificate
   */
  static async getDonationById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const donation = await Donation.findById(id)
        .populate('donor', 'name bloodGroup email phone location.city')
        .populate('bloodRequest')
        .populate('verifiedBy', 'name role hospitalDetails')
        .lean();

      if (!donation) {
        res.status(404).json({ success: false, message: 'Donation record not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        donation,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Hospital or Blood Bank verifies a completed donation
   */
  static async verifyDonation(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { verificationCode, bloodRequestId, donorId, bloodGroup, units, notes } = req.body;

      let bloodRequest = null;
      if (bloodRequestId) {
        bloodRequest = await BloodRequest.findById(bloodRequestId);
      } else if (verificationCode) {
        bloodRequest = await BloodRequest.findOne({ verificationCode });
      }

      const targetDonorId = donorId || bloodRequest?.acceptedDonor;
      if (!targetDonorId) {
        res.status(400).json({
          success: false,
          message: 'Target donor could not be resolved from verification code or donor ID.',
        });
        return;
      }

      const donorUser = await User.findById(targetDonorId);
      if (!donorUser) {
        res.status(404).json({ success: false, message: 'Donor user not found.' });
        return;
      }

      const certificateId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const donation = await Donation.create({
        donor: donorUser._id,
        hospital: {
          name: req.user.name || 'Metropolitan General Hospital',
          address: req.user.location?.address || 'Medical Enclave',
          hospitalUser: req.user._id,
        },
        bloodRequest: bloodRequest?._id,
        bloodGroup: bloodGroup || donorUser.bloodGroup,
        units: units ? Number(units) : 1,
        date: new Date(),
        type: bloodRequest ? 'EMERGENCY' : 'VOLUNTARY',
        status: 'VERIFIED',
        verified: true,
        verifiedBy: req.user._id,
        verificationDate: new Date(),
        certificateId,
        lifePointsAwarded: bloodRequest ? 750 : 500,
        notes,
      });

      // Update donor stats and LifePoints
      donorUser.lifePoints += donation.lifePointsAwarded;
      donorUser.stats.totalDonations = (donorUser.stats.totalDonations || 0) + 1;
      donorUser.stats.lastDonationDate = new Date();
      donorUser.eligibility = {
        isEligible: false,
        lastDonationDate: new Date(),
        nextEligibleDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        reason: 'Cooling period (90 days required for whole blood donation recovery)',
      };

      // Check for regular donor badge (3+ donations)
      if (donorUser.stats.totalDonations >= 3 && !donorUser.badges.some((b) => b.id === 'regular-donor')) {
        donorUser.badges.push({
          id: 'regular-donor',
          name: 'Regular Lifesaver',
          icon: 'Award',
          description: 'Completed 3 or more verified blood donations',
          earnedAt: new Date(),
        });
      }

      await donorUser.save();

      // If bloodRequest exists, complete request
      if (bloodRequest) {
        bloodRequest.status = 'DONATION_VERIFIED';
        bloodRequest.verifiedBy = req.user._id;
        await bloodRequest.save();
      }

      // Dispatch notification to donor
      await NotificationService.notify({
        userId: donorUser._id,
        type: 'DONATION_VERIFIED',
        title: '🎖️ Blood Donation Verified!',
        message: `Your blood donation has been verified. You earned +${donation.lifePointsAwarded} LifePoints! Certificate: ${certificateId}`,
        urgency: 'HIGH',
        link: `/donor/donations`,
      });

      res.status(201).json({
        success: true,
        message: 'Donation successfully verified and LifePoints awarded.',
        donation,
        certificateId,
      });
    } catch (err) {
      next(err);
    }
  }
}
