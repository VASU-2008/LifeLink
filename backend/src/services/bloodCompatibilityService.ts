/**
 * LifeLink Blood Compatibility Engine
 * 
 * Medically validated ABO and Rh(D) antigen compatibility rules for Whole Blood & Packed Red Blood Cells (RBC).
 * 
 * Standards Reference:
 * - American Association of Blood Banks (AABB) Standards for Blood Banks and Transfusion Services
 * - WHO Guidelines on Good Manufacturing Practices for Blood Establishments
 * 
 * Medical Rule Summary:
 * - O- is the Universal Donor for Red Blood Cells (no A, B, or Rh antigens).
 * - AB+ is the Universal Recipient for Red Blood Cells (has A, B, and Rh antigens, no antibodies).
 * - Rh-negative patients should receive Rh-negative blood to prevent anti-D alloimmunization.
 * - Rh-positive patients can safely receive either Rh-positive or Rh-negative blood.
 */

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

// Recipient (Key) -> List of Compatible Donor Blood Groups (Value)
export const RBC_COMPATIBILITY_MATRIX: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

// Donor (Key) -> List of Compatible Recipient Blood Groups (Value)
export const DONOR_RECIPIENT_MATRIX: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // Universal recipient only
};

export class BloodCompatibilityService {
  /**
   * Determine compatible donor blood groups for a given patient blood group.
   */
  static getCompatibleDonorGroups(recipientGroup: BloodGroup | string): BloodGroup[] {
    const validGroup = recipientGroup.toUpperCase() as BloodGroup;
    return RBC_COMPATIBILITY_MATRIX[validGroup] || [];
  }

  /**
   * Determine compatible recipient blood groups that can receive from a given donor blood group.
   */
  static getCompatibleRecipientGroups(donorGroup: BloodGroup | string): BloodGroup[] {
    const validGroup = donorGroup.toUpperCase() as BloodGroup;
    return DONOR_RECIPIENT_MATRIX[validGroup] || [];
  }

  /**
   * Check if a donor blood group is compatible with a recipient blood group.
   */
  static isCompatible(donorGroup: string, recipientGroup: string): boolean {
    const dGroup = donorGroup.toUpperCase() as BloodGroup;
    const rGroup = recipientGroup.toUpperCase() as BloodGroup;

    const compatibleList = RBC_COMPATIBILITY_MATRIX[rGroup];
    if (!compatibleList) return false;
    return compatibleList.includes(dGroup);
  }

  /**
   * Return a medically sound explanation of compatibility.
   */
  static getCompatibilityExplanation(donorGroup: string, recipientGroup: string): {
    isCompatible: boolean;
    compatibilityLevel: 'EXACT_MATCH' | 'COMPATIBLE_ALTERNATIVE' | 'INCOMPATIBLE';
    reason: string;
  } {
    const dGroup = donorGroup.toUpperCase() as BloodGroup;
    const rGroup = recipientGroup.toUpperCase() as BloodGroup;

    if (dGroup === rGroup) {
      return {
        isCompatible: true,
        compatibilityLevel: 'EXACT_MATCH',
        reason: `Exact blood group match (${dGroup}). Optimal for transfusion.`,
      };
    }

    const compatible = this.isCompatible(dGroup, rGroup);
    if (compatible) {
      const isUniversal = dGroup === 'O-';
      return {
        isCompatible: true,
        compatibilityLevel: 'COMPATIBLE_ALTERNATIVE',
        reason: isUniversal
          ? `O- is a universal RBC donor and is compatible with ${rGroup}.`
          : `Donor group ${dGroup} red blood cells do not carry incompatible antigens for recipient ${rGroup}.`,
      };
    }

    return {
      isCompatible: false,
      compatibilityLevel: 'INCOMPATIBLE',
      reason: `Donor ${dGroup} is incompatible with recipient ${rGroup}. Risk of hemolytic transfusion reaction due to incompatible ABO/Rh antigens.`,
    };
  }
}
