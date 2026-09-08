import { apiClient } from './apiClient';
import { Donation } from '../types';

export const donationService = {
  async getMyDonations(): Promise<{ success: boolean; count: number; donations: Donation[] }> {
    return apiClient('/donations/my-donations');
  },

  async getDonationById(id: string): Promise<{ success: boolean; donation: Donation }> {
    return apiClient(`/donations/${id}`);
  },

  async verifyDonation(payload: {
    verificationCode?: string;
    bloodRequestId?: string;
    donorId?: string;
    bloodGroup?: string;
    units?: number;
    notes?: string;
  }): Promise<{ success: boolean; message: string; donation: Donation; certificateId: string }> {
    return apiClient('/donations/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
