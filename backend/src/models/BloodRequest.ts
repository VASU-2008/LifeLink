import mongoose, { Document, Schema } from 'mongoose';

export type RequestUrgency = 'CRITICAL' | 'URGENT' | 'NORMAL';
export type RequestStatus =
  | 'REQUESTED'
  | 'MATCHED'
  | 'DONOR_ACCEPTED'
  | 'DONOR_ARRIVED'
  | 'DONATION_VERIFIED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface IMatchedDonor {
  donor: mongoose.Types.ObjectId;
  score: number;
  distanceKm: number;
  status: 'NOTIFIED' | 'ACCEPTED' | 'DECLINED' | 'ARRIVED' | 'DONATED';
  notifiedAt: Date;
  respondedAt?: Date;
}

export interface IBloodRequest extends Document {
  _id: mongoose.Types.ObjectId;
  patientName: string;
  requester: mongoose.Types.ObjectId;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  units: number;
  hospital: {
    name: string;
    address: string;
    city: string;
    contactNumber: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    hospitalUser?: mongoose.Types.ObjectId;
  };
  urgency: RequestUrgency;
  status: RequestStatus;
  requiredBy: Date;
  additionalInfo?: string;
  matchedDonors: IMatchedDonor[];
  acceptedDonor?: mongoose.Types.ObjectId;
  verifiedBy?: mongoose.Types.ObjectId;
  verificationCode?: string;
  timeToMatchSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BloodRequestSchema: Schema<IBloodRequest> = new Schema(
  {
    patientName: { type: String, required: true, trim: true },
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    units: { type: Number, required: true, min: 1, max: 20 },
    hospital: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true, default: 'Metropolis' },
      contactNumber: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
      hospitalUser: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    urgency: {
      type: String,
      enum: ['CRITICAL', 'URGENT', 'NORMAL'],
      default: 'NORMAL',
    },
    status: {
      type: String,
      enum: [
        'REQUESTED',
        'MATCHED',
        'DONOR_ACCEPTED',
        'DONOR_ARRIVED',
        'DONATION_VERIFIED',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'REQUESTED',
    },
    requiredBy: { type: Date, required: true },
    additionalInfo: { type: String },
    matchedDonors: [
      {
        donor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        score: { type: Number, required: true },
        distanceKm: { type: Number, required: true },
        status: {
          type: String,
          enum: ['NOTIFIED', 'ACCEPTED', 'DECLINED', 'ARRIVED', 'DONATED'],
          default: 'NOTIFIED',
        },
        notifiedAt: { type: Date, default: Date.now },
        respondedAt: { type: Date },
      },
    ],
    acceptedDonor: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verificationCode: { type: String },
    timeToMatchSeconds: { type: Number },
  },
  {
    timestamps: true,
  }
);

BloodRequestSchema.index({ status: 1, urgency: 1, bloodGroup: 1 });
BloodRequestSchema.index({ 'hospital.coordinates.lat': 1, 'hospital.coordinates.lng': 1 });

export const BloodRequest = mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);
