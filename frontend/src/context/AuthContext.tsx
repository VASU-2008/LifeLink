import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authService, RegisterPayload } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginAsDemo: (role: UserRole) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserLocal: (updates: Partial<User>) => void;
  isDonor: boolean;
  isPatient: boolean;
  isHospital: boolean;
  isBloodBank: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS: Record<UserRole, { email: string; name: string; description: string }> = {
  DONOR: { email: 'donor@lifelink.demo', name: 'Rahul Sharma (O- Star Donor)', description: 'Universal donor with 2,350 LifePoints & badges' },
  PATIENT: { email: 'patient@lifelink.demo', name: 'Sarah Jenkins (Patient)', description: 'Patient / attendant emergency requester' },
  HOSPITAL: { email: 'hospital@lifelink.demo', name: 'Metropolitan General Hospital', description: 'Level 1 Trauma Center emergency department' },
  BLOOD_BANK: { email: 'bloodbank@lifelink.demo', name: 'Red Cross Regional Blood Bank', description: 'Central cold storage & batch inventory manager' },
  ADMIN: { email: 'admin@lifelink.demo', name: 'Dr. John Sterling (Administrator)', description: 'Super-admin platform overview & fraud monitor' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lifelink_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('lifelink_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    if (!localStorage.getItem('lifelink_token')) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('lifelink_user', JSON.stringify(res.user));
      }
    } catch (err) {
      console.warn('[AuthContext] Session expired or invalid token.');
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('lifelink_token', res.token);
      localStorage.setItem('lifelink_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role: UserRole): Promise<User> => {
    const cred = DEMO_CREDENTIALS[role];
    return login(cred.email, 'password123');
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authService.register(payload);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('lifelink_token', res.token);
      localStorage.setItem('lifelink_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lifelink_token');
    localStorage.removeItem('lifelink_user');
  };

  const updateUserLocal = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('lifelink_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        refreshUser,
        updateUserLocal,
        isDonor: user?.role === 'DONOR',
        isPatient: user?.role === 'PATIENT',
        isHospital: user?.role === 'HOSPITAL',
        isBloodBank: user?.role === 'BLOOD_BANK',
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
