import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { BarChart3, TrendingUp, HeartPulse, ShieldAlert, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const URGENCY_COLORS = {
  CRITICAL: '#e11d48',
  URGENT: '#f59e0b',
  NORMAL: '#64748b',
};

export const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getAnalytics();
        if (res.success) {
          setAnalytics(res);
        }
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
  const urgencyData = (analytics?.urgencyDistribution || []).map((u: any) => ({
    name: u._id,
    value: u.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Platform Analytics &amp; Emergency Trends</h1>
        <p className="text-xs text-slate-400 mt-1">
          In-depth demand forecasting, blood group deficit gaps, and emergency urgency distribution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand vs Supply Chart (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-white">
            Blood Units Requested (Demand) vs. In-Stock (Supply)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bloodGroup" stroke="#94a3b8" fontSize={11} fontWeight={700} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="demandUnits" fill="#e11d48" name="Demand Units" radius={[6, 6, 0, 0]} />
                <Bar dataKey="availableUnits" fill="#10b981" name="Supply Stock" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgency Breakdown (1 Col) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-white">Requests by Urgency Level</h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={urgencyData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {urgencyData.map((entry: any) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={URGENCY_COLORS[entry.name as keyof typeof URGENCY_COLORS] || '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs border-t border-slate-800 pt-3">
            <span className="flex items-center gap-1.5 font-bold text-crimson-400">
              <span className="w-2.5 h-2.5 rounded-full bg-crimson-500"></span> CRITICAL
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> URGENT
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> NORMAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
