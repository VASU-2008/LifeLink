import mongoose, { Document, Schema } from 'mongoose';

export type DonationStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'CANCELLED';
export type DonationType = 'EMERGENCY' | 'VOLUNTARY' | 'CAMP';

export interface IDonation extends Document {
  _id: mongoose.Types.ObjectId;
  donor: mongoose.Types.ObjectId;
  hospital: {
    name: string;
    address: string;
    hospitalUser?: mongoose.Types.ObjectId;
  };
  bloodRequest?: mongoose.Types.ObjectId;
  bloodGroup: string;
  units: number;
  date: Date;
  type: DonationType;
  status: DonationStatus;
  verified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  verificationDate?: Date;
  certificateId: string;
  lifePointsAwarded: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema: Schema<IDonation> = new Schema(
  {
    donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      hospitalUser: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    bloodRequest: { type: Schema.Types.ObjectId, ref: 'BloodRequest' },
    bloodGroup: { type: String, required: true },
    units: { type: Number, default: 1, min: 1 },
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['EMERGENCY', 'VOLUNTARY', 'CAMP'],
      default: 'EMERGENCY',
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED'],
      default: 'VERIFIED',
    },
    verified: { type: Boolean, default: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verificationDate: { type: Date, default: Date.now },
    certificateId: { type: String, required: true, unique: true },
    lifePointsAwarded: { type: Number, default: 500 },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

DonationSchema.index({ donor: 1, date: -1 });

export const Donation = mongoose.model<IDonation>('Donation', DonationSchema);
