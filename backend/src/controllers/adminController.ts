import { Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { Donation } from '../models/Donation.js';
import { BloodInventory } from '../models/BloodInventory.js';
import { FraudLog } from '../models/FraudLog.js';
import { AuthRequest } from '../middleware/auth.js';

export class AdminController {
  /**
   * Get Platform Overview KPIs & Health Metrics
   */
  static async getMetrics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalUsers,
        totalDonors,
        totalHospitals,
        totalBloodBanks,
        pendingVerifications,
        activeEmergencies,
        completedRequests,
        totalDonations,
        fraudAlertsCount,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'DONOR' }),
        User.countDocuments({ role: 'HOSPITAL' }),
        User.countDocuments({ role: 'BLOOD_BANK' }),
        User.countDocuments({ role: { $in: ['HOSPITAL', 'BLOOD_BANK'] }, verified: false }),
        BloodRequest.countDocuments({ status: { $in: ['REQUESTED', 'MATCHED', 'DONOR_ACCEPTED'] } }),
        BloodRequest.countDocuments({ status: { $in: ['DONATION_VERIFIED', 'COMPLETED'] } }),
        Donation.countDocuments({ verified: true }),
        FraudLog.countDocuments({ resolved: false }),
      ]);

      // Calculate Average Time-To-Match
      const matchedRequests = await BloodRequest.find({
        timeToMatchSeconds: { $exists: true, $ne: null },
      }).select('timeToMatchSeconds');

      let avgTimeToMatchSeconds = 180; // 3 minutes default baseline
      if (matchedRequests.length > 0) {
        const sumSeconds = matchedRequests.reduce((acc, r) => acc + (r.timeToMatchSeconds || 0), 0);
        avgTimeToMatchSeconds = Math.round(sumSeconds / matchedRequests.length);
      }

      // Aggregate total available blood units in network
      const inventoryAgg = await BloodInventory.aggregate([
        { $match: { status: 'AVAILABLE' } },
        { $group: { _id: null, totalUnits: { $sum: '$units' } } },
      ]);
      const totalBloodUnitsAvailable = inventoryAgg[0]?.totalUnits || 0;

      res.status(200).json({
        success: true,
        metrics: {
          totalUsers,
          totalDonors,
          totalHospitals,
          totalBloodBanks,
          pendingVerifications,
          activeEmergencies,
          completedRequests,
          totalDonations,
          fraudAlertsCount,
          avgTimeToMatchSeconds,
          avgTimeToMatchFormatted: `${Math.floor(avgTimeToMatchSeconds / 60)}m ${avgTimeToMatchSeconds % 60}s`,
          totalBloodUnitsAvailable,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get all registered users with filters
   */
  static async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role, verified, search } = req.query;
      const filter: any = {};

      if (role) filter.role = role;
      if (verified !== undefined) filter.verified = verified === 'true';
      if (search) {
        filter.$or = [
          { name: { $regex: String(search), $options: 'i' } },
          { email: { $regex: String(search), $options: 'i' } },
          { phone: { $regex: String(search), $options: 'i' } },
        ];
      }

      const users = await User.find(filter)
        .sort({ createdAt: -1 })
        .select('-password')
        .lean();

      res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Verify/Approve a hospital or blood bank
   */
  static async verifyUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { verified } = req.body;

      const user = await User.findByIdAndUpdate(
        id,
        { verified: Boolean(verified) },
        { new: true }
      ).select('-password');

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: `User ${user.name} verification status set to ${user.verified ? 'VERIFIED' : 'UNVERIFIED'}.`,
        user,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get fraud alerts & risk logs
   */
  static async getFraudAlerts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await FraudLog.find()
        .sort({ flaggedAt: -1 })
        .populate('user', 'name email role phone')
        .lean();

      res.status(200).json({
        success: true,
        count: logs.length,
        logs,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Resolve a fraud alert
   */
  static async resolveFraudAlert(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { resolved } = req.body;

      const log = await FraudLog.findByIdAndUpdate(
        id,
        {
          resolved: Boolean(resolved),
          resolvedBy: req.user?._id,
          resolvedAt: new Date(),
        },
        { new: true }
      );

      if (!log) {
        res.status(404).json({ success: false, message: 'Fraud alert log not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Fraud alert marked as resolved.',
        log,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get Platform Analytics & Trends
   */
  static async getAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Demand by blood group
      const demandAgg = await BloodRequest.aggregate([
        {
          $group: {
            _id: '$bloodGroup',
            totalRequests: { $sum: 1 },
            totalUnitsRequested: { $sum: '$units' },
          },
        },
      ]);

      // Supply by blood group in inventory
      const supplyAgg = await BloodInventory.aggregate([
        { $match: { status: 'AVAILABLE' } },
        {
          $group: {
            _id: '$bloodGroup',
            totalUnitsInStock: { $sum: '$units' },
          },
        },
      ]);

      const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const supplyMap: Record<string, number> = {};
      const demandMap: Record<string, number> = {};

      allGroups.forEach((bg) => {
        supplyMap[bg] = 0;
        demandMap[bg] = 0;
      });

      supplyAgg.forEach((s) => (supplyMap[s._id] = s.totalUnitsInStock));
      demandAgg.forEach((d) => (demandMap[d._id] = d.totalUnitsRequested));

      const bloodGroupComparison = allGroups.map((bg) => ({
        bloodGroup: bg,
        demandUnits: demandMap[bg] || 0,
        availableUnits: supplyMap[bg] || 0,
        deficit: (demandMap[bg] || 0) - (supplyMap[bg] || 0),
      }));

      // Emergency urgency distribution
      const urgencyAgg = await BloodRequest.aggregate([
        { $group: { _id: '$urgency', count: { $sum: 1 } } },
      ]);

      res.status(200).json({
        success: true,
        bloodGroupComparison,
        urgencyDistribution: urgencyAgg,
      });
    } catch (err) {
      next(err);
    }
  }
}
