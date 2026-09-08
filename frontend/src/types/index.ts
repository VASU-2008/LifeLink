export type UserRole = 'DONOR' | 'PATIENT' | 'HOSPITAL' | 'BLOOD_BANK' | 'ADMIN';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNKNOWN';
export type RequestUrgency = 'CRITICAL' | 'URGENT' | 'NORMAL';
export type RequestStatus =
  | 'REQUESTED'
  | 'MATCHED'
  | 'DONOR_ACCEPTED'
  | 'DONOR_ARRIVED'
  | 'DONATION_VERIFIED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface UserLocation {
  address: string;
  city: string;
  state?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  bloodGroup: BloodGroup;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  age?: number;
  location: UserLocation;
  availability: boolean;
  eligibility: {
    isEligible: boolean;
    lastDonationDate?: string;
    nextEligibleDate?: string;
    reason?: string;
  };
  verified: boolean;
  lifePoints: number;
  badges: UserBadge[];
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
    responseRate: number;
    lastDonationDate?: string;
    lastActiveAt?: string;
  };
  createdAt: string;
}

export interface MatchedDonorEntry {
  donor: {
    _id: string;
    name: string;
    bloodGroup: BloodGroup;
    location?: { city: string };
    phone?: string;
  };
  score: number;
  distanceKm: number;
  status: 'NOTIFIED' | 'ACCEPTED' | 'DECLINED' | 'ARRIVED' | 'DONATED';
  notifiedAt: string;
  respondedAt?: string;
}

export interface BloodRequest {
  _id: string;
  id?: string;
  patientName: string;
  requester: {
    _id: string;
    name: string;
    phone: string;
    email: string;
  };
  bloodGroup: BloodGroup;
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
    hospitalUser?: string;
  };
  urgency: RequestUrgency;
  status: RequestStatus;
  requiredBy: string;
  additionalInfo?: string;
  matchedDonors: MatchedDonorEntry[];
  matchedDonorsCount?: number;
  acceptedDonor?: {
    _id: string;
    name: string;
    bloodGroup: BloodGroup;
    phone: string;
    location?: { city: string };
  };
  verifiedBy?: string;
  verificationCode?: string;
  timeToMatchSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  _id: string;
  donor: {
    _id: string;
    name: string;
    bloodGroup: string;
    phone?: string;
    location?: { city: string };
  };
  hospital: {
    name: string;
    address: string;
  };
  bloodRequest?: any;
  bloodGroup: string;
  units: number;
  date: string;
  type: 'EMERGENCY' | 'VOLUNTARY' | 'CAMP';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'CANCELLED';
  verified: boolean;
  certificateId: string;
  lifePointsAwarded: number;
  notes?: string;
  createdAt: string;
}

export interface BloodInventoryItem {
  _id: string;
  bloodBank: string;
  bloodBankName: string;
  bloodGroup: BloodGroup;
  units: number;
  batchNumber: string;
  collectionDate: string;
  expiryDate: string;
  status: 'AVAILABLE' | 'RESERVED' | 'EXPIRED' | 'DISCARDED';
  storageTemperature?: string;
  location: UserLocation;
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  type:
    | 'EMERGENCY_REQUEST'
    | 'DONOR_MATCH'
    | 'REQUEST_ACCEPTED'
    | 'DONOR_ARRIVED'
    | 'DONATION_VERIFIED'
    | 'SHORTAGE_ALERT'
    | 'SYSTEM'
    | 'REWARD';
  title: string;
  message: string;
  urgency: 'CRITICAL' | 'HIGH' | 'NORMAL';
  requestId?: string;
  link?: string;
  status: 'UNREAD' | 'READ';
  createdAt: string;
}

export interface ShortagePrediction {
  bloodGroup: BloodGroup;
  currentUnits: number;
  expectedDemand: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  riskLevel: 'SAFE' | 'WATCH' | 'HIGH' | 'CRITICAL';
  daysOfSupplyLeft: number;
  recommendation: string;
  factors: string[];
}

export interface DonorRank {
  rank: number;
  id: string;
  name: string;
  bloodGroup: string;
  city: string;
  lifePoints: number;
  totalDonations: number;
  emergencyResponses: number;
  badgeCount: number;
}
