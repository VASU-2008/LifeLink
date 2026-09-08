import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { BloodRequest, IBloodRequest, RequestStatus } from '../models/BloodRequest.js';
import { User } from '../models/User.js';
import { Donation } from '../models/Donation.js';
import { AuthRequest } from '../middleware/auth.js';
import { DonorMatchingService } from '../services/donorMatchingService.js';
import { NotificationService } from '../services/notificationService.js';
import { FraudDetectionService } from '../services/fraudDetectionService.js';
import { MapService } from '../services/mapService.js';

export class RequestController {
  /**
   * Create an emergency blood request
   */
  static async createRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const {
        patientName,
        bloodGroup,
        units,
        hospital,
        urgency,
        requiredBy,
        additionalInfo,
      } = req.body;

      if (!patientName || !bloodGroup || !units || !hospital || !hospital.name) {
        res.status(400).json({
          success: false,
          message: 'Patient name, blood group, units, and hospital details are required.',
        });
        return;
      }

      const hospitalCoords = hospital.coordinates || {
        lat: 28.6139 + (Math.random() - 0.5) * 0.08,
        lng: 77.2090 + (Math.random() - 0.5) * 0.08,
      };

      // 1. Evaluate fraud/spam risk
      const fraudCheck = await FraudDetectionService.evaluateBloodRequest(
        req.user._id.toString(),
        Number(units),
        hospital.name,
        urgency || 'NORMAL'
      );

      // 2. Find matching donors in progressive radius (Level 1: 15 km initial radius)
      const matchedDonors = await DonorMatchingService.matchDonors(
        {
          bloodGroup,
          hospital: { coordinates: hospitalCoords, city: hospital.city },
          urgency,
        },
        15, // 15 km initial radius
        15  // Top 15 donors
      );

      // Map to request model structure
      const mappedMatchedDonors = matchedDonors.map((m) => ({
        donor: new mongoose.Types.ObjectId(m.donorId),
        score: m.matchScore,
        distanceKm: m.distanceKm,
        status: 'NOTIFIED' as const,
        notifiedAt: new Date(),
      }));

      // Generate verification code
      const verificationCode = `LL-${Math.floor(100000 + Math.random() * 900000)}`;

      const bloodRequest = await BloodRequest.create({
        patientName,
        requester: req.user._id,
        bloodGroup,
        units: Number(units),
        hospital: {
          name: hospital.name,
          address: hospital.address || 'Hospital Main Campus',
          city: hospital.city || 'Metropolis',
          contactNumber: hospital.contactNumber || '911-000-BLOOD',
          coordinates: hospitalCoords,
          hospitalUser: req.user.role === 'HOSPITAL' ? req.user._id : undefined,
        },
        urgency: urgency || 'NORMAL',
        status: mappedMatchedDonors.length > 0 ? 'MATCHED' : 'REQUESTED',
        requiredBy: requiredBy ? new Date(requiredBy) : new Date(Date.now() + 4 * 60 * 60 * 1000), // Default 4 hours
        additionalInfo,
        matchedDonors: mappedMatchedDonors,
        verificationCode,
      });

      // 3. Dispatch broadcast alerts to top matched donors
      if (mappedMatchedDonors.length > 0) {
        const donorIds = mappedMatchedDonors.map((d) => d.donor);
        const avgDistance = matchedDonors.length > 0 ? matchedDonors[0].distanceKm : 3.5;

        await NotificationService.notifyEmergencyDonors(
          donorIds,
          bloodRequest._id,
          bloodGroup,
          hospital.name,
          avgDistance,
          urgency || 'NORMAL'
        );
      }

      res.status(201).json({
        success: true,
        message: 'Emergency blood request created and broadcasted to compatible donors.',
        request: bloodRequest,
        matchSummary: {
          totalMatchedDonors: mappedMatchedDonors.length,
          topMatches: matchedDonors.slice(0, 5),
          broadcastRadiusKm: 15,
          fraudRiskScore: fraudCheck.riskScore,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get list of blood requests with role-based filtering
   */
  static async getRequests(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { status, urgency, bloodGroup } = req.query;
      const filter: any = {};

      if (status) filter.status = status;
      if (urgency) filter.urgency = urgency;
      if (bloodGroup) filter.bloodGroup = bloodGroup;

      // Role specific scopes
      if (req.user.role === 'PATIENT') {
        filter.requester = req.user._id;
      } else if (req.user.role === 'HOSPITAL') {
        filter.$or = [
          { requester: req.user._id },
          { 'hospital.hospitalUser': req.user._id },
          { 'hospital.name': req.user.name },
        ];
      }

      const requests = await BloodRequest.find(filter)
        .sort({ urgency: 1, createdAt: -1 })
        .populate('requester', 'name phone email')
        .populate('acceptedDonor', 'name bloodGroup phone')
        .lean();

      // Mask sensitive donor details if not hospital/admin
      const sanitizedRequests = requests.map((r) => {
        return {
          ...r,
          matchedDonorsCount: r.matchedDonors?.length || 0,
          matchedDonors: req.user?.role === 'ADMIN' || req.user?.role === 'HOSPITAL'
            ? r.matchedDonors
            : undefined,
        };
      });

      res.status(200).json({
        success: true,
        count: sanitizedRequests.length,
        requests: sanitizedRequests,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get single blood request details
   */
  static async getRequestById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const request = await BloodRequest.findById(id)
        .populate('requester', 'name phone email')
        .populate('acceptedDonor', 'name bloodGroup phone location.city')
        .populate('matchedDonors.donor', 'name bloodGroup location.city availability')
        .lean();

      if (!request) {
        res.status(404).json({ success: false, message: 'Blood request not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        request,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Donor response to an emergency request (I CAN DONATE / NOT AVAILABLE)
   */
  static async respondToRequest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const { response: donorDecision } = req.body; // 'ACCEPT' or 'DECLINE'

      const request = await BloodRequest.findById(id);
      if (!request) {
        res.status(404).json({ success: false, message: 'Blood request not found.' });
        return;
      }

      const donorIdStr = req.user._id.toString();

      // Find donor in matched list or append
      const matchedIdx = request.matchedDonors.findIndex(
        (m) => m.donor.toString() === donorIdStr
      );

      if (donorDecision === 'ACCEPT') {
        // Calculate Time-To-Match (seconds from creation to acceptance)
        const timeToMatchSeconds = Math.round(
          (Date.now() - new Date(request.createdAt).getTime()) / 1000
        );

        request.status = 'DONOR_ACCEPTED';
        request.acceptedDonor = req.user._id;
        request.timeToMatchSeconds = timeToMatchSeconds;

        if (matchedIdx >= 0) {
          request.matchedDonors[matchedIdx].status = 'ACCEPTED';
          request.matchedDonors[matchedIdx].respondedAt = new Date();
        }

        await request.save();

        // Award +100 Emergency Response LifePoints to donor
        const donorUser = await User.findById(req.user._id);
        if (donorUser) {
          donorUser.lifePoints += 100;
          donorUser.stats.emergencyResponses = (donorUser.stats.emergencyResponses || 0) + 1;
          await donorUser.save();
        }

        // Notify patient and hospital
        await NotificationService.notify({
          userId: request.requester,
          type: 'REQUEST_ACCEPTED',
          title: '💚 Donor Accepted Your Request!',
          message: `A compatible ${request.bloodGroup} donor has accepted your emergency request for ${request.hospital.name}. Verification code: ${request.verificationCode}`,
          urgency: 'HIGH',
          requestId: request._id,
          link: `/patient/request/${request._id}`,
        });

        res.status(200).json({
          success: true,
          message: 'Thank you! You have accepted the emergency blood donation request.',
          request,
          verificationCode: request.verificationCode,
          hospitalInstructions: {
            hospitalName: request.hospital.name,
            address: request.hospital.address,
            contactNumber: request.hospital.contactNumber,
            verificationCode: request.verificationCode,
            nextStep: 'Please proceed to the hospital blood transfusion department and present your verification code.',
          },
        });
      } else {
        // DECLINE
        if (matchedIdx >= 0) {
          request.matchedDonors[matchedIdx].status = 'DECLINED';
          request.matchedDonors[matchedIdx].respondedAt = new Date();
          await request.save();
        }

        res.status(200).json({
          success: true,
          message: 'Response recorded. Thank you for notifying us.',
        });
      }
    } catch (err) {
      next(err);
    }
  }

  /**
   * Update request lifecycle status (DONOR_ARRIVED, DONATION_VERIFIED, COMPLETED, CANCELLED)
   */
  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const { status } = req.body;

      const request = await BloodRequest.findById(id);
      if (!request) {
        res.status(404).json({ success: false, message: 'Blood request not found.' });
        return;
      }

      request.status = status as RequestStatus;

      if (status === 'DONATION_VERIFIED' || status === 'COMPLETED') {
        request.verifiedBy = req.user._id;

        // If acceptedDonor exists, record verified donation and award +750 points & Hero badge
        if (request.acceptedDonor) {
          const certificateId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

          await Donation.create({
            donor: request.acceptedDonor,
            hospital: {
              name: request.hospital.name,
              address: request.hospital.address,
              hospitalUser: req.user._id,
            },
            bloodRequest: request._id,
            bloodGroup: request.bloodGroup,
            units: request.units || 1,
            date: new Date(),
            type: 'EMERGENCY',
            status: 'VERIFIED',
            verified: true,
            verifiedBy: req.user._id,
            verificationDate: new Date(),
            certificateId,
            lifePointsAwarded: 750,
          });

          // Award donor points and badges
          const donorUser = await User.findById(request.acceptedDonor);
          if (donorUser) {
            donorUser.lifePoints += 750;
            donorUser.stats.totalDonations = (donorUser.stats.totalDonations || 0) + 1;
            donorUser.stats.lastDonationDate = new Date();

            // Next eligible date: 90 days from today
            donorUser.eligibility = {
              isEligible: false,
              lastDonationDate: new Date(),
              nextEligibleDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
              reason: 'Cooling period (90 days required for erythrocyte recovery)',
            };

            // Award Emergency Hero badge if not present
            const hasHeroBadge = donorUser.badges.some((b) => b.id === 'emergency-hero');
            if (!hasHeroBadge) {
              donorUser.badges.push({
                id: 'emergency-hero',
                name: 'Emergency Hero',
                icon: 'HeartPulse',
                description: 'Successfully completed an emergency blood donation verified by hospital',
                earnedAt: new Date(),
              });
            }

            await donorUser.save();

            // Notify donor with reward notification
            await NotificationService.notify({
              userId: donorUser._id,
              type: 'DONATION_VERIFIED',
              title: '🎖️ Donation Verified & 750 LifePoints Awarded!',
              message: `Your emergency donation at ${request.hospital.name} has been verified. Certificate ID: ${certificateId}`,
              urgency: 'HIGH',
              link: `/donor/donations`,
            });
          }
        }
      }

      await request.save();

      res.status(200).json({
        success: true,
        message: `Request status updated to ${status}.`,
        request,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Progressive radius broadcast escalation
   */
  static async escalateRadius(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { newRadiusKm } = req.body;

      const request = await BloodRequest.findById(id);
      if (!request) {
        res.status(404).json({ success: false, message: 'Blood request not found.' });
        return;
      }

      const radius = newRadiusKm ? Number(newRadiusKm) : 35;

      const matchedDonors = await DonorMatchingService.matchDonors(
        {
          bloodGroup: request.bloodGroup,
          hospital: request.hospital,
          urgency: request.urgency,
        },
        radius,
        25
      );

      // Add newly discovered donors
      const existingDonorIds = new Set(request.matchedDonors.map((d) => d.donor.toString()));
      const newlyDiscovered: any[] = [];

      for (const m of matchedDonors) {
        if (!existingDonorIds.has(m.donorId)) {
          const newEntry = {
            donor: new mongoose.Types.ObjectId(m.donorId),
            score: m.matchScore,
            distanceKm: m.distanceKm,
            status: 'NOTIFIED' as const,
            notifiedAt: new Date(),
          };
          request.matchedDonors.push(newEntry);
          newlyDiscovered.push(m.donorId);
        }
      }

      await request.save();

      // Dispatch notifications to newly notified donors
      if (newlyDiscovered.length > 0) {
        await NotificationService.notifyEmergencyDonors(
          newlyDiscovered,
          request._id,
          request.bloodGroup,
          request.hospital.name,
          radius,
          request.urgency
        );
      }

      res.status(200).json({
        success: true,
        message: `Broadcast radius expanded to ${radius} km. Dispatched alerts to ${newlyDiscovered.length} additional donors.`,
        totalMatchedDonors: request.matchedDonors.length,
        newlyDiscoveredCount: newlyDiscovered.length,
      });
    } catch (err) {
      next(err);
    }
  }
}
