import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'DONOR' | 'PATIENT' | 'HOSPITAL' | 'BLOOD_BANK' | 'ADMIN';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNKNOWN';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  bloodGroup: BloodGroup;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  age?: number;
  location: {
    address: string;
    city: string;
    state?: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  availability: boolean;
  eligibility: {
    isEligible: boolean;
    lastDonationDate?: Date;
    nextEligibleDate?: Date;
    reason?: string;
  };
  verified: boolean;
  lifePoints: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    earnedAt: Date;
  }>;
  hospitalDetails?: {
    licenseNumber: string;
    bedCapacity?: number;
    emergencyContact: string;
    type?: string;
  };
  bloodBankDetails?: {
    licenseNumber: string;
    coldStorageCapacity?: number;
    emergencyContact: string;
  };
  stats: {
    totalDonations: number;
    emergencyResponses: number;
    responseRate: number; // percentage (0-100)
    lastDonationDate?: Date;
    lastActiveAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['DONOR', 'PATIENT', 'HOSPITAL', 'BLOOD_BANK', 'ADMIN'],
      required: true,
      default: 'DONOR',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'],
      default: 'UNKNOWN',
    },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    age: { type: Number, min: 18, max: 70 },
    location: {
      address: { type: String, default: '' },
      city: { type: String, default: 'Metropolis' },
      state: { type: String, default: 'State' },
      coordinates: {
        lat: { type: Number, required: true, default: 28.6139 },
        lng: { type: Number, required: true, default: 77.2090 },
      },
    },
    availability: { type: Boolean, default: true },
    eligibility: {
      isEligible: { type: Boolean, default: true },
      lastDonationDate: { type: Date },
      nextEligibleDate: { type: Date, default: () => new Date() },
      reason: { type: String, default: 'Medically eligible to donate' },
    },
    verified: { type: Boolean, default: false },
    lifePoints: { type: Number, default: 0 },
    badges: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        icon: { type: String, required: true },
        description: { type: String },
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    hospitalDetails: {
      licenseNumber: { type: String },
      bedCapacity: { type: Number },
      emergencyContact: { type: String },
      type: { type: String },
    },
    bloodBankDetails: {
      licenseNumber: { type: String },
      coldStorageCapacity: { type: Number },
      emergencyContact: { type: String },
    },
    stats: {
      totalDonations: { type: Number, default: 0 },
      emergencyResponses: { type: Number, default: 0 },
      responseRate: { type: Number, default: 95 },
      lastDonationDate: { type: Date },
      lastActiveAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance donor searching & matching
UserSchema.index({ role: 1, bloodGroup: 1, availability: 1 });
UserSchema.index({ 'location.coordinates.lat': 1, 'location.coordinates.lng': 1 });

// Password hashing middleware
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
