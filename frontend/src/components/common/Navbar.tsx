import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';
import {
  HeartPulse,
  Bell,
  User,
  LogOut,
  Sparkles,
  ChevronDown,
  Shield,
  Activity,
  Droplet,
  Compass,
} from 'lucide-react';
import { EmergencyRequestModal } from '../emergency/EmergencyRequestModal';
import { CompatibilityMatrixModal } from './CompatibilityMatrixModal';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const getDashboardPath = (role?: UserRole): string => {
    switch (role) {
      case 'DONOR':
        return '/donor/dashboard';
      case 'PATIENT':
        return '/patient/dashboard';
      case 'HOSPITAL':
        return '/hospital/dashboard';
      case 'BLOOD_BANK':
        return '/bloodbank/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const handleDemoSwitch = async (role: UserRole) => {
    setIsDemoDropdownOpen(false);
    await loginAsDemo(role);
    navigate(getDashboardPath(role));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand / Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-crimson-600 via-rose-600 to-crimson-500 flex items-center justify-center text-white shadow-lg shadow-crimson-900/40 group-hover:scale-105 transition-transform duration-200">
                <HeartPulse className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                  LifeLink
                  <span className="text-[10px] uppercase font-bold tracking-widest text-crimson-400 bg-crimson-950/80 border border-crimson-800/60 px-1.5 py-0.2 rounded">
                    AI
                  </span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-400 font-medium -mt-1">
                  Connecting Blood. Saving Lives.
                </span>
              </div>
            </Link>

            {/* Public/General Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-300">
              <button
                onClick={() => setIsCompModalOpen(true)}
                className="px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition flex items-center gap-1.5"
              >
                <Droplet className="w-3.5 h-3.5 text-crimson-400" />
                Compatibility Matrix
              </button>

              {isAuthenticated && (
                <Link
                  to={getDashboardPath(user?.role)}
                  className="px-3 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition flex items-center gap-1.5 text-crimson-300"
                >
                  <Activity className="w-3.5 h-3.5" />
                  My Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Stack */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 text-xs font-bold text-slate-200 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Demo Switcher:</span>
                <span className="text-amber-300 font-extrabold">{user ? user.role : 'Select Role'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isDemoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-bold text-slate-400">
                    Switch Active Demo Role (Instant Auth)
                  </div>
                  {(['DONOR', 'PATIENT', 'HOSPITAL', 'BLOOD_BANK', 'ADMIN'] as UserRole[]).map((role) => {
                    const cred = DEMO_CREDENTIALS[role];
                    return (
                      <button
                        key={role}
                        onClick={() => handleDemoSwitch(role)}
                        className={`w-full text-left p-2.5 rounded-xl transition flex flex-col gap-0.5 ${
                          user?.role === role
                            ? 'bg-crimson-950/60 border border-crimson-700/50'
                            : 'hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">{role}</span>
                          {user?.role === role && (
                            <span className="text-[10px] font-bold text-crimson-400">ACTIVE</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-300">{cred.name}</span>
                        <span className="text-[10px] text-slate-500">{cred.description}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Emergency CTA Button */}
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-crimson-600 to-rose-600 hover:from-crimson-500 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-crimson-900/50 transition transform active:scale-95"
            >
              <HeartPulse className="w-4 h-4 animate-bounce" />
              <span>REQUEST BLOOD</span>
            </button>

            {/* Notifications Dropdown (If Logged In) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                  className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-crimson-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-crimson-400" /> Notifications ({unreadCount} unread)
                      </h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] text-crimson-400 hover:text-crimson-300 font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              markAsRead(n._id);
                              if (n.link) navigate(n.link);
                              setIsNotifDropdownOpen(false);
                            }}
                            className={`p-3 text-xs cursor-pointer hover:bg-slate-850 transition flex flex-col gap-1 ${
                              n.status === 'UNREAD' ? 'bg-crimson-950/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-100 flex items-center gap-1">
                                {n.status === 'UNREAD' && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-crimson-500"></span>
                                )}
                                {n.title}
                              </span>
                              <span className="text-[9px] text-slate-500">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown or Login */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-crimson-600 flex items-center justify-center text-white font-bold text-xs">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-400">{user?.role}</p>
                    </div>

                    <Link
                      to={getDashboardPath(user?.role)}
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      Dashboard
                    </Link>

                    {user?.role === 'DONOR' && (
                      <Link
                        to="/donor/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                      >
                        Donor Profile & Health
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-crimson-400 hover:bg-crimson-950/40 transition flex items-center gap-1.5 mt-1 border-t border-slate-800"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Modals */}
      <EmergencyRequestModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onRequestCreated={() => {
          if (isAuthenticated) {
            navigate(getDashboardPath(user?.role));
          }
        }}
      />

      <CompatibilityMatrixModal
        isOpen={isCompModalOpen}
        onClose={() => setIsCompModalOpen(false)}
        defaultGroup={user?.bloodGroup !== 'UNKNOWN' ? user?.bloodGroup : 'O-'}
      />
    </>
  );
};
