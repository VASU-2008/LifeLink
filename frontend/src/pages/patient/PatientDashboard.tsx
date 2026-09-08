import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { requestService } from '../../services/requestService';
import { BloodRequest } from '../../types';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { EmergencyBadge } from '../../components/common/EmergencyBadge';
import { EmergencyRequestModal } from '../../components/emergency/EmergencyRequestModal';
import { RequestStatusStepper } from '../../components/emergency/RequestStatusStepper';
import {
  HeartPulse,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building,
  UserCheck,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await requestService.getRequests();
      if (res.success) {
        setRequests(res.requests);
        if (res.requests.length > 0 && !selectedRequest) {
          setSelectedRequest(res.requests[0]);
        }
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

  const activeRequests = requests.filter((r) =>
    ['REQUESTED', 'MATCHED', 'DONOR_ACCEPTED', 'DONOR_ARRIVED'].includes(r.status)
  );

  return (
    <div className="space-y-6">
      {/* Patient Hero Action Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-crimson-950/30 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-white">Patient Emergency Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create emergency blood broadcasts and monitor live donor matches &amp; hospital arrivals in real-time.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-crimson-600 to-rose-600 hover:from-crimson-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-xl shadow-crimson-900/50 flex items-center gap-2 transition transform active:scale-95 shrink-0"
        >
          <HeartPulse className="w-4 h-4 animate-pulse" />
          <span>CREATE EMERGENCY REQUEST</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Active Emergency Broadcasts
          </span>
          <span className="text-3xl font-black text-crimson-400 mt-2 block font-mono">
            {activeRequests.length}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Completed Transfusions
          </span>
          <span className="text-3xl font-black text-emerald-400 mt-2 block font-mono">
            {requests.filter((r) => r.status === 'DONATION_VERIFIED' || r.status === 'COMPLETED').length}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Target Blood Group
          </span>
          <div className="mt-2">
            <BloodGroupBadge group={user?.bloodGroup || 'A+'} size="md" />
          </div>
        </div>
      </div>

      {/* Live Active Tracker */}
      {selectedRequest && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Live Request Tracker:
                </span>
                <span className="font-mono font-bold text-crimson-400 text-sm">
                  {selectedRequest.verificationCode}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                Patient: {selectedRequest.patientName} ({selectedRequest.units} Units of{' '}
                {selectedRequest.bloodGroup})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <BloodGroupBadge group={selectedRequest.bloodGroup} size="md" />
              <EmergencyBadge urgency={selectedRequest.urgency} />
            </div>
          </div>

          {/* Stepper */}
          <RequestStatusStepper
            status={selectedRequest.status}
            timeToMatchSeconds={selectedRequest.timeToMatchSeconds}
          />

          {/* Request Details Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Destination Hospital</span>
              <span className="font-bold text-white block text-sm">{selectedRequest.hospital?.name}</span>
              <span className="text-slate-400 block">{selectedRequest.hospital?.address}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Matched Donors Status</span>
              <span className="font-bold text-emerald-400 block text-sm">
                {selectedRequest.acceptedDonor ? 'Donor Accepted & En Route' : `${selectedRequest.matchedDonorsCount || 0} Donors Alerted`}
              </span>
              <span className="text-slate-400 block">Progressive search radius active (15 km)</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Hospital Check-In Code</span>
              <span className="font-mono font-extrabold text-crimson-400 block text-lg">
                {selectedRequest.verificationCode}
              </span>
              <span className="text-slate-400 block text-[10px]">Present code at hospital transfusion desk</span>
            </div>
          </div>
        </div>
      )}

      {/* All Requests List */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-white">Your Blood Requests History</h3>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-6 h-6 animate-spin text-crimson-500" />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
            No blood requests created yet. Click "Create Emergency Request" to broadcast when needed.
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
                    <th className="py-4 px-6">Hospital</th>
                    <th className="py-4 px-6">Urgency</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {requests.map((r) => (
                    <tr
                      key={r._id}
                      className={`hover:bg-slate-850/50 transition cursor-pointer ${
                        selectedRequest?._id === r._id ? 'bg-crimson-950/20' : ''
                      }`}
                      onClick={() => setSelectedRequest(r)}
                    >
                      <td className="py-4 px-6 font-mono font-bold text-crimson-400">{r.verificationCode}</td>
                      <td className="py-4 px-6 font-bold text-white">{r.patientName}</td>
                      <td className="py-4 px-6">
                        <BloodGroupBadge group={r.bloodGroup} size="sm" />
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-200">{r.units} Units</td>
                      <td className="py-4 px-6 text-slate-300">{r.hospital?.name}</td>
                      <td className="py-4 px-6">
                        <EmergencyBadge urgency={r.urgency} />
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[11px] font-bold text-slate-200">{r.status.replace('_', ' ')}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedRequest(r)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] transition"
                        >
                          Track
                        </button>
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequestCreated={() => fetchRequests()}
      />
    </div>
  );
};
