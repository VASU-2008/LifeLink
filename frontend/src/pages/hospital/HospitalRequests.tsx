import React, { useState, useEffect } from 'react';
import { requestService } from '../../services/requestService';
import { BloodRequest } from '../../types';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { EmergencyBadge } from '../../components/common/EmergencyBadge';
import { EmergencyRequestModal } from '../../components/emergency/EmergencyRequestModal';
import { HeartPulse, Plus, Radio, Loader2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const HospitalRequests: React.FC = () => {
  const { addToast } = useNotifications();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const handleEscalate = async (id: string) => {
    try {
      const res = await requestService.escalateRadius(id, 35);
      if (res.success) {
        addToast('Broadcast Escalated', res.message, 'emergency');
        fetchRequests();
      }
    } catch (err: any) {
      addToast('Escalation Failed', err.message, 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Emergency Blood Requests Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch, track, and escalate emergency blood broadcasts across all hospital departments.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-xs shadow-md shadow-crimson-900/40 flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Emergency Request
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-crimson-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
          No blood requests recorded yet.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Code</th>
                  <th className="py-4 px-6">Patient</th>
                  <th className="py-4 px-6">Blood Group</th>
                  <th className="py-4 px-6">Units</th>
                  <th className="py-4 px-6">Urgency</th>
                  <th className="py-4 px-6">Required By</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Escalate Radius</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-850/50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-crimson-400">{r.verificationCode}</td>
                    <td className="py-4 px-6 font-bold text-white">{r.patientName}</td>
                    <td className="py-4 px-6">
                      <BloodGroupBadge group={r.bloodGroup} size="sm" />
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-200">{r.units} Units</td>
                    <td className="py-4 px-6">
                      <EmergencyBadge urgency={r.urgency} />
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(r.requiredBy).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-300">{r.status.replace('_', ' ')}</td>
                    <td className="py-4 px-6 text-right">
                      {r.status === 'REQUESTED' || r.status === 'MATCHED' ? (
                        <button
                          onClick={() => handleEscalate(r._id)}
                          className="px-3 py-1.5 rounded-xl bg-purple-950 text-purple-300 hover:bg-purple-900 border border-purple-800 font-bold text-[10px] transition inline-flex items-center gap-1"
                        >
                          <Radio className="w-3 h-3" /> Expand to 35km
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px]">In Progress / Fulfilled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EmergencyRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRequestCreated={() => fetchRequests()}
      />
    </div>
  );
};
