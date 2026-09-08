import { Request, Response, NextFunction } from 'express';
import { AIService } from '../services/aiService.js';
import { BloodCompatibilityService } from '../services/bloodCompatibilityService.js';

export class AIController {
  /**
   * AI Assistant Chat
   */
  static async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messages, context } = req.body;

      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ success: false, message: 'Messages array is required.' });
        return;
      }

      const response = await AIService.chat(messages, context);

      res.status(200).json({
        success: true,
        reply: response.reply,
        suggestedActions: response.suggestedActions,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * AI Blood Shortage Forecast Engine
   */
  static async predictShortage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const predictions = await AIService.predictShortages();

      res.status(200).json({
        success: true,
        predictions,
        generatedAt: new Date(),
        medicalDisclaimer: 'LifeLink AI shortage forecasting is a decision-support metric based on real-time inventory and historical emergency draw rates.',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Explain blood compatibility & match breakdown
   */
  static async explainMatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { donorGroup, recipientGroup } = req.body;

      if (!donorGroup || !recipientGroup) {
        res.status(400).json({ success: false, message: 'Both donorGroup and recipientGroup are required.' });
        return;
      }

      const explanation = BloodCompatibilityService.getCompatibilityExplanation(donorGroup, recipientGroup);
      const compatibleDonorsForRecipient = BloodCompatibilityService.getCompatibleDonorGroups(recipientGroup);
      const compatibleRecipientsForDonor = BloodCompatibilityService.getCompatibleRecipientGroups(donorGroup);

      res.status(200).json({
        success: true,
        donorGroup,
        recipientGroup,
        isCompatible: explanation.isCompatible,
        compatibilityLevel: explanation.compatibilityLevel,
        reason: explanation.reason,
        compatibleDonorsForRecipient,
        compatibleRecipientsForDonor,
      });
    } catch (err) {
      next(err);
    }
  }
}
