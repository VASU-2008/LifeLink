import mongoose, { Document, Schema } from 'mongoose';

export type InventoryStatus = 'AVAILABLE' | 'RESERVED' | 'EXPIRED' | 'DISCARDED';

export interface IBloodInventory extends Document {
  _id: mongoose.Types.ObjectId;
  bloodBank: mongoose.Types.ObjectId;
  bloodBankName: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  units: number;
  batchNumber: string;
  collectionDate: Date;
  expiryDate: Date;
  status: InventoryStatus;
  storageTemperature?: string;
  location: {
    address: string;
    city: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const BloodInventorySchema: Schema<IBloodInventory> = new Schema(
  {
    bloodBank: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bloodBankName: { type: String, required: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    units: { type: Number, required: true, min: 0 },
    batchNumber: { type: String, required: true },
    collectionDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RESERVED', 'EXPIRED', 'DISCARDED'],
      default: 'AVAILABLE',
    },
    storageTemperature: { type: String, default: '4°C' },
    location: {
      address: { type: String, default: '' },
      city: { type: String, default: 'Metropolis' },
      coordinates: {
        lat: { type: Number, required: true, default: 28.6139 },
        lng: { type: Number, required: true, default: 77.2090 },
      },
    },
  },
  {
    timestamps: true,
  }
);

BloodInventorySchema.index({ bloodBank: 1, bloodGroup: 1, status: 1 });
BloodInventorySchema.index({ expiryDate: 1 });

export const BloodInventory = mongoose.model<IBloodInventory>('BloodInventory', BloodInventorySchema);
