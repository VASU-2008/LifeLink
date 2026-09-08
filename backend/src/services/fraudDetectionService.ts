import { FraudLog } from '../models/FraudLog.js';
import { BloodRequest } from '../models/BloodRequest.js';

export class FraudDetectionService {
  /**
   * Evaluate risk for a newly created blood request
   */
  static async evaluateBloodRequest(
    userId: string,
    units: number,
    hospitalName: string,
    urgency: string
  ): Promise<{ isSuspicious: boolean; riskScore: number; reason?: string }> {
    let riskScore = 0;
    const reasons: string[] = [];

    // 1. Check recent requests from this user in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRequestsCount = await BloodRequest.countDocuments({
      requester: userId,
      createdAt: { $gte: oneDayAgo },
    });

    if (recentRequestsCount >= 4) {
      riskScore += 50;
      reasons.push(`High request frequency: ${recentRequestsCount + 1} requests in 24 hours.`);
    } else if (recentRequestsCount >= 2) {
      riskScore += 25;
      reasons.push(`Multiple emergency requests created in short interval.`);
    }

    // 2. Unusually high volume of blood units in single request
    if (units > 8) {
      riskScore += 35;
      reasons.push(`Abnormally high requested units (${units} units). Requires hospital verification.`);
    } else if (units > 5) {
      riskScore += 15;
    }

    // 3. Flag and record if risk score exceeds 65%
    const isSuspicious = riskScore >= 65;
    if (isSuspicious) {
      await FraudLog.create({
        user: userId,
        entityType: 'REQUEST',
        riskScore,
        reason: reasons.join('; '),
        details: { units, hospitalName, urgency, recentRequestsCount },
        flaggedAt: new Date(),
      });
      console.warn(`[FraudDetection] Flagged suspicious request (Risk Score: ${riskScore}%): ${reasons.join('; ')}`);
    }

    return {
      isSuspicious,
      riskScore,
      reason: reasons.join('; ') || undefined,
    };
  }
}
