import { apiClient } from './apiClient';
import { BloodInventoryItem, BloodGroup } from '../types';

export const bloodBankService = {
  async getBloodBanks(): Promise<{ success: boolean; bloodBanks: any[] }> {
    return apiClient('/bloodbanks');
  },

  async getInventory(bloodBankId?: string): Promise<{
    success: boolean;
    summary: Record<string, number>;
    totalBatches: number;
    batches: BloodInventoryItem[];
  }> {
    const endpoint = bloodBankId ? `/bloodbanks/${bloodBankId}/inventory` : '/bloodbanks/inventory';
    return apiClient(endpoint);
  },

  async addInventory(payload: {
    bloodGroup: BloodGroup;
    units: number;
    collectionDate?: string;
    expiryDate?: string;
    storageTemperature?: string;
  }): Promise<{ success: boolean; message: string; item: BloodInventoryItem }> {
    return apiClient('/bloodbanks/inventory', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateInventory(id: string, updates: Partial<BloodInventoryItem>): Promise<{ success: boolean; item: BloodInventoryItem }> {
    return apiClient(`/bloodbanks/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteInventory(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient(`/bloodbanks/inventory/${id}`, {
      method: 'DELETE',
    });
  },

  async getShortageAlerts(): Promise<{
    success: boolean;
    stockSummary: Record<string, number>;
    shortageAlerts: any[];
    expiringBatches: BloodInventoryItem[];
  }> {
    return apiClient('/bloodbanks/alerts/shortages');
  },
};
