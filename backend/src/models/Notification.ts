import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'EMERGENCY_REQUEST'
  | 'DONOR_MATCH'
  | 'REQUEST_ACCEPTED'
  | 'DONOR_ARRIVED'
  | 'DONATION_VERIFIED'
  | 'SHORTAGE_ALERT'
  | 'SYSTEM'
  | 'REWARD';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  urgency: 'CRITICAL' | 'HIGH' | 'NORMAL';
  requestId?: mongoose.Types.ObjectId;
  link?: string;
  status: 'UNREAD' | 'READ';
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'EMERGENCY_REQUEST',
        'DONOR_MATCH',
        'REQUEST_ACCEPTED',
        'DONOR_ARRIVED',
        'DONATION_VERIFIED',
        'SHORTAGE_ALERT',
        'SYSTEM',
        'REWARD',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    urgency: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'NORMAL'],
      default: 'NORMAL',
    },
    requestId: { type: Schema.Types.ObjectId, ref: 'BloodRequest' },
    link: { type: String },
    status: {
      type: String,
      enum: ['UNREAD', 'READ'],
      default: 'UNREAD',
    },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ user: 1, status: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
