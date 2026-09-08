import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { donorService } from '../../services/donorService';
import { requestService } from '../../services/requestService';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { EmergencyBadge } from '../../components/common/EmergencyBadge';
import {
  HeartPulse,
  Award,
  ShieldCheck,
  Calendar,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Check,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DonorDashboard: React.FC = () => {
  const { user, updateUserLocal } = useAuth();
  const { addToast } = useNotifications();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [selectedRequestForDonate, setSelectedRequestForDonate] = useState<any>(null);
  const [acceptingReqId, setAcceptingReqId] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await donorService.getDashboard();
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err: any) {
      console.error('Failed to load donor dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleAvailability = async () => {
    if (!user || isToggling) return;
    const newStatus = !user.availability;
    setIsToggling(true);
    try {
      const res = await donorService.toggleAvailability(newStatus);
      if (res.success) {
        updateUserLocal({ availability: newStatus });
        addToast(
          'Availability Updated',
          `Your status is now ${newStatus ? 'ONLINE & READY TO DONATE' : 'OFFLINE'}`,
          newStatus ? 'success' : 'info'
        );
      }
    } catch (err: any) {
      addToast('Error', err.message, 'warning');
    } finally {
      setIsToggling(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setAcceptingReqId(requestId);
    try {
      const res = await requestService.respondToRequest(requestId, 'ACCEPT');
      if (res.success) {
        // Trigger celebratory confetti for lifesaving action!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        addToast(
          '💚 Lifesaving Response Recorded!',
          `You accepted request! Verification Code: ${res.verificationCode}. Please proceed to hospital.`,
          'success'
        );

        setSelectedRequestForDonate(res);
        fetchDashboard();
      }
    } catch (err: any) {
      addToast('Error', err.message || 'Could not record response', 'warning');
    } finally {
      setAcceptingReqId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-crimson-500" />
      </div>
    );
  }

  const donor = dashboardData?.donor || user;
  const nearbyRequests = dashboardData?.nearbyEmergencyRequests || [];
  const recentDonations = dashboardData?.recentDonations || [];

  return (
    <div className="space-y-6">
      {/* Welcome & Availability Hero Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-crimson-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white">
              Welcome back, {donor?.name?.split(' ')[0]}!
            </h1>
            {donor?.bloodGroup && <BloodGroupBadge group={donor.bloodGroup} size="md" />}
          </div>
          <p className="text-xs text-slate-400">
            {donor?.eligibility?.isEligible
              ? '✅ You are medically eligible for emergency whole blood donation.'
              : `⏳ Next eligible donation date: ${donor?.eligibility?.nextEligibleDate ? new Date(donor.eligibility.nextEligibleDate).toLocaleDateString() : 'In 90 days'}`}
          </p>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-3 rounded-2xl">
          <div>
            <span className="text-xs font-bold text-white block">Emergency Availability</span>
            <span className="text-[10px] text-slate-400">
              {donor?.availability ? 'Broadcasts Active (Nearby)' : 'Paused / Offline'}
            </span>
          </div>

          <button
            onClick={handleToggleAvailability}
            disabled={isToggling}
            className={`p-2 rounded-xl transition flex items-center gap-1.5 text-xs font-bold ${
              donor?.availability
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {donor?.availability ? (
              <>
                <ToggleRight className="w-5 h-5 text-emerald-400" />
                <span>ONLINE</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-slate-500" />
                <span>OFFLINE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LifePoints Card */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">LifePoints</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-2 font-mono">{donor?.lifePoints || 0}</p>
          <span className="text-[10px] text-amber-300 font-semibold mt-1 block">
            Rank #{donor?.communityRank || 1} in Metropolis Community
          </span>
        </div>

        {/* Total Donations */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Donations Verified</span>
            <div className="w-8 h-8 rounded-xl bg-crimson-500/20 text-crimson-400 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-2 font-mono">
            {donor?.stats?.totalDonations || 0}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">Verified hospital transfusions</span>
        </div>

        {/* Emergency Responses */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Responses</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-2 font-mono">
            {donor?.stats?.emergencyResponses || 0}
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
            {donor?.stats?.responseRate || 98}% Response Reliability
          </span>
        </div>

        {/* Earned Badges */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Earned Badges</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-2 font-mono">
            {donor?.badges?.length || 0}
          </p>
          <span className="text-[10px] text-purple-300 font-semibold mt-1 block">
            {donor?.badges?.[donor.badges.length - 1]?.name || 'Volunteer Donor'}
          </span>
        </div>
      </div>

      {/* Main Content Split: Nearby Emergency Broadcasts & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nearby Emergency Requests (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-crimson-500 animate-pulse" />
              <h3 className="text-base font-extrabold text-white">Live Nearby Emergency Requests</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {nearbyRequests.length} Compatible in Radius
            </span>
          </div>

          {nearbyRequests.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-sm text-white">No active critical emergencies in your radius</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Thank you for staying active! You will automatically receive a high-priority alert when a compatible patient requires emergency transfusion.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {nearbyRequests.map((req: any) => (
                <div
                  key={req.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <BloodGroupBadge group={req.bloodGroup} size="md" />
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          {req.hospitalName}
                        </h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {req.distanceFormatted} ({req.hospitalAddress})
                        </p>
                      </div>
                    </div>
                    <EmergencyBadge urgency={req.urgency} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                    <span className="font-semibold text-slate-400">
                      Units Required: <strong className="text-white">{req.units} Units</strong>
                    </span>

                    {/* 1-Click "I CAN DONATE" action */}
                    <button
                      onClick={() => handleAcceptRequest(req.id)}
                      disabled={acceptingReqId === req.id}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-crimson-600 to-rose-600 hover:from-crimson-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-md shadow-crimson-900/40 flex items-center gap-1.5 transition transform active:scale-95 disabled:opacity-50"
                    >
                      {acceptingReqId === req.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>I CAN DONATE</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Badges & Recent History (1 Col) */}
        <div className="space-y-6">
          {/* Active Badges */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Your Badges</h4>
              <Award className="w-4 h-4 text-purple-400" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {donor?.badges?.map((badge: any) => (
                <div
                  key={badge.id}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1"
                >
                  <div className="w-8 h-8 rounded-xl bg-crimson-950 text-crimson-400 flex items-center justify-center mx-auto text-xs font-bold">
                    🎖️
                  </div>
                  <h5 className="font-bold text-[11px] text-white truncate">{badge.name}</h5>
                  <p className="text-[9px] text-slate-400 truncate">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Verified Donations */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Recent Donations</h4>

            {recentDonations.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No donation records yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recentDonations.map((d: any) => (
                  <div
                    key={d._id}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-white text-[11px]">{d.hospital?.name}</h5>
                      <span className="text-[10px] text-slate-500">
                        {new Date(d.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal after accepting donation */}
      {selectedRequestForDonate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white">Thank you for accepting!</h3>
            <p className="text-xs text-slate-300">
              The hospital transfusion department and patient attendant have been notified of your arrival.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Your Check-In Code:</span>
                <span className="font-mono font-bold text-crimson-400 text-sm">
                  {selectedRequestForDonate.verificationCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hospital:</span>
                <span className="font-bold text-white">
                  {selectedRequestForDonate.hospitalInstructions?.hospitalName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Address:</span>
                <span className="text-slate-300">
                  {selectedRequestForDonate.hospitalInstructions?.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact:</span>
                <span className="text-slate-300">
                  {selectedRequestForDonate.hospitalInstructions?.contactNumber}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedRequestForDonate(null)}
              className="w-full py-3 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-xs transition"
            >
              I Understand &amp; Am Heading to Hospital
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
