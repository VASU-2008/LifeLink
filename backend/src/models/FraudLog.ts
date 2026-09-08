import mongoose, { Document, Schema } from 'mongoose';

export interface IFraudLog extends Document {
  _id: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  entityType: 'REQUEST' | 'DONOR' | 'HOSPITAL' | 'AUTH';
  entityId?: string;
  riskScore: number;
  reason: string;
  details?: any;
  resolved: boolean;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  flaggedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FraudLogSchema: Schema<IFraudLog> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    entityType: {
      type: String,
      enum: ['REQUEST', 'DONOR', 'HOSPITAL', 'AUTH'],
      required: true,
    },
    entityId: { type: String },
    riskScore: { type: Number, required: true },
    reason: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    resolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
    flaggedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

FraudLogSchema.index({ resolved: 1, riskScore: -1 });

export const FraudLog = mongoose.model<IFraudLog>('FraudLog', FraudLogSchema);
