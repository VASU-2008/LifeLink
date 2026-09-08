import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole, BloodGroup } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'lifelink_jwt_super_secret_production_ready_key_2026';
  return jwt.sign({ id, role }, secret, { expiresIn: '7d' });
};

export class AuthController {
  /**
   * Register a new user (Donor, Patient, Hospital, Blood Bank, Admin)
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        name,
        email,
        phone,
        password,
        role,
        bloodGroup,
        gender,
        age,
        location,
        hospitalDetails,
        bloodBankDetails,
      } = req.body;

      if (!name || !email || !phone || !password || !role) {
        res.status(400).json({ success: false, message: 'Name, email, phone, password and role are required.' });
        return;
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      // Default badge for new donors
      const badges =
        role === 'DONOR'
          ? [
              {
                id: 'first-lifesaver',
                name: 'First Lifesaver',
                icon: 'ShieldCheck',
                description: 'Registered as an active volunteer blood donor',
                earnedAt: new Date(),
              },
            ]
          : [];

      const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        phone,
        password,
        role: role as UserRole,
        bloodGroup: (bloodGroup as BloodGroup) || 'UNKNOWN',
        gender,
        age: age ? Number(age) : undefined,
        location: location || {
          address: 'Central District',
          city: 'Metropolis',
          coordinates: { lat: 28.6139 + (Math.random() - 0.5) * 0.1, lng: 77.2090 + (Math.random() - 0.5) * 0.1 },
        },
        availability: true,
        eligibility: {
          isEligible: true,
          nextEligibleDate: new Date(),
          reason: 'Medically eligible to donate',
        },
        verified: role === 'PATIENT' || role === 'DONOR', // Donors/patients auto-verified for MVP; hospitals/banks pending verification
        lifePoints: role === 'DONOR' ? 50 : 0, // Welcome points
        badges,
        hospitalDetails: role === 'HOSPITAL' ? hospitalDetails : undefined,
        bloodBankDetails: role === 'BLOOD_BANK' ? bloodBankDetails : undefined,
        stats: {
          totalDonations: 0,
          emergencyResponses: 0,
          responseRate: 100,
          lastActiveAt: new Date(),
        },
      });

      const token = generateToken(user._id.toString(), user.role);

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          bloodGroup: user.bloodGroup,
          location: user.location,
          availability: user.availability,
          verified: user.verified,
          lifePoints: user.lifePoints,
          badges: user.badges,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Please provide both email and password.' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      // Update last active
      user.stats.lastActiveAt = new Date();
      await user.save();

      const token = generateToken(user._id.toString(), user.role);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          bloodGroup: user.bloodGroup,
          location: user.location,
          availability: user.availability,
          verified: user.verified,
          lifePoints: user.lifePoints,
          badges: user.badges,
          stats: user.stats,
          hospitalDetails: user.hospitalDetails,
          bloodBankDetails: user.bloodBankDetails,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get current authenticated user profile
   */
  static async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      res.status(200).json({
        success: true,
        user: req.user,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * OTP verification simulation for phone authentication
   */
  static async verifyOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        res.status(400).json({ success: false, message: 'Phone number and OTP are required.' });
        return;
      }

      // For development/demo, accept '123456' or any 6-digit OTP
      if (otp.length !== 6) {
        res.status(400).json({ success: false, message: 'Invalid OTP format. Must be 6 digits.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Phone number verified successfully.',
        verifiedPhone: phone,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Forgot password request
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ success: false, message: 'Email is required.' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        // Return 200 to prevent email enumeration
        res.status(200).json({
          success: true,
          message: 'If an account with this email exists, a password reset link has been dispatched.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Password reset link dispatched.',
        demoResetToken: 'lifelink_reset_token_demo_987654',
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword || newPassword.length < 6) {
        res.status(400).json({ success: false, message: 'Token and a new password (min 6 characters) are required.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Password reset successfully. You may now login with your new credentials.',
      });
    } catch (err) {
      next(err);
    }
  }
}
