import { apiClient } from './apiClient';
import { ShortagePrediction } from '../types';

export const aiService = {
  async chat(messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>, context?: any): Promise<{
    success: boolean;
    reply: string;
    suggestedActions?: string[];
  }> {
    return apiClient('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, context }),
    });
  },

  async predictShortage(): Promise<{
    success: boolean;
    predictions: ShortagePrediction[];
    generatedAt: string;
    medicalDisclaimer: string;
  }> {
    return apiClient('/ai/predict-shortage');
  },

  async explainMatch(donorGroup: string, recipientGroup: string): Promise<{
    success: boolean;
    isCompatible: boolean;
    compatibilityLevel: 'EXACT_MATCH' | 'COMPATIBLE_ALTERNATIVE' | 'INCOMPATIBLE';
    reason: string;
    compatibleDonorsForRecipient: string[];
    compatibleRecipientsForDonor: string[];
  }> {
    return apiClient('/ai/match', {
      method: 'POST',
      body: JSON.stringify({ donorGroup, recipientGroup }),
    });
  },
};
