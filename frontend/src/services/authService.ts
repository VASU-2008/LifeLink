import { apiClient } from './apiClient';
import { User, UserRole } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  bloodGroup?: string;
  gender?: string;
  age?: number;
  location?: any;
  hospitalDetails?: any;
  bloodBankDetails?: any;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    return apiClient<{ success: boolean; user: User }>('/auth/me');
  },

  async verifyOTP(phone: string, otp: string): Promise<{ success: boolean; message: string }> {
    return apiClient('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; demoResetToken?: string }> {
    return apiClient('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return apiClient('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};
