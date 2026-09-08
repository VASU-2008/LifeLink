import mongoose from 'mongoose';
import { User, IUser } from '../models/User.js';
import { IBloodRequest } from '../models/BloodRequest.js';
import { BloodCompatibilityService, BloodGroup } from './bloodCompatibilityService.js';
import { MapService, Coordinates } from './mapService.js';

export interface DonorMatchResult {
  donorId: string;
  donorName: string;
  bloodGroup: string;
  distanceKm: number;
  distanceFormatted: string;
  matchScore: number;
  compatibilityLevel: 'EXACT_MATCH' | 'COMPATIBLE_ALTERNATIVE' | 'INCOMPATIBLE';
  availability: boolean;
  isEligible: boolean;
  eligibilityReason: string;
  responseProbability: number;
  scoreBreakdown: {
    compatibilityScore: number; // Max 40
    distanceScore: number;      // Max 25
    availabilityScore: number;  // Max 15
    eligibilityScore: number;   // Max 10
    responseScore: number;      // Max 10
  };
}

export class DonorMatchingService {
  /**
   * Broadcast radii in kilometers by progressive escalation level
   */
  public static readonly BROADCAST_RADII = {
    LEVEL_1: 5,   // 5 km
    LEVEL_2: 10,  // 10 km
    LEVEL_3: 25,  // 25 km
    LEVEL_4: 50,  // Regional/City wide
  };

  /**
   * Match and rank compatible donors for an emergency blood request
   */
  static async matchDonors(
    request: IBloodRequest | {
      bloodGroup: string;
      hospital: { coordinates: Coordinates; city?: string };
      urgency?: string;
    },
    maxRadiusKm = 50,
    limit = 20
  ): Promise<DonorMatchResult[]> {
    const targetBloodGroup = request.bloodGroup as BloodGroup;
    const hospitalCoords = request.hospital.coordinates;

    // 1. Get medically compatible blood groups
    const compatibleGroups = BloodCompatibilityService.getCompatibleDonorGroups(targetBloodGroup);
    if (compatibleGroups.length === 0) return [];

    // 2. Fetch all donors with compatible blood groups from database
    const donors = await User.find({
      role: 'DONOR',
      bloodGroup: { $in: compatibleGroups },
    }).lean();

    const results: DonorMatchResult[] = [];

    for (const donor of donors) {
      const donorCoords = donor.location?.coordinates || { lat: 28.6139, lng: 77.2090 };
      const distanceKm = MapService.calculateDistanceKm(hospitalCoords, donorCoords);

      // Skip donors outside max search radius
      if (distanceKm > maxRadiusKm) continue;

      // Calculate component scores
      // 1. Blood Compatibility Score (Max 40 points)
      let compatibilityScore = 0;
      let compLevel: 'EXACT_MATCH' | 'COMPATIBLE_ALTERNATIVE' | 'INCOMPATIBLE' = 'INCOMPATIBLE';

      if (donor.bloodGroup === targetBloodGroup) {
        compatibilityScore = 40; // Exact match
        compLevel = 'EXACT_MATCH';
      } else if (compatibleGroups.includes(donor.bloodGroup as BloodGroup)) {
        compatibilityScore = 32; // Compatible alternative
        compLevel = 'COMPATIBLE_ALTERNATIVE';
      }

      // 2. Distance Score (Max 25 points) - inversely proportional to distance
      let distanceScore = 0;
      if (distanceKm <= 3) {
        distanceScore = 25;
      } else if (distanceKm <= 7) {
        distanceScore = 20;
      } else if (distanceKm <= 15) {
        distanceScore = 14;
      } else if (distanceKm <= 25) {
        distanceScore = 8;
      } else {
        distanceScore = Math.max(2, 25 - distanceKm * 0.4);
      }

      // 3. Availability Score (Max 15 points)
      const availabilityScore = donor.availability ? 15 : 0;

      // 4. Medical Eligibility Score (Max 10 points)
      const isEligible = donor.eligibility?.isEligible !== false;
      const eligibilityScore = isEligible ? 10 : 0;

      // 5. Response Probability Score (Max 10 points)
      const responseRate = donor.stats?.responseRate || 80;
      const responseScore = Math.round((responseRate / 100) * 10);

      // Total Match Score (0 - 100)
      const totalScore = Math.min(
        100,
        Math.round(
          compatibilityScore +
          distanceScore +
          availabilityScore +
          eligibilityScore +
          responseScore
        )
      );

      results.push({
        donorId: (donor._id as mongoose.Types.ObjectId).toString(),
        donorName: donor.name,
        bloodGroup: donor.bloodGroup,
        distanceKm,
        distanceFormatted: MapService.formatSafeDistance(distanceKm),
        matchScore: totalScore,
        compatibilityLevel: compLevel,
        availability: donor.availability,
        isEligible,
        eligibilityReason: donor.eligibility?.reason || (isEligible ? 'Eligible to donate' : 'Cooling period active'),
        responseProbability: responseRate,
        scoreBreakdown: {
          compatibilityScore,
          distanceScore,
          availabilityScore,
          eligibilityScore,
          responseScore,
        },
      });
    }

    // Sort descending by match score and limit
    results.sort((a, b) => b.matchScore - a.matchScore);
    return results.slice(0, limit);
  }
}
