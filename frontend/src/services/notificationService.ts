import { apiClient } from './apiClient';
import { NotificationItem } from '../types';

export const notificationService = {
  async getNotifications(): Promise<{
    success: boolean;
    unreadCount: number;
    notifications: NotificationItem[];
  }> {
    return apiClient('/notifications');
  },

  async markAsRead(id: string): Promise<{ success: boolean; notification: NotificationItem }> {
    return apiClient(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    return apiClient('/notifications/read-all', {
      method: 'PUT',
    });
  },
};
