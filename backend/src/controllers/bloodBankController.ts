import { Response, NextFunction } from 'express';
import { BloodInventory, IBloodInventory } from '../models/BloodInventory.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

export class BloodBankController {
  /**
   * Get all blood banks list with current aggregate stock
   */
  static async getBloodBanks(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const bloodBanks = await User.find({ role: 'BLOOD_BANK' })
        .select('name email phone location verified bloodBankDetails createdAt')
        .lean();

      // Fetch stock totals for each blood bank
      const stockAgg = await BloodInventory.aggregate([
        { $match: { status: 'AVAILABLE' } },
        {
          $group: {
            _id: '$bloodBank',
            totalUnits: { $sum: '$units' },
            bloodGroups: { $addToSet: '$bloodGroup' },
          },
        },
      ]);

      const stockMap: Record<string, { totalUnits: number; bloodGroups: string[] }> = {};
      stockAgg.forEach((s) => {
        stockMap[s._id.toString()] = {
          totalUnits: s.totalUnits,
          bloodGroups: s.bloodGroups,
        };
      });

      const formatted = bloodBanks.map((b) => ({
        id: b._id,
        name: b.name,
        email: b.email,
        phone: b.phone,
        location: b.location,
        verified: b.verified,
        bloodBankDetails: b.bloodBankDetails,
        totalStockUnits: stockMap[b._id.toString()]?.totalUnits || 0,
        availableGroups: stockMap[b._id.toString()]?.bloodGroups || [],
      }));

      res.status(200).json({
        success: true,
        count: formatted.length,
        bloodBanks: formatted,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get inventory batches for a specific blood bank or logged-in blood bank
   */
  static async getInventory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      let bloodBankId = req.params.id;

      if (!bloodBankId && req.user?.role === 'BLOOD_BANK') {
        bloodBankId = req.user._id.toString();
      }

      if (!bloodBankId) {
        res.status(400).json({ success: false, message: 'Blood bank ID is required.' });
        return;
      }

      const inventory = await BloodInventory.find({ bloodBank: bloodBankId })
        .sort({ expiryDate: 1 })
        .lean();

      // Summary counts by blood group
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const summary: Record<string, number> = {};
      bloodGroups.forEach((bg) => (summary[bg] = 0));

      inventory.forEach((item) => {
        if (item.status === 'AVAILABLE') {
          summary[item.bloodGroup] = (summary[item.bloodGroup] || 0) + item.units;
        }
      });

      res.status(200).json({
        success: true,
        summary,
        totalBatches: inventory.length,
        batches: inventory,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Add a new blood inventory batch
   */
  static async addInventory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { bloodGroup, units, collectionDate, expiryDate, storageTemperature } = req.body;

      if (!bloodGroup || !units) {
        res.status(400).json({ success: false, message: 'Blood group and units are required.' });
        return;
      }

      const cDate = collectionDate ? new Date(collectionDate) : new Date();
      // Whole blood/RBC typical shelf life: 35-42 days
      const eDate = expiryDate ? new Date(expiryDate) : new Date(Date.now() + 35 * 24 * 60 * 60 * 1000);
      const batchNumber = `BATCH-${bloodGroup.replace('+', 'POS').replace('-', 'NEG')}-${Date.now().toString(36).toUpperCase()}`;

      const item = await BloodInventory.create({
        bloodBank: req.user._id,
        bloodBankName: req.user.name,
        bloodGroup,
        units: Number(units),
        batchNumber,
        collectionDate: cDate,
        expiryDate: eDate,
        status: 'AVAILABLE',
        storageTemperature: storageTemperature || '4°C',
        location: req.user.location || {
          address: 'Main Blood Center',
          city: 'Metropolis',
          coordinates: { lat: 28.6139, lng: 77.2090 },
        },
      });

      res.status(201).json({
        success: true,
        message: `Batch ${batchNumber} added successfully (${units} units of ${bloodGroup}).`,
        item,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update inventory batch (units, status)
   */
  static async updateInventory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { units, status, storageTemperature } = req.body;

      const updated = await BloodInventory.findByIdAndUpdate(
        id,
        {
          ...(units !== undefined && { units: Number(units) }),
          ...(status && { status }),
          ...(storageTemperature && { storageTemperature }),
        },
        { new: true }
      );

      if (!updated) {
        res.status(404).json({ success: false, message: 'Inventory batch not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Inventory batch updated.',
        item: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Discard/delete inventory batch
   */
  static async deleteInventory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await BloodInventory.findByIdAndDelete(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Inventory batch not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Batch removed successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get shortage alerts and expiring batches
   */
  static async getShortageAlerts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const stockAgg = await BloodInventory.aggregate([
        { $match: { status: 'AVAILABLE' } },
        { $group: { _id: '$bloodGroup', totalUnits: { $sum: '$units' } } },
      ]);

      const stockMap: Record<string, number> = {};
      allGroups.forEach((bg) => (stockMap[bg] = 0));
      stockAgg.forEach((s) => (stockMap[s._id] = s.totalUnits));

      // Low stock thresholds (< 5 units is critical, < 10 is warning)
      const shortages = allGroups
        .filter((bg) => stockMap[bg] < 10)
        .map((bg) => ({
          bloodGroup: bg,
          currentUnits: stockMap[bg],
          severity: stockMap[bg] < 5 ? 'CRITICAL' : 'WARNING',
          message: stockMap[bg] < 5 ? `Urgent shortage of ${bg} blood (<5 units in network)` : `Low reserve of ${bg} blood (<10 units)`,
        }));

      // Expiring batches in next 7 days
      const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const expiringBatches = await BloodInventory.find({
        status: 'AVAILABLE',
        expiryDate: { $lte: sevenDaysLater },
      })
        .sort({ expiryDate: 1 })
        .limit(10)
        .lean();

      res.status(200).json({
        success: true,
        stockSummary: stockMap,
        shortageAlerts: shortages,
        expiringBatches,
      });
    } catch (err) {
      next(err);
    }
  }
}
