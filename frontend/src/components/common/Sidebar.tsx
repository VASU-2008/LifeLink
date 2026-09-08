import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  HeartPulse,
  Award,
  History,
  User,
  ShieldCheck,
  Building2,
  Users,
  AlertTriangle,
  BarChart3,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BloodGroupBadge } from './BloodGroupBadge';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  let navItems: SidebarItem[] = [];

  switch (user.role) {
    case 'DONOR':
      navItems = [
        { label: 'Overview', path: '/donor/dashboard', icon: LayoutDashboard },
        { label: 'Emergency Feed', path: '/donor/requests', icon: HeartPulse },
        { label: 'Donation History', path: '/donor/donations', icon: History },
        { label: 'LifePoints & Badges', path: '/donor/rewards', icon: Award, badge: `${user.lifePoints} pts` },
        { label: 'Donor Profile', path: '/donor/profile', icon: User },
      ];
      break;

    case 'PATIENT':
      navItems = [
        { label: 'Overview', path: '/patient/dashboard', icon: LayoutDashboard },
        { label: 'My Requests', path: '/patient/requests', icon: HeartPulse },
      ];
      break;

    case 'HOSPITAL':
      navItems = [
        { label: 'Emergency Center', path: '/hospital/dashboard', icon: LayoutDashboard },
        { label: 'All Requests', path: '/hospital/requests', icon: HeartPulse },
        { label: 'Donor Check-In', path: '/hospital/verification', icon: ShieldCheck },
        { label: 'Blood Bank Network', path: '/hospital/blood-banks', icon: Building2 },
      ];
      break;

    case 'BLOOD_BANK':
      navItems = [
        { label: 'Inventory Overview', path: '/bloodbank/dashboard', icon: LayoutDashboard },
        { label: 'Manage Batches', path: '/bloodbank/inventory', icon: Package },
        { label: 'Shortage Forecasts', path: '/bloodbank/shortages', icon: AlertTriangle },
      ];
      break;

    case 'ADMIN':
      navItems = [
        { label: 'Platform Metrics', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Verification', path: '/admin/users', icon: Users },
        { label: 'Fraud & Abuse Monitor', path: '/admin/fraud', icon: ShieldCheck },
        { label: 'Network Analytics', path: '/admin/analytics', icon: BarChart3 },
      ];
      break;
  }

  return (
    <aside className="w-64 bg-slate-950/60 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div>
        {/* User Role Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-crimson-600/20 border border-crimson-500/40 flex items-center justify-center text-crimson-400 font-extrabold text-sm">
            {user.name[0]}
          </div>
          <div className="overflow-hidden">
            <h5 className="font-bold text-xs text-white truncate">{user.name}</h5>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] uppercase font-extrabold text-crimson-400 tracking-wider">
                {user.role}
              </span>
              {user.bloodGroup !== 'UNKNOWN' && (
                <BloodGroupBadge group={user.bloodGroup} size="sm" />
              )}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path.endsWith('/dashboard')}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-crimson-600 text-white shadow-lg shadow-crimson-900/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-950/60 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Safety Badge in Sidebar */}
      <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center">
        <span className="text-[10px] text-slate-500 font-medium block">
          24/7 Rapid Emergency Response
        </span>
        <span className="text-[11px] font-mono font-bold text-crimson-400">
          Emergency Hotline: 1-800-LIFELINK
        </span>
      </div>
    </aside>
  );
};
