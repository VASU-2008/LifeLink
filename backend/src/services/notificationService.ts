import mongoose from 'mongoose';
import { Notification, NotificationType } from '../models/Notification.js';

export interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  urgency?: 'CRITICAL' | 'HIGH' | 'NORMAL';
  requestId?: string | mongoose.Types.ObjectId;
  link?: string;
  metadata?: any;
}

export class NotificationService {
  /**
   * Create an in-app notification and trigger mock push/SMS/email handlers
   */
  static async notify(params: CreateNotificationParams) {
    try {
      const notif = await Notification.create({
        user: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        urgency: params.urgency || 'NORMAL',
        requestId: params.requestId,
        link: params.link,
        metadata: params.metadata,
        status: 'UNREAD',
      });

      // Dispatch to external notification channels (Mock/Telemetry for development)
      this.dispatchExternalChannels(params);

      return notif;
    } catch (err) {
      console.error('[NotificationService] Error creating notification:', err);
      return null;
    }
  }

  /**
   * Batch notify multiple donors for an emergency request
   */
  static async notifyEmergencyDonors(
    donorIds: (string | mongoose.Types.ObjectId)[],
    requestId: string | mongoose.Types.ObjectId,
    bloodGroup: string,
    hospitalName: string,
    distanceKm: number,
    urgency: 'CRITICAL' | 'URGENT' | 'NORMAL'
  ) {
    const notifications = donorIds.map((donorId) => ({
      user: donorId,
      type: 'EMERGENCY_REQUEST' as NotificationType,
      title: `🚨 Urgent ${bloodGroup} Blood Needed!`,
      message: `${hospitalName} requires ${bloodGroup} blood urgently. You are a compatible donor (${distanceKm.toFixed(1)} km away).`,
      urgency: urgency === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      requestId,
      link: `/donor/requests`,
      status: 'UNREAD',
    }));

    try {
      await Notification.insertMany(notifications);
      console.log(`[NotificationService] Dispatched ${notifications.length} emergency alerts for ${bloodGroup} blood.`);
    } catch (err) {
      console.error('[NotificationService] Batch emergency notification failed:', err);
    }
  }

  private static dispatchExternalChannels(params: CreateNotificationParams) {
    const isCritical = params.urgency === 'CRITICAL';
    const tag = isCritical ? '🚨 [HIGH-PRIORITY SMS & PUSH]' : '🔔 [NOTIFICATION DISPATCH]';

    console.log(`${tag} To User: ${params.userId} | ${params.title} - ${params.message}`);
  }
}
