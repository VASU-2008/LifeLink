import { apiClient } from './apiClient';
import { User } from '../types';

export const adminService = {
  async getMetrics(): Promise<{
    success: boolean;
    metrics: {
      totalUsers: number;
      totalDonors: number;
      totalHospitals: number;
      totalBloodBanks: number;
      pendingVerifications: number;
      activeEmergencies: number;
      completedRequests: number;
      totalDonations: number;
      fraudAlertsCount: number;
      avgTimeToMatchSeconds: number;
      avgTimeToMatchFormatted: string;
      totalBloodUnitsAvailable: number;
    };
  }> {
    return apiClient('/admin/metrics');
  },

  async getUsers(params?: { role?: string; verified?: boolean; search?: string }): Promise<{
    success: boolean;
    count: number;
    users: User[];
  }> {
    const query = new URLSearchParams(params as any).toString();
    return apiClient(`/admin/users${query ? `?${query}` : ''}`);
  },

  async verifyUser(id: string, verified: boolean): Promise<{ success: boolean; message: string; user: User }> {
    return apiClient(`/admin/users/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ verified }),
    });
  },

  async getFraudAlerts(): Promise<{ success: boolean; count: number; logs: any[] }> {
    return apiClient('/admin/fraud-alerts');
  },

  async resolveFraudAlert(id: string, resolved: boolean): Promise<{ success: boolean; message: string }> {
    return apiClient(`/admin/fraud-alerts/${id}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolved }),
    });
  },

  async getAnalytics(): Promise<{
    success: boolean;
    bloodGroupComparison: Array<{ bloodGroup: string; demandUnits: number; availableUnits: number; deficit: number }>;
    urgencyDistribution: Array<{ _id: string; count: number }>;
  }> {
    return apiClient('/admin/analytics');
  },
};
