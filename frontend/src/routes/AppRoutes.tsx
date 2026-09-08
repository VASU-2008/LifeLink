import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';

// Donor Pages
import { DonorDashboard } from '../pages/donor/DonorDashboard';
import { DonorProfile } from '../pages/donor/DonorProfile';
import { DonorRequests } from '../pages/donor/DonorRequests';
import { DonorDonations } from '../pages/donor/DonorDonations';
import { DonorRewards } from '../pages/donor/DonorRewards';

// Patient Pages
import { PatientDashboard } from '../pages/patient/PatientDashboard';

// Hospital Pages
import { HospitalDashboard } from '../pages/hospital/HospitalDashboard';
import { HospitalRequests } from '../pages/hospital/HospitalRequests';
import { HospitalVerification } from '../pages/hospital/HospitalVerification';
import { HospitalBloodBanks } from '../pages/hospital/HospitalBloodBanks';

// Blood Bank Pages
import { BloodBankDashboard } from '../pages/bloodbank/BloodBankDashboard';
import { BloodBankInventory } from '../pages/bloodbank/BloodBankInventory';
import { BloodBankShortages } from '../pages/bloodbank/BloodBankShortages';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminFraud } from '../pages/admin/AdminFraud';
import { AdminAnalytics } from '../pages/admin/AdminAnalytics';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-crimson-500 font-bold">
        Loading LifeLink...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard
    const rolePath = `/${user.role.toLowerCase()}/dashboard`;
    return <Navigate to={rolePath} replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Donor Portal Routes */}
      <Route
        path="/donor"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/donor/dashboard" replace />} />
        <Route path="dashboard" element={<DonorDashboard />} />
        <Route path="profile" element={<DonorProfile />} />
        <Route path="requests" element={<DonorRequests />} />
        <Route path="donations" element={<DonorDonations />} />
        <Route path="rewards" element={<DonorRewards />} />
      </Route>

      {/* Patient Portal Routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="requests" element={<PatientDashboard />} />
        <Route path="request/:id" element={<PatientDashboard />} />
      </Route>

      {/* Hospital Portal Routes */}
      <Route
        path="/hospital"
        element={
          <ProtectedRoute allowedRoles={['HOSPITAL']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/hospital/dashboard" replace />} />
        <Route path="dashboard" element={<HospitalDashboard />} />
        <Route path="requests" element={<HospitalRequests />} />
        <Route path="verification" element={<HospitalVerification />} />
        <Route path="blood-banks" element={<HospitalBloodBanks />} />
      </Route>

      {/* Blood Bank Portal Routes */}
      <Route
        path="/bloodbank"
        element={
          <ProtectedRoute allowedRoles={['BLOOD_BANK']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/bloodbank/dashboard" replace />} />
        <Route path="dashboard" element={<BloodBankDashboard />} />
        <Route path="inventory" element={<BloodBankInventory />} />
        <Route path="shortages" element={<BloodBankShortages />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="fraud" element={<AdminFraud />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
