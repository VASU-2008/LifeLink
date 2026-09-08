import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestService } from '../../services/requestService';
import { donationService } from '../../services/donationService';
import { BloodRequest } from '../../types';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { EmergencyBadge } from '../../components/common/EmergencyBadge';
import { EmergencyRequestModal } from '../../components/emergency/EmergencyRequestModal';
import {
  Hospital,
  HeartPulse,
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  Building2,
  Plus,
  ArrowRight,
  Check,
  Loader2,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import confetti from 'canvas-confetti';
import { useNotifications } from '../../context/NotificationContext';

export const HospitalDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await requestService.getRequests();
      if (res.success) {
        setRequests(res.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleQuickVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCodeInput.trim()) return;

    setIsVerifying(true);
    try {
      const res = await donationService.verifyDonation({
        verificationCode: verificationCodeInput.trim().toUpperCase(),
      });
      if (res.success) {
        confetti({ particleCount: 90, spread: 70 });
        addToast(
          'Donation Verified!',
          `Issued certificate ${res.certificateId}. LifePoints awarded to donor.`,
          'success'
        );
        setVerificationCodeInput('');
        fetchRequests();
      }
    } catch (err: any) {
      addToast('Verification Failed', err.message || 'Invalid code', 'warning');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStatusUpdate = async (reqId: string, nextStatus: string) => {
    try {
      const res = await requestService.updateStatus(reqId, nextStatus);
      if (res.success) {
        addToast('Status Updated', `Request status updated to ${nextStatus}`, 'success');
        fetchRequests();
      }
    } catch (err: any) {
      addToast('Error', err.message, 'warning');
    }
  };

  const activeEmergencies = requests.filter((r) =>
    ['REQUESTED', 'MATCHED', 'DONOR_ACCEPTED', 'DONOR_ARRIVED'].includes(r.status)
  );

  const chartData = [
    { urgency: 'CRITICAL', avgTimeMin: 2.1, matched: 12 },
    { urgency: 'URGENT', avgTimeMin: 4.5, matched: 8 },
    { urgency: 'NORMAL', avgTimeMin: 14.0, matched: 15 },
  ];

  return (
    <div className="space-y-6">
      {/* Hospital Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white">{user?.name}</h1>
            <span className="text-xs bg-blue-950 text-blue-300 border border-blue-700/60 px-2.5 py-0.5 rounded-full font-bold">
              Level 1 Trauma Center
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Emergency Transfusion &amp; Clinical Blood Logistics Center
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-crimson-600 to-rose-600 hover:from-crimson-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-xl shadow-crimson-900/50 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Emergency Request</span>
          </button>
        </div>
      </div>

      {/* Quick Donor Check-In Box & KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Verification Form */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-extrabold text-white">Rapid Donor Arrival Verification</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter donor's 6-character check-in code (e.g. <strong className="text-crimson-400 font-mono">LL-882190</strong>) upon blood bank / OT arrival.
          </p>

          <form onSubmit={handleQuickVerify} className="space-y-3">
            <input
              type="text"
              placeholder="e.g. LL-882190"
              value={verificationCodeInput}
              onChange={(e) => setVerificationCodeInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 font-mono font-black text-center tracking-widest text-base text-white uppercase focus:outline-none focus:border-crimson-500 transition"
            />

            <button
              type="submit"
              disabled={isVerifying || !verificationCodeInput.trim()}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/40 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Verify Arrival &amp; Complete Donation
            </button>
          </form>
        </div>

        {/* Analytics Card */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">Emergency Response Time by Urgency</h3>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              Average Match Time: 2.1 Mins
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="urgency" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="avgTimeMin" fill="#e11d48" radius={[8, 8, 0, 0]} name="Avg Time (Minutes)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Emergencies Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-crimson-500 animate-pulse" />
            <h3 className="text-base font-extrabold text-white">Active Hospital Blood Requests</h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {activeEmergencies.length} Active in Emergency Wing
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-6 h-6 animate-spin text-crimson-500" />
          </div>
        ) : activeEmergencies.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            No active emergency requests pending.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-4 px-6">Verification Code</th>
                    <th className="py-4 px-6">Patient</th>
                    <th className="py-4 px-6">Group</th>
                    <th className="py-4 px-6">Units</th>
                    <th className="py-4 px-6">Urgency</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Emergency Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeEmergencies.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-850/50 transition">
                      <td className="py-4 px-6 font-mono font-bold text-crimson-400 text-sm">
                        {r.verificationCode}
                      </td>
                      <td className="py-4 px-6 font-bold text-white">{r.patientName}</td>
                      <td className="py-4 px-6">
                        <BloodGroupBadge group={r.bloodGroup} size="sm" />
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-200">{r.units} Units</td>
                      <td className="py-4 px-6">
                        <EmergencyBadge urgency={r.urgency} />
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[11px] font-bold text-slate-200">{r.status.replace('_', ' ')}</span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {r.status === 'DONOR_ACCEPTED' && (
                          <button
                            onClick={() => handleStatusUpdate(r._id, 'DONOR_ARRIVED')}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition"
                          >
                            Mark Arrived
                          </button>
                        )}
                        {(r.status === 'DONOR_ARRIVED' || r.status === 'DONOR_ACCEPTED') && (
                          <button
                            onClick={() => handleStatusUpdate(r._id, 'DONATION_VERIFIED')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition"
                          >
                            Verify Donation
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <EmergencyRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRequestCreated={() => fetchRequests()}
      />
    </div>
  );
};
