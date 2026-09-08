import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { donorService } from '../../services/donorService';
import { requestService } from '../../services/requestService';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { EmergencyBadge } from '../../components/common/EmergencyBadge';
import { HeartPulse, MapPin, Building, Phone, CheckCircle2, Clock, Check, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DonorRequests: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await donorService.getDashboard();
      if (res.success) {
        setRequests(res.nearbyEmergencyRequests || []);
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

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    try {
      const res = await requestService.respondToRequest(id, 'ACCEPT');
      if (res.success) {
        confetti({ particleCount: 70, spread: 60 });
        addToast(
          '💚 Donation Accepted!',
          `Verification code: ${res.verificationCode}. Please head to hospital transfusion wing.`,
          'success'
        );
        fetchRequests();
      }
    } catch (err: any) {
      addToast('Error', err.message, 'warning');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Emergency Blood Requests Feed</h1>
        <p className="text-xs text-slate-400 mt-1">
          Active urgent broadcasts matching your blood group compatibility in Metropolis.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-crimson-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No active emergency requests in your radius</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All current patient blood requests are fulfilled or matched. We will immediately ping your device when a compatible emergency arrives.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req: any) => (
            <div
              key={req.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BloodGroupBadge group={req.bloodGroup} size="md" />
                    <EmergencyBadge urgency={req.urgency} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-white">{req.hospitalName}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-crimson-400 shrink-0" />
                    {req.distanceFormatted} • {req.hospitalAddress}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Required Units:</span>
                    <span className="font-bold text-white">{req.units} Units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Required By:</span>
                    <span className="text-amber-300 font-semibold">
                      {new Date(req.requiredBy).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => handleAccept(req.id)}
                  disabled={acceptingId === req.id}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-crimson-600 to-rose-600 hover:from-crimson-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-md shadow-crimson-900/40 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                >
                  {acceptingId === req.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  I CAN DONATE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
