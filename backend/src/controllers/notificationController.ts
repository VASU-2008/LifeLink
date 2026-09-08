import { Response, NextFunction } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';

export class NotificationController {
  /**
   * Get authenticated user's notifications
   */
  static async getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();

      const unreadCount = await Notification.countDocuments({
        user: req.user._id,
        status: 'UNREAD',
      });

      res.status(200).json({
        success: true,
        unreadCount,
        notifications,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const notif = await Notification.findOneAndUpdate(
        { _id: id, user: req.user?._id },
        { status: 'READ' },
        { new: true }
      );

      if (!notif) {
        res.status(404).json({ success: false, message: 'Notification not found' });
        return;
      }

      res.status(200).json({
        success: true,
        notification: notif,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Mark all user notifications as read
   */
  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      await Notification.updateMany({ user: req.user._id, status: 'UNREAD' }, { status: 'READ' });

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
      });
    } catch (err) {
      next(err);
    }
  }
}
