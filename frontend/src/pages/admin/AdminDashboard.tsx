import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import {
  Users,
  Building,
  HeartPulse,
  ShieldCheck,
  Clock,
  Package,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, aRes] = await Promise.all([
          adminService.getMetrics(),
          adminService.getAnalytics(),
        ]);
        if (mRes.success) setMetrics(mRes.metrics);
        if (aRes.success) setAnalytics(aRes);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-crimson-500" />
      </div>
    );
  }

  const comparisonData = analytics?.bloodGroupComparison || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Platform Administrator Overview</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time network health, clinical response metrics, and fraud monitoring across Metropolis.
        </p>
      </div>

      {/* Primary KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* North Star Metric */}
        <div className="p-5 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-900 to-crimson-950/50 border border-crimson-700/60 shadow-xl">
          <span className="text-[10px] font-bold text-crimson-400 uppercase tracking-widest block">
            North Star Metric
          </span>
          <h4 className="text-xs font-bold text-slate-300 mt-1">Average Time-To-Match</h4>
          <p className="text-3xl font-black text-white font-mono mt-2">
            {metrics?.avgTimeToMatchFormatted || '2m 14s'}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
            ⚡ 68% faster than regional baseline
          </span>
        </div>

        {/* Active Emergencies */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Emergencies</span>
            <HeartPulse className="w-4 h-4 text-crimson-500 animate-pulse" />
          </div>
          <p className="text-3xl font-black text-white font-mono mt-2">{metrics?.activeEmergencies || 0}</p>
          <span className="text-[10px] text-slate-400 block mt-1">In progress across hospitals</span>
        </div>

        {/* Total Network Donors */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Donors</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono mt-2">{metrics?.totalDonors || 0}</p>
          <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
            Active volunteer pool
          </span>
        </div>

        {/* Available Blood Units */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reserve Stock Units</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white font-mono mt-2">
            {metrics?.totalBloodUnitsAvailable || 0}
          </p>
          <span className="text-[10px] text-purple-300 font-semibold block mt-1">Across 5 blood banks</span>
        </div>
      </div>

      {/* Blood Group Demand vs Available Supply Chart */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">
              Regional Blood Demand vs. Available Stock by ABO/Rh Group
            </h3>
            <p className="text-xs text-slate-400">
              Aggregated from live emergency requests vs verified blood bank batches.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            Real-Time Analysis
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="bloodGroup" stroke="#94a3b8" fontSize={12} fontWeight={700} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="demandUnits" fill="#e11d48" name="Requested Units (Demand)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="availableUnits" fill="#10b981" name="Available Stock (Supply)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Facilities & Fraud Counter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Certified Hospitals
            </span>
            <span className="text-2xl font-black text-white font-mono mt-1 block">
              {metrics?.totalHospitals || 0}
            </span>
          </div>
          <Building className="w-8 h-8 text-blue-400" />
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Pending Verifications
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
              {metrics?.pendingVerifications || 0}
            </span>
          </div>
          <Clock className="w-8 h-8 text-amber-400" />
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Fraud / Risk Alerts
            </span>
            <span className="text-2xl font-black text-crimson-400 font-mono mt-1 block">
              {metrics?.fraudAlertsCount || 0}
            </span>
          </div>
          <AlertTriangle className="w-8 h-8 text-crimson-400" />
        </div>
      </div>
    </div>
  );
};
