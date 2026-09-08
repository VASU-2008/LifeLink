import { apiClient } from './apiClient';
import { BloodRequest, RequestUrgency } from '../types';

export interface CreateRequestPayload {
  patientName: string;
  bloodGroup: string;
  units: number;
  hospital: {
    name: string;
    address: string;
    city?: string;
    contactNumber?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  urgency: RequestUrgency;
  requiredBy?: string;
  additionalInfo?: string;
}

export const requestService = {
  async createRequest(payload: CreateRequestPayload): Promise<{ success: boolean; request: BloodRequest; matchSummary: any }> {
    return apiClient('/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getRequests(params?: { status?: string; urgency?: string; bloodGroup?: string }): Promise<{ success: boolean; requests: BloodRequest[] }> {
    const query = new URLSearchParams(params as any).toString();
    return apiClient(`/requests${query ? `?${query}` : ''}`);
  },

  async getRequestById(id: string): Promise<{ success: boolean; request: BloodRequest }> {
    return apiClient(`/requests/${id}`);
  },

  async respondToRequest(id: string, response: 'ACCEPT' | 'DECLINE'): Promise<{ success: boolean; message: string; verificationCode?: string; hospitalInstructions?: any }> {
    return apiClient(`/requests/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  },

  async updateStatus(id: string, status: string): Promise<{ success: boolean; message: string; request: BloodRequest }> {
    return apiClient(`/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async escalateRadius(id: string, newRadiusKm: number): Promise<{ success: boolean; message: string; totalMatchedDonors: number }> {
    return apiClient(`/requests/${id}/broadcast-escalate`, {
      method: 'POST',
      body: JSON.stringify({ newRadiusKm }),
    });
  },
};
