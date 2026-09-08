import React, { useState } from 'react';
import { donationService } from '../../services/donationService';
import { useNotifications } from '../../context/NotificationContext';
import { ShieldCheck, CheckCircle2, HeartPulse, User, Award, Check, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const HospitalVerification: React.FC = () => {
  const { addToast } = useNotifications();

  const [code, setCode] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [units, setUnits] = useState(1);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<any>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      addToast('Missing Code', 'Please enter 6-character check-in code', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await donationService.verifyDonation({
        verificationCode: code.trim().toUpperCase(),
        bloodGroup,
        units: Number(units),
        notes,
      });

      if (res.success) {
        confetti({ particleCount: 100, spread: 80 });
        setVerifiedResult(res);
        addToast('Verification Successful', `Issued certificate ${res.certificateId}`, 'success');
      }
    } catch (err: any) {
      addToast('Verification Error', err.message || 'Invalid verification code', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Donor Check-In &amp; Transfusion Verification</h1>
        <p className="text-xs text-slate-400 mt-1">
          Verify donor arrival code, confirm clinical crossmatch, and award official donation certificate.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        {!verifiedResult ? (
          <form onSubmit={handleVerify} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-2">
                Donor Verification Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LL-882190"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3.5 text-lg font-mono font-black text-center tracking-widest text-white uppercase focus:outline-none focus:border-crimson-500 transition"
              />
              <span className="text-[10px] text-slate-500 mt-1 block text-center">
                Provided on the donor's mobile app screen upon arrival.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Confirmed Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-crimson-500 transition"
                >
                  {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Units Collected</label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={units}
                  onChange={(e) => setUnits(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-crimson-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Hematology Lab Notes / Crossmatch ID (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Crossmatching confirmed compatible. Whole blood draw completed."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-crimson-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> Confirm Transfusion &amp; Issue Certificate
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-black text-white">Transfusion Verified!</h3>
            <p className="text-xs text-slate-300">
              The blood request has been marked as verified, LifePoints have been awarded to the donor, and an official digital certificate has been created.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Certificate ID:</span>
                <span className="font-mono font-bold text-crimson-400 text-sm">
                  {verifiedResult.certificateId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Awarded LifePoints:</span>
                <span className="font-bold text-amber-400">
                  +{verifiedResult.donation?.lifePointsAwarded} LifePoints
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setVerifiedResult(null);
                setCode('');
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Verify Another Donor
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
