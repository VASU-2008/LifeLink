import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User, IUser, BloodGroup } from '../models/User.js';
import { BloodRequest } from '../models/BloodRequest.js';
import { BloodInventory } from '../models/BloodInventory.js';
import { Donation } from '../models/Donation.js';
import { Notification } from '../models/Notification.js';
import { FraudLog } from '../models/FraudLog.js';
import { connectDB } from '../config/db.js';

export const seedDatabase = async () => {
  console.log('[Seed] Starting LifeLink database seeding...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    BloodRequest.deleteMany({}),
    BloodInventory.deleteMany({}),
    Donation.deleteMany({}),
    Notification.deleteMany({}),
    FraudLog.deleteMany({}),
  ]);

  const defaultPassword = 'password123';

  // 1. Create Core Role Demo Accounts
  const demoUsers = [
    {
      name: 'Dr. John Sterling (Admin)',
      email: 'admin@lifelink.demo',
      phone: '+1-555-0100',
      password: defaultPassword,
      role: 'ADMIN' as const,
      bloodGroup: 'O+' as BloodGroup,
      verified: true,
      location: {
        address: 'LifeLink HQ, Innovation Square',
        city: 'Metropolis',
        coordinates: { lat: 28.6139, lng: 77.2090 },
      },
    },
    {
      name: 'Rahul Sharma (Star Donor)',
      email: 'donor@lifelink.demo',
      phone: '+1-555-0101',
      password: defaultPassword,
      role: 'DONOR' as const,
      bloodGroup: 'O-' as BloodGroup, // Universal Donor
      gender: 'MALE' as const,
      age: 28,
      verified: true,
      availability: true,
      eligibility: {
        isEligible: true,
        lastDonationDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        nextEligibleDate: new Date(),
        reason: 'Medically eligible to donate',
      },
      lifePoints: 2350,
      badges: [
        {
          id: 'first-lifesaver',
          name: 'First Lifesaver',
          icon: 'ShieldCheck',
          description: 'Registered as a volunteer blood donor',
          earnedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'regular-donor',
          name: 'Regular Lifesaver',
          icon: 'Award',
          description: 'Completed 3 or more blood donations',
          earnedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'emergency-hero',
          name: 'Emergency Hero',
          icon: 'HeartPulse',
          description: 'Responded and fulfilled an emergency blood request in under 20 minutes',
          earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      ],
      location: {
        address: 'Park Street, Downtown',
        city: 'Metropolis',
        coordinates: { lat: 28.6210, lng: 77.2150 }, // ~1.2 km from center
      },
      stats: {
        totalDonations: 4,
        emergencyResponses: 5,
        responseRate: 98,
        lastActiveAt: new Date(),
      },
    },
    {
      name: 'Sarah Jenkins (Patient / Attendant)',
      email: 'patient@lifelink.demo',
      phone: '+1-555-0102',
      password: defaultPassword,
      role: 'PATIENT' as const,
      bloodGroup: 'A+' as BloodGroup,
      verified: true,
      location: {
        address: 'Riverside Heights',
        city: 'Metropolis',
        coordinates: { lat: 28.6050, lng: 77.2020 },
      },
    },
    {
      name: 'Metropolitan General Hospital',
      email: 'hospital@lifelink.demo',
      phone: '+1-555-0103',
      password: defaultPassword,
      role: 'HOSPITAL' as const,
      bloodGroup: 'UNKNOWN' as BloodGroup,
      verified: true,
      hospitalDetails: {
        licenseNumber: 'HOSP-METRO-2024-889',
        bedCapacity: 450,
        emergencyContact: '+1-555-0911',
        type: 'Level 1 Trauma Center',
      },
      location: {
        address: '100 Medical Boulevard, Central Wing',
        city: 'Metropolis',
        coordinates: { lat: 28.6139, lng: 77.2090 }, // Central benchmark
      },
    },
    {
      name: 'Red Cross Regional Blood Bank',
      email: 'bloodbank@lifelink.demo',
      phone: '+1-555-0104',
      password: defaultPassword,
      role: 'BLOOD_BANK' as const,
      bloodGroup: 'UNKNOWN' as BloodGroup,
      verified: true,
      bloodBankDetails: {
        licenseNumber: 'BB-RC-REGIONAL-404',
        coldStorageCapacity: 2500,
        emergencyContact: '+1-555-0999',
      },
      location: {
        address: '50 Red Cross Way',
        city: 'Metropolis',
        coordinates: { lat: 28.6250, lng: 77.2200 },
      },
    },
  ];

  // 2. Add 14 more realistic Donors across various blood groups and locations
  const additionalDonors = [
    { name: 'Amit Kumar', email: 'amit.k@lifelink.demo', bloodGroup: 'O+' as BloodGroup, lat: 28.6300, lng: 77.2100, points: 1400, age: 31, gender: 'MALE' as const, distKm: 1.8 },
    { name: 'Priya Patel', email: 'priya.p@lifelink.demo', bloodGroup: 'A+' as BloodGroup, lat: 28.6100, lng: 77.2250, points: 1850, age: 26, gender: 'FEMALE' as const, distKm: 2.1 },
    { name: 'David Miller', email: 'david.m@lifelink.demo', bloodGroup: 'B+' as BloodGroup, lat: 28.6010, lng: 77.2180, points: 900, age: 34, gender: 'MALE' as const, distKm: 2.3 },
    { name: 'Ananya Roy', email: 'ananya.r@lifelink.demo', bloodGroup: 'AB+' as BloodGroup, lat: 28.6400, lng: 77.1990, points: 1150, age: 24, gender: 'FEMALE' as const, distKm: 3.5 },
    { name: 'Carlos Mendez', email: 'carlos.m@lifelink.demo', bloodGroup: 'O-' as BloodGroup, lat: 28.5950, lng: 77.2300, points: 2600, age: 29, gender: 'MALE' as const, distKm: 3.2 },
    { name: 'Sneha Gupta', email: 'sneha.g@lifelink.demo', bloodGroup: 'A-' as BloodGroup, lat: 28.6450, lng: 77.2250, points: 1700, age: 27, gender: 'FEMALE' as const, distKm: 4.1 },
    { name: 'Vikram Singh', email: 'vikram.s@lifelink.demo', bloodGroup: 'B-' as BloodGroup, lat: 28.5850, lng: 77.2000, points: 1300, age: 38, gender: 'MALE' as const, distKm: 4.5 },
    { name: 'Elena Rostova', email: 'elena.r@lifelink.demo', bloodGroup: 'AB-' as BloodGroup, lat: 28.6500, lng: 77.2100, points: 2100, age: 30, gender: 'FEMALE' as const, distKm: 4.0 },
    { name: 'Marcus Vance', email: 'marcus.v@lifelink.demo', bloodGroup: 'O+' as BloodGroup, lat: 28.5900, lng: 77.1850, points: 750, age: 22, gender: 'MALE' as const, distKm: 5.2 },
    { name: 'Kavita Rao', email: 'kavita.r@lifelink.demo', bloodGroup: 'A+' as BloodGroup, lat: 28.6600, lng: 77.2350, points: 1550, age: 33, gender: 'FEMALE' as const, distKm: 6.1 },
    { name: 'Rohan Mehta', email: 'rohan.m@lifelink.demo', bloodGroup: 'B+' as BloodGroup, lat: 28.5700, lng: 77.2400, points: 950, age: 29, gender: 'MALE' as const, distKm: 7.2 },
    { name: 'Zainab Khan', email: 'zainab.k@lifelink.demo', bloodGroup: 'O-' as BloodGroup, lat: 28.6700, lng: 77.1900, points: 2900, age: 35, gender: 'FEMALE' as const, distKm: 7.8 },
    { name: 'Lucas Scott', email: 'lucas.s@lifelink.demo', bloodGroup: 'AB+' as BloodGroup, lat: 28.5600, lng: 77.2100, points: 600, age: 25, gender: 'MALE' as const, distKm: 8.5 },
    { name: 'Meera Nambiar', email: 'meera.n@lifelink.demo', bloodGroup: 'O+' as BloodGroup, lat: 28.6800, lng: 77.2200, points: 1250, age: 28, gender: 'FEMALE' as const, distKm: 9.1 },
  ];

  const donorEntities = additionalDonors.map((d, i) => ({
    name: d.name,
    email: d.email,
    phone: `+1-555-02${10 + i}`,
    password: defaultPassword,
    role: 'DONOR' as const,
    bloodGroup: d.bloodGroup,
    gender: d.gender,
    age: d.age,
    verified: true,
    availability: true,
    eligibility: {
      isEligible: true,
      lastDonationDate: new Date(Date.now() - (90 + i * 10) * 24 * 60 * 60 * 1000),
      nextEligibleDate: new Date(),
      reason: 'Medically eligible to donate',
    },
    lifePoints: d.points,
    badges: [
      {
        id: 'first-lifesaver',
        name: 'First Lifesaver',
        icon: 'ShieldCheck',
        description: 'Registered as a volunteer blood donor',
        earnedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
      },
      ...(d.points > 1500
        ? [
            {
              id: 'emergency-hero',
              name: 'Emergency Hero',
              icon: 'HeartPulse',
              description: 'Completed emergency blood response',
              earnedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
            },
          ]
        : []),
    ],
    location: {
      address: `Sector ${i + 4}, Metropolis`,
      city: 'Metropolis',
      coordinates: { lat: d.lat, lng: d.lng },
    },
    stats: {
      totalDonations: Math.floor(d.points / 500),
      emergencyResponses: Math.floor(d.points / 300),
      responseRate: 90 + (i % 10),
      lastActiveAt: new Date(),
    },
  }));

  // 3. Additional Hospitals
  const additionalHospitals = [
    {
      name: 'St. Jude Apex Medical Center',
      email: 'stjude@lifelink.demo',
      phone: '+1-555-0301',
      password: defaultPassword,
      role: 'HOSPITAL' as const,
      bloodGroup: 'UNKNOWN' as BloodGroup,
      verified: true,
      hospitalDetails: {
        licenseNumber: 'HOSP-STJUDE-552',
        bedCapacity: 600,
        emergencyContact: '+1-555-0912',
        type: 'Multi-Specialty Trauma Hospital',
      },
      location: {
        address: '450 North Medical Way',
        city: 'Metropolis',
        coordinates: { lat: 28.6350, lng: 77.2120 },
      },
    },
    {
      name: 'Apollo Lifecare Emergency Wing',
      email: 'apollo@lifelink.demo',
      phone: '+1-555-0302',
      password: defaultPassword,
      role: 'HOSPITAL' as const,
      bloodGroup: 'UNKNOWN' as BloodGroup,
      verified: true,
      hospitalDetails: {
        licenseNumber: 'HOSP-APOLLO-771',
        bedCapacity: 350,
        emergencyContact: '+1-555-0913',
        type: 'Cardiac and Critical Care',
      },
      location: {
        address: '88 South Ring Avenue',
        city: 'Metropolis',
        coordinates: { lat: 28.5980, lng: 77.2050 },
      },
    },
    {
      name: 'Fortis Emergency Care Institute',
      email: 'fortis@lifelink.demo',
      phone: '+1-555-0303',
      password: defaultPassword,
      role: 'HOSPITAL' as const,
      bloodGroup: 'UNKNOWN' as BloodGroup,
      verified: true,
      hospitalDetails: {
        licenseNumber: 'HOSP-FORTIS-919',
        bedCapacity: 500,
        emergencyContact: '+1-555-0914',
        type: 'Pediatric and Emergency Care',
      },
      location: {
        address: '12 East Campus Boulevard',
        city: 'Metropolis',
        coordinates: { lat: 28.6180, lng: 77.2350 },
      },
    },
    {
      name: 'City Trauma & Surgical Center',
      email: 'citytrauma@lifelink.demo',
      phone: '+1-555-0304',
      password: defaultPassword,
      role: 'HOSPITAL' as const,
      bloodGroup: 'UNKNOWN' as BloodGroup,
      verified: false, // Pending verification for admin demo
      hospitalDetails: {
        licenseNumber: 'HOSP-CITYTR-102',
        bedCapacity: 200,
        emergencyContact: '+1-555-0915',
        type: 'Trauma & Emergency Care',
      },
      location: {
        address: '77 West Industrial Road',
        city: 'Metropolis',
        coordinates: { lat: 28.6080, lng: 77.1950 },
      },
    },
  ];

  // 4. Additional Blood Banks
  const additionalBloodBanks = [
    {
      name: 'Lifeline Central Blood Reserve',
      email: 'lifelinebb@lifelink.demo',
      phone: '+1-555-0401',
      password: defaultPassword,
      role: 'BLOOD_BANK' as const,
      bloodGroup: 'UNKNOWN' as BloodGroup,
      verified: true,
      bloodBankDetails: {
        licenseNumber: 'BB-LIFELINE-303',
        coldStorageCapacity: 3000,
        emergencyContact: '+1-555-0991',
      },
      location: {
        address: '12 Health Plaza West',
        city: 'Metropolis',
        coordinates: { lat: 28.6100, lng: 77.1980 },
      },
    },
    {
      name: 'Apex Transfusion Services Hub',
      email: 'apexbb@lifelink.demo',
      phone: '+1-555-0402',
      password: defaultPassword,
      role: 'BLOOD_BANK' as const,
      bloodGroup: 'UNKNOWN' as BloodGroup,
      verified: true,
      bloodBankDetails: {
        licenseNumber: 'BB-APEX-882',
        coldStorageCapacity: 1800,
        emergencyContact: '+1-555-0992',
      },
      location: {
        address: '300 East Gateway',
        city: 'Metropolis',
        coordinates: { lat: 28.6300, lng: 77.2300 },
      },
    },
    {
      name: 'Hope Community Blood Foundation',
      email: 'hopebb@lifelink.demo',
      phone: '+1-555-0403',
      password: defaultPassword,
      role: 'BLOOD_BANK' as const,
      bloodGroup: 'UNKNOWN' as BloodGroup,
      verified: false, // Pending verification for admin demo
      bloodBankDetails: {
        licenseNumber: 'BB-HOPE-441',
        coldStorageCapacity: 1200,
        emergencyContact: '+1-555-0993',
      },
      location: {
        address: '90 Greenfields Park',
        city: 'Metropolis',
        coordinates: { lat: 28.5800, lng: 77.2200 },
      },
    },
    {
      name: 'Metropolis University Transfusion Bank',
      email: 'univbb@lifelink.demo',
      phone: '+1-555-0404',
      password: defaultPassword,
      role: 'BLOOD_BANK' as const,
      bloodGroup: 'UNKNOWN' as BloodGroup,
      verified: true,
      bloodBankDetails: {
        licenseNumber: 'BB-UNIV-992',
        coldStorageCapacity: 2000,
        emergencyContact: '+1-555-0994',
      },
      location: {
        address: 'University Medical Campus',
        city: 'Metropolis',
        coordinates: { lat: 28.6420, lng: 77.2150 },
      },
    },
  ];

  // Save all users
  const allUsersToCreate = [
    ...demoUsers,
    ...donorEntities,
    ...additionalHospitals,
    ...additionalBloodBanks,
  ];

  const createdUsers = await User.create(allUsersToCreate);
  console.log(`[Seed] Created ${createdUsers.length} users across all roles.`);

  const donorUserMap = createdUsers.filter((u) => u.role === 'DONOR');
  const starDonor = createdUsers.find((u) => u.email === 'donor@lifelink.demo')!;
  const patientUser = createdUsers.find((u) => u.email === 'patient@lifelink.demo')!;
  const hospitalUser = createdUsers.find((u) => u.email === 'hospital@lifelink.demo')!;
  const redCrossBB = createdUsers.find((u) => u.email === 'bloodbank@lifelink.demo')!;
  const lifelineBB = createdUsers.find((u) => u.email === 'lifelinebb@lifelink.demo')!;
  const apexBB = createdUsers.find((u) => u.email === 'apexbb@lifelink.demo')!;

  // 5. Create Blood Inventory Batches (20+ records)
  const allBloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const bloodInventories = [];

  const bloodBanksList = [redCrossBB, lifelineBB, apexBB];

  for (const bb of bloodBanksList) {
    for (const bg of allBloodGroups) {
      // Simulate realistic quantities (O- and AB- typically lower in supply)
      const baseUnits = bg === 'O-' ? 2 : bg === 'AB-' ? 3 : bg === 'O+' ? 14 : bg === 'A+' ? 12 : 8;
      const variation = Math.floor(Math.random() * 4);
      const units = Math.max(1, baseUnits + variation);

      const daysAgoCollected = Math.floor(Math.random() * 20) + 1;
      const daysUntilExpiry = 35 - daysAgoCollected;

      bloodInventories.push({
        bloodBank: bb._id,
        bloodBankName: bb.name,
        bloodGroup: bg,
        units,
        batchNumber: `BAT-${bg.replace('+', 'P').replace('-', 'N')}-${bb.name.slice(0, 3).toUpperCase()}-${100 + Math.floor(Math.random() * 900)}`,
        collectionDate: new Date(Date.now() - daysAgoCollected * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + daysUntilExpiry * 24 * 60 * 60 * 1000),
        status: 'AVAILABLE' as const,
        storageTemperature: '4°C',
        location: bb.location,
      });
    }
  }

  // Add 2 near-expiry and 1 reserved batch for testing alerts
  bloodInventories.push({
    bloodBank: redCrossBB._id,
    bloodBankName: redCrossBB.name,
    bloodGroup: 'B+' as BloodGroup,
    units: 4,
    batchNumber: 'BAT-BP-EXP-WARN-99',
    collectionDate: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Expiring in 3 days!
    status: 'AVAILABLE' as const,
    storageTemperature: '4°C',
    location: redCrossBB.location,
  });

  const createdInventory = await BloodInventory.create(bloodInventories);
  console.log(`[Seed] Created ${createdInventory.length} blood inventory batches.`);

  // 6. Create 10 Emergency Blood Requests
  const emergencyRequestsData = [
    {
      patientName: 'Emma Watson',
      requester: patientUser._id,
      bloodGroup: 'O-' as const,
      units: 2,
      hospital: {
        name: hospitalUser.name,
        address: hospitalUser.location.address,
        city: 'Metropolis',
        contactNumber: '+1-555-0911',
        coordinates: hospitalUser.location.coordinates,
        hospitalUser: hospitalUser._id,
      },
      urgency: 'CRITICAL' as const,
      status: 'DONOR_ACCEPTED' as const,
      requiredBy: new Date(Date.now() + 2 * 60 * 60 * 1000),
      additionalInfo: 'Emergency surgical trauma transfusion required in OT-3.',
      verificationCode: 'LL-882190',
      timeToMatchSeconds: 142, // 2m 22s!
      acceptedDonor: starDonor._id,
      matchedDonors: [
        {
          donor: starDonor._id,
          score: 95,
          distanceKm: 1.2,
          status: 'ACCEPTED' as const,
          notifiedAt: new Date(Date.now() - 30 * 60 * 1000),
          respondedAt: new Date(Date.now() - 28 * 60 * 1000),
        },
      ],
    },
    {
      patientName: 'Robert Langdon',
      requester: patientUser._id,
      bloodGroup: 'A+' as const,
      units: 3,
      hospital: {
        name: 'St. Jude Apex Medical Center',
        address: '450 North Medical Way',
        city: 'Metropolis',
        contactNumber: '+1-555-0912',
        coordinates: { lat: 28.6350, lng: 77.2120 },
      },
      urgency: 'CRITICAL' as const,
      status: 'MATCHED' as const,
      requiredBy: new Date(Date.now() + 3 * 60 * 60 * 1000),
      additionalInfo: 'Post-accident stabilization. Compatible donors urgently needed.',
      verificationCode: 'LL-193842',
      matchedDonors: donorUserMap.slice(0, 4).map((d, i) => ({
        donor: d._id,
        score: 88 - i * 5,
        distanceKm: 2.1 + i * 1.2,
        status: 'NOTIFIED' as const,
        notifiedAt: new Date(Date.now() - 15 * 60 * 1000),
      })),
    },
    {
      patientName: 'Clara Oswald',
      requester: patientUser._id,
      bloodGroup: 'B-' as const,
      units: 1,
      hospital: {
        name: 'Apollo Lifecare Emergency Wing',
        address: '88 South Ring Avenue',
        city: 'Metropolis',
        contactNumber: '+1-555-0913',
        coordinates: { lat: 28.5980, lng: 77.2050 },
      },
      urgency: 'URGENT' as const,
      status: 'REQUESTED' as const,
      requiredBy: new Date(Date.now() + 6 * 60 * 60 * 1000),
      additionalInfo: 'Thalassemia scheduled transfusion.',
      verificationCode: 'LL-448201',
      matchedDonors: [],
    },
    {
      patientName: 'Arthur Pendelton',
      requester: patientUser._id,
      bloodGroup: 'AB+' as const,
      units: 2,
      hospital: {
        name: hospitalUser.name,
        address: hospitalUser.location.address,
        city: 'Metropolis',
        contactNumber: '+1-555-0911',
        coordinates: hospitalUser.location.coordinates,
        hospitalUser: hospitalUser._id,
      },
      urgency: 'NORMAL' as const,
      status: 'DONATION_VERIFIED' as const,
      requiredBy: new Date(Date.now() - 24 * 60 * 60 * 1000),
      additionalInfo: 'Orthopedic joint replacement surgery support.',
      verificationCode: 'LL-665123',
      timeToMatchSeconds: 210,
      acceptedDonor: donorUserMap[3]._id,
      verifiedBy: hospitalUser._id,
      matchedDonors: [
        {
          donor: donorUserMap[3]._id,
          score: 92,
          distanceKm: 3.5,
          status: 'DONATED' as const,
          notifiedAt: new Date(Date.now() - 28 * 60 * 60 * 1000),
          respondedAt: new Date(Date.now() - 27 * 60 * 60 * 1000),
        },
      ],
    },
  ];

  // Generate 6 more historical requests
  for (let i = 1; i <= 6; i++) {
    const bg = allBloodGroups[i % allBloodGroups.length];
    const isCompleted = i > 2;
    emergencyRequestsData.push({
      patientName: `Patient Record #${800 + i}`,
      requester: patientUser._id,
      bloodGroup: bg as any,
      units: (i % 3) + 1,
      hospital: {
        name: i % 2 === 0 ? hospitalUser.name : 'St. Jude Apex Medical Center',
        address: hospitalUser.location.address,
        city: 'Metropolis',
        contactNumber: '+1-555-0911',
        coordinates: hospitalUser.location.coordinates,
        hospitalUser: hospitalUser._id,
      },
      urgency: (i % 3 === 0 ? 'CRITICAL' : i % 2 === 0 ? 'URGENT' : 'NORMAL') as any,
      status: (isCompleted ? 'COMPLETED' : 'MATCHED') as any,
      requiredBy: new Date(Date.now() - (isCompleted ? i * 24 : -i * 2) * 60 * 60 * 1000),
      additionalInfo: `Scheduled clinical requirement #${i}`,
      verificationCode: `LL-${700000 + i * 1111}`,
      timeToMatchSeconds: 120 + i * 25,
      acceptedDonor: donorUserMap[i]._id,
      matchedDonors: [
        {
          donor: donorUserMap[i]._id,
          score: 90 - i * 2,
          distanceKm: 2.0 + i * 0.8,
          status: (isCompleted ? 'DONATED' : 'NOTIFIED') as any,
          notifiedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
          respondedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  const createdRequests = await BloodRequest.insertMany(emergencyRequestsData);
  console.log(`[Seed] Created ${createdRequests.length} emergency blood requests.`);

  // 7. Create 10 Verified Donation Records with Certificates
  const donationRecords = [];
  for (let i = 0; i < 10; i++) {
    const donor = i < 4 ? starDonor : donorUserMap[i % donorUserMap.length];
    const reqRef = createdRequests[i % createdRequests.length];
    const certId = `CERT-LIFE-${2026000 + i}-${donor.bloodGroup.replace('+', 'P').replace('-', 'N')}`;

    donationRecords.push({
      donor: donor._id,
      hospital: {
        name: hospitalUser.name,
        address: hospitalUser.location.address,
        hospitalUser: hospitalUser._id,
      },
      bloodRequest: reqRef._id,
      bloodGroup: donor.bloodGroup,
      units: 1,
      date: new Date(Date.now() - (i * 30 + 5) * 24 * 60 * 60 * 1000),
      type: i % 2 === 0 ? 'EMERGENCY' : 'VOLUNTARY',
      status: 'VERIFIED' as const,
      verified: true,
      verifiedBy: hospitalUser._id,
      verificationDate: new Date(Date.now() - (i * 30 + 5) * 24 * 60 * 60 * 1000),
      certificateId: certId,
      lifePointsAwarded: i % 2 === 0 ? 750 : 500,
      notes: `Verified by Hematology Lab at ${hospitalUser.name}.`,
    });
  }

  const createdDonations = await Donation.create(donationRecords);
  console.log(`[Seed] Created ${createdDonations.length} donation records.`);

  // 8. Create 15 In-App Notifications
  const notificationsData = [
    {
      user: starDonor._id,
      type: 'EMERGENCY_REQUEST' as const,
      title: '🚨 CRITICAL: O- Blood Needed (1.2 km away)',
      message: 'Metropolitan General Hospital requires 2 units of O- blood urgently in OT-3.',
      urgency: 'CRITICAL' as const,
      requestId: createdRequests[0]._id,
      link: '/donor/requests',
      status: 'UNREAD' as const,
    },
    {
      user: starDonor._id,
      type: 'REWARD' as const,
      title: '🏆 Emergency Hero Badge Awarded!',
      message: 'You unlocked the Emergency Hero badge and +750 LifePoints for your lifesaving donation.',
      urgency: 'HIGH' as const,
      link: '/donor/rewards',
      status: 'READ' as const,
    },
    {
      user: patientUser._id,
      type: 'REQUEST_ACCEPTED' as const,
      title: '💚 Donor En Route to Hospital!',
      message: 'Rahul Sharma (O-) has accepted your emergency request for Metropolitan General Hospital.',
      urgency: 'HIGH' as const,
      requestId: createdRequests[0]._id,
      link: `/patient/request/${createdRequests[0]._id}`,
      status: 'UNREAD' as const,
    },
    {
      user: hospitalUser._id,
      type: 'DONOR_MATCH' as const,
      title: '💉 Compatible Donor Verified Arrival',
      message: 'Rahul Sharma has checked in for emergency request LL-882190.',
      urgency: 'HIGH' as const,
      requestId: createdRequests[0]._id,
      link: `/hospital/requests/${createdRequests[0]._id}`,
      status: 'UNREAD' as const,
    },
    {
      user: redCrossBB._id,
      type: 'SHORTAGE_ALERT' as const,
      title: '⚠️ AI Shortage Alert: O- Stock Critically Low',
      message: 'Current regional O- inventory is below 3 units. Automated donor broadcast recommended.',
      urgency: 'CRITICAL' as const,
      link: '/bloodbank/shortages',
      status: 'UNREAD' as const,
    },
  ];

  // Add more notifications across donors and admin
  for (let i = 0; i < 10; i++) {
    const targetUser = donorUserMap[i % donorUserMap.length];
    notificationsData.push({
      user: targetUser._id,
      type: 'SYSTEM' as any,
      title: '🩸 Community Blood Network Update',
      message: `Thank you for being part of LifeLink. Your availability helps save lives across Metropolis.`,
      urgency: 'NORMAL' as any,
      status: (i % 2 === 0 ? 'UNREAD' : 'READ') as any,
    } as any);
  }

  const createdNotifs = await Notification.insertMany(notificationsData);
  console.log(`[Seed] Created ${createdNotifs.length} notifications.`);

  // 9. Create 2 Sample Fraud/Abuse logs for Admin review demo
  await FraudLog.create([
    {
      user: patientUser._id,
      entityType: 'REQUEST',
      riskScore: 78,
      reason: 'Multiple rapid emergency requests initiated from same IP subnet within 15 minutes.',
      details: { requestedUnits: 9, urgency: 'CRITICAL' },
      resolved: false,
      flaggedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      entityType: 'HOSPITAL',
      riskScore: 65,
      reason: 'Unverified medical facility license number format flagged by automated check.',
      details: { hospitalName: 'City Trauma & Surgical Center' },
      resolved: false,
      flaggedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
  ]);
  console.log(`[Seed] Created fraud & risk logs.`);

  console.log('====================================================');
  console.log('✅ LIFELINK DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  console.log('Demo Accounts (Password for all: password123):');
  console.log('  DONOR:      donor@lifelink.demo');
  console.log('  PATIENT:    patient@lifelink.demo');
  console.log('  HOSPITAL:   hospital@lifelink.demo');
  console.log('  BLOOD BANK: bloodbank@lifelink.demo');
  console.log('  ADMIN:      admin@lifelink.demo');
  console.log('====================================================');
};

// If run directly via CLI (npm run seed)
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('[Seed Error]:', err);
      process.exit(1);
    }
  })();
}
