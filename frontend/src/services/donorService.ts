import { apiClient } from './apiClient';
import { User, BloodRequest, Donation, DonorRank } from '../types';

export const donorService = {
  async getDashboard(): Promise<{
    success: boolean;
    donor: User & { communityRank: number };
    recentDonations: Donation[];
    nearbyEmergencyRequests: any[];
  }> {
    return apiClient('/donors/me/dashboard');
  },

  async toggleAvailability(availability: boolean): Promise<{ success: boolean; availability: boolean }> {
    return apiClient('/donors/me/availability', {
      method: 'PUT',
      body: JSON.stringify({ availability }),
    });
  },

  async updateProfile(profileData: Partial<User>): Promise<{ success: boolean; user: User }> {
    return apiClient('/donors/me/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async getLeaderboard(): Promise<{ success: boolean; leaderboard: DonorRank[] }> {
    return apiClient('/donors/leaderboard');
  },

  async searchMatches(bloodGroup: string, lat?: number, lng?: number, radiusKm?: number): Promise<{ success: boolean; totalMatches: number; matches: any[] }> {
    const params = new URLSearchParams({
      bloodGroup,
      ...(lat && { lat: String(lat) }),
      ...(lng && { lng: String(lng) }),
      ...(radiusKm && { radiusKm: String(radiusKm) }),
    });
    return apiClient(`/donors/matches?${params.toString()}`);
  },
};
