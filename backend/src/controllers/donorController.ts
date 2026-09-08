import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { Donation } from '../models/Donation.js';
import { AuthRequest } from '../middleware/auth.js';
import { BloodCompatibilityService } from '../services/bloodCompatibilityService.js';
import { MapService } from '../services/mapService.js';
import { DonorMatchingService } from '../services/donorMatchingService.js';

export class DonorController {
  /**
   * Get authenticated donor dashboard stats, points and badges
   */
  static async getDonorDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const donor = await User.findById(req.user._id).select('-password');
      if (!donor) {
        res.status(404).json({ success: false, message: 'Donor not found' });
        return;
      }

      // Fetch recent donations
      const recentDonations = await Donation.find({ donor: donor._id })
        .sort({ date: -1 })
        .limit(5)
        .populate('hospital.hospitalUser', 'name location');

      // Rank calculation (Position on leaderboard)
      const higherDonorsCount = await User.countDocuments({
        role: 'DONOR',
        lifePoints: { $gt: donor.lifePoints },
      });
      const communityRank = higherDonorsCount + 1;

      // Find compatible active requests nearby
      const compatibleGroups = BloodCompatibilityService.getCompatibleRecipientGroups(donor.bloodGroup);
      const activeRequests = await BloodRequest.find({
        status: { $in: ['REQUESTED', 'MATCHED'] },
        bloodGroup: { $in: compatibleGroups },
      })
        .sort({ urgency: 1, createdAt: -1 })
        .limit(6)
        .lean();

      // Mask sensitive hospital/patient data and append approximate distance
      const formattedNearbyRequests = activeRequests.map((r) => {
        const distanceKm = MapService.calculateDistanceKm(
          donor.location.coordinates,
          r.hospital.coordinates
        );
        return {
          id: r._id,
          patientName: r.patientName,
          bloodGroup: r.bloodGroup,
          units: r.units,
          hospitalName: r.hospital.name,
          hospitalAddress: r.hospital.address,
          urgency: r.urgency,
          status: r.status,
          distanceKm,
          distanceFormatted: MapService.formatSafeDistance(distanceKm),
          requiredBy: r.requiredBy,
          createdAt: r.createdAt,
        };
      });

      res.status(200).json({
        success: true,
        donor: {
          id: donor._id,
          name: donor.name,
          email: donor.email,
          phone: donor.phone,
          bloodGroup: donor.bloodGroup,
          gender: donor.gender,
          age: donor.age,
          location: donor.location,
          availability: donor.availability,
          eligibility: donor.eligibility,
          lifePoints: donor.lifePoints,
          badges: donor.badges,
          stats: donor.stats,
          communityRank,
        },
        recentDonations,
        nearbyEmergencyRequests: formattedNearbyRequests,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Toggle donor availability
   */
  static async toggleAvailability(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { availability } = req.body;
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { availability: Boolean(availability) },
        { new: true }
      ).select('-password');

      res.status(200).json({
        success: true,
        message: `Availability updated to ${availability ? 'ACTIVE' : 'OFFLINE'}.`,
        availability: updatedUser?.availability,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update donor profile details
   */
  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { bloodGroup, phone, age, gender, location } = req.body;

      const user = await User.findById(req.user._id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      if (bloodGroup) user.bloodGroup = bloodGroup;
      if (phone) user.phone = phone;
      if (age) user.age = Number(age);
      if (gender) user.gender = gender;
      if (location) {
        user.location = {
          ...user.location,
          ...location,
          coordinates: location.coordinates || user.location.coordinates,
        };
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Donor profile updated successfully.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          bloodGroup: user.bloodGroup,
          age: user.age,
          gender: user.gender,
          location: user.location,
          availability: user.availability,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get community leaderboard
   */
  static async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const topDonors = await User.find({ role: 'DONOR' })
        .sort({ lifePoints: -1, 'stats.totalDonations': -1 })
        .limit(20)
        .select('name bloodGroup lifePoints badges stats location.city createdAt')
        .lean();

      const leaderboard = topDonors.map((d, index) => ({
        rank: index + 1,
        id: d._id,
        name: d.name,
        bloodGroup: d.bloodGroup,
        city: d.location?.city || 'Metropolis',
        lifePoints: d.lifePoints,
        totalDonations: d.stats?.totalDonations || 0,
        emergencyResponses: d.stats?.emergencyResponses || 0,
        badgeCount: d.badges?.length || 0,
      }));

      res.status(200).json({
        success: true,
        leaderboard,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Search compatible donors
   */
  static async searchMatches(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bloodGroup, lat, lng, radiusKm } = req.query;

      if (!bloodGroup) {
        res.status(400).json({ success: false, message: 'Blood group parameter is required.' });
        return;
      }

      const coordinates = {
        lat: lat ? Number(lat) : 28.6139,
        lng: lng ? Number(lng) : 77.2090,
      };

      const matches = await DonorMatchingService.matchDonors(
        {
          bloodGroup: String(bloodGroup),
          hospital: { coordinates },
        },
        radiusKm ? Number(radiusKm) : 50
      );

      res.status(200).json({
        success: true,
        bloodGroup,
        totalMatches: matches.length,
        matches,
      });
    } catch (err) {
      next(err);
    }
  }
}
