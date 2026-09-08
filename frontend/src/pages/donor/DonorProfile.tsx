import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { donorService } from '../../services/donorService';
import { BloodGroup } from '../../types';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { User, Mail, Phone, Calendar, MapPin, ShieldCheck, Save, Loader2 } from 'lucide-react';

export const DonorProfile: React.FC = () => {
  const { user, updateUserLocal } = useAuth();
  const { addToast } = useNotifications();

  const [phone, setPhone] = useState(user?.phone || '');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(user?.bloodGroup || 'O+');
  const [age, setAge] = useState(user?.age || 28);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>(user?.gender || 'MALE');
  const [address, setAddress] = useState(user?.location?.address || 'Park Street, Downtown');
  const [isSaving, setIsSaving] = useState(false);

  const allBloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await donorService.updateProfile({
        phone,
        bloodGroup,
        age: Number(age),
        gender,
        location: {
          address,
          city: user?.location?.city || 'Metropolis',
          coordinates: user?.location?.coordinates || { lat: 28.6139, lng: 77.2090 },
        },
      });

      if (res.success) {
        updateUserLocal(res.user);
        addToast('Profile Updated', 'Your medical and contact details have been saved.', 'success');
      }
    } catch (err: any) {
      addToast('Error', err.message || 'Could not update profile', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Donor Profile &amp; Medical Details</h1>
        <p className="text-xs text-slate-400 mt-1">
          Keep your medical eligibility and contact coordinates up to date for emergency alerts.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        {/* Medical Eligibility Banner */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-emerald-300">Medically Validated Donor Status</h4>
            <p className="text-slate-300 mt-0.5 leading-relaxed">
              {user?.eligibility?.reason || 'Verified as active whole blood emergency donor.'}
            </p>
            {user?.eligibility?.lastDonationDate && (
              <span className="text-[10px] text-slate-400 block mt-1">
                Last donation date: {new Date(user.eligibility.lastDonationDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-crimson-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-crimson-500 transition"
              >
                {allBloodGroups.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Age</label>
              <input
                type="number"
                min={18}
                max={65}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-crimson-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-crimson-500 transition"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Residential Area / Sector</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-crimson-500 transition"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              🔒 Privacy Guaranteed: Your exact street address and GPS coordinates are never publicly shown.
            </span>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-xs shadow-md shadow-crimson-900/40 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
