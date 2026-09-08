import { BloodInventory, IBloodInventory } from '../models/BloodInventory.js';
import { BloodRequest, IBloodRequest } from '../models/BloodRequest.js';

export interface ShortagePrediction {
  bloodGroup: string;
  currentUnits: number;
  expectedDemand: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskScore: number; // 0 - 100 percentage
  riskLevel: 'SAFE' | 'WATCH' | 'HIGH' | 'CRITICAL';
  daysOfSupplyLeft: number;
  recommendation: string;
  factors: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AIService {
  private static readonly MEDICAL_DISCLAIMER =
    'Disclaimer: LifeLink AI is an emergency decision-support tool. It does not provide medical diagnosis or replace qualified healthcare professionals.';

  /**
   * AI Assistant Chat for triage guidance, donor questions, and emergency routing
   */
  static async chat(messages: ChatMessage[], context?: any): Promise<{ reply: string; suggestedActions?: string[] }> {
    const apiKey = process.env.GEMINI_API_KEY;
    const latestUserMessage = messages[messages.length - 1]?.content || '';
    const lower = latestUserMessage.toLowerCase();

    // If API Key exists, we can call Gemini API
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `You are the LifeLink AI Emergency Blood Assistant. 
                      Rules:
                      - Never diagnose medical conditions or give definitive medical prescriptions.
                      - Help users understand blood compatibility, find donation centers, and navigate the emergency request process.
                      - Maintain a calm, empathetic, and urgent tone for emergency situations.
                      - Always include brief medical safety reminder when appropriate.
                      
                      Context: ${JSON.stringify(context || {})}
                      
                      Conversation:
                      ${messages.map((m) => `${m.role}: ${m.content}`).join('\n')}
                      
                      Respond concisely and helpfully.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = (await response.json()) as any;
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return {
              reply: `${reply}\n\n*${this.MEDICAL_DISCLAIMER}*`,
              suggestedActions: this.getSuggestedActions(lower),
            };
          }
        }
      } catch (err) {
        console.warn('[AIService] Gemini API call failed, falling back to deterministic response:', err);
      }
    }

    // High Quality Deterministic Emergency Response Engine
    if (lower.includes('need') || lower.includes('emergency') || lower.includes('urgent') || lower.includes('request blood')) {
      return {
        reply: `🚨 **Emergency Blood Assistance**\n\nI can help you dispatch an emergency blood broadcast right now.\n\n1. Go to **Create Emergency Request**\n2. Select the patient's blood group and hospital\n3. Our progressive matching engine will immediately notify verified compatible donors within a 5-25 km radius.\n\n*${this.MEDICAL_DISCLAIMER}*`,
        suggestedActions: ['Create Emergency Request', 'View Compatible Donors', 'Check Blood Bank Stock'],
      };
    }

    if (lower.includes('donate') || lower.includes('eligib') || lower.includes('where can i')) {
      return {
        reply: `🩸 **Blood Donation Eligibility & Guidelines**\n\nTo donate whole blood:\n- **Age**: 18–65 years old\n- **Weight**: Minimum 45–50 kg\n- **Interval**: At least 90 days (3 months) since your last whole blood donation\n- **Health**: Feeling well, healthy hemoglobin levels (≥12.5 g/dL), no active infections\n\nYou can toggle your availability on your **Donor Dashboard** to receive urgent nearby requests.\n\n*${this.MEDICAL_DISCLAIMER}*`,
        suggestedActions: ['Check My Eligibility', 'Find Nearby Donation Centers', 'Update Donor Profile'],
      };
    }

    if (lower.includes('compatible') || lower.includes('o-') || lower.includes('ab+') || lower.includes('universal')) {
      return {
        reply: `🧬 **Blood Compatibility Summary**\n\n- **O- (O Negative)**: Universal Red Blood Cell donor. Can give red blood cells to any recipient, but can only receive O- blood.\n- **AB+ (AB Positive)**: Universal Red Blood Cell recipient. Can receive RBCs from any blood group.\n- **Rh Rule**: Rh-negative individuals should receive Rh-negative blood to prevent immunization.\n\n*${this.MEDICAL_DISCLAIMER}*`,
        suggestedActions: ['View Blood Compatibility Matrix', 'Find O- Donors', 'Find AB+ Donors'],
      };
    }

    return {
      reply: `Hello! I am your LifeLink AI Assistant. I can help you with:\n\n• Creating rapid emergency blood requests\n• Finding verified nearby blood donors and blood banks\n• Checking blood compatibility rules & donor eligibility criteria\n• Tracking emergency blood broadcast status\n\nHow can I support your emergency or donation request today?\n\n*${this.MEDICAL_DISCLAIMER}*`,
      suggestedActions: ['Create Emergency Request', 'Check Blood Bank Inventory', 'Become a Donor'],
    };
  }

  private static getSuggestedActions(text: string): string[] {
    if (text.includes('urgent') || text.includes('need') || text.includes('emergency')) {
      return ['Create Emergency Request', 'Contact Hospital', 'Check Blood Banks'];
    }
    return ['Find Donors', 'Check Inventory', 'View FAQs'];
  }

  /**
   * Blood Shortage Prediction Algorithm (AI Analytics)
   */
  static async predictShortages(): Promise<ShortagePrediction[]> {
    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const predictions: ShortagePrediction[] = [];

    // Aggregate inventory count by blood group
    const inventory = await BloodInventory.aggregate([
      { $match: { status: 'AVAILABLE' } },
      { $group: { _id: '$bloodGroup', totalUnits: { $sum: '$units' } } },
    ]);

    const stockMap: Record<string, number> = {};
    for (const item of inventory) {
      stockMap[item._id] = item.totalUnits;
    }

    // Historical demand weight factor
    const demandWeights: Record<string, { baselineDailyUsage: number; rarityRisk: number }> = {
      'O-': { baselineDailyUsage: 4.5, rarityRisk: 0.95 },
      'O+': { baselineDailyUsage: 8.0, rarityRisk: 0.60 },
      'A-': { baselineDailyUsage: 2.5, rarityRisk: 0.85 },
      'A+': { baselineDailyUsage: 6.5, rarityRisk: 0.50 },
      'B-': { baselineDailyUsage: 2.0, rarityRisk: 0.80 },
      'B+': { baselineDailyUsage: 5.5, rarityRisk: 0.45 },
      'AB-': { baselineDailyUsage: 1.2, rarityRisk: 0.90 },
      'AB+': { baselineDailyUsage: 2.8, rarityRisk: 0.35 },
    };

    for (const group of allGroups) {
      const currentUnits = stockMap[group] || 0;
      const weight = demandWeights[group] || { baselineDailyUsage: 3.0, rarityRisk: 0.5 };
      const daysOfSupply = currentUnits > 0 ? Math.round((currentUnits / weight.baselineDailyUsage) * 10) / 10 : 0;

      let riskScore = 0;
      let expectedDemand: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'MODERATE';
      let riskLevel: 'SAFE' | 'WATCH' | 'HIGH' | 'CRITICAL' = 'SAFE';
      let recommendation = `Maintain regular inventory monitoring for ${group}.`;
      const factors: string[] = [];

      if (daysOfSupply < 2 || currentUnits <= 3) {
        riskScore = Math.min(98, Math.round(85 + weight.rarityRisk * 12));
        expectedDemand = 'CRITICAL';
        riskLevel = 'CRITICAL';
        recommendation = `🚨 CRITICAL DEFICIT: Immediately broadcast high-priority donation appeal for ${group} and restrict elective surgical allocations.`;
        factors.push(`Severe inventory depletion (<2 days supply)`);
        factors.push(`High emergency transfusion draw rate`);
      } else if (daysOfSupply < 5 || currentUnits <= 10) {
        riskScore = Math.min(84, Math.round(60 + weight.rarityRisk * 20));
        expectedDemand = 'HIGH';
        riskLevel = 'HIGH';
        recommendation = `Schedule targeted mobile blood drive or notify pre-registered ${group} donors.`;
        factors.push(`Low safety buffer (<5 days supply)`);
        factors.push(`Rarity coefficient: ${(weight.rarityRisk * 100).toFixed(0)}%`);
      } else if (daysOfSupply < 9) {
        riskScore = Math.round(35 + weight.rarityRisk * 15);
        expectedDemand = 'MODERATE';
        riskLevel = 'WATCH';
        recommendation = `Optimal stock range. Refresh inventory before approaching expiry thresholds.`;
        factors.push(`Stable baseline consumption`);
      } else {
        riskScore = Math.round(10 + weight.rarityRisk * 10);
        expectedDemand = 'LOW';
        riskLevel = 'SAFE';
        recommendation = `Healthy reserve. Ensure stock rotation to avoid batch expirations.`;
        factors.push(`Adequate supply buffer (>9 days)`);
      }

      predictions.push({
        bloodGroup: group,
        currentUnits,
        expectedDemand,
        riskScore,
        riskLevel,
        daysOfSupplyLeft: daysOfSupply,
        recommendation,
        factors,
      });
    }

    // Sort by riskScore descending
    return predictions.sort((a, b) => b.riskScore - a.riskScore);
  }
}
