import React, { useState } from 'react';
import { BloodGroup, RequestUrgency } from '../../types';
import { requestService, CreateRequestPayload } from '../../services/requestService';
import { useNotifications } from '../../context/NotificationContext';
import { HeartPulse, AlertTriangle, Building, User, Droplet, Clock, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { BloodGroupBadge } from '../common/BloodGroupBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated?: (newRequest: any) => void;
}

const COMMON_HOSPITALS = [
  { name: 'Metropolitan General Hospital', address: '100 Medical Boulevard, Central Wing', contact: '+1-555-0911', city: 'Metropolis' },
  { name: 'St. Jude Apex Medical Center', address: '450 North Medical Way', contact: '+1-555-0912', city: 'Metropolis' },
  { name: 'Apollo Lifecare Emergency Wing', address: '88 South Ring Avenue', contact: '+1-555-0913', city: 'Metropolis' },
  { name: 'Fortis Emergency Care Institute', address: '12 East Campus Boulevard', contact: '+1-555-0914', city: 'Metropolis' },
  { name: 'City Trauma & Surgical Center', address: '77 West Industrial Road', contact: '+1-555-0915', city: 'Metropolis' },
];

export const EmergencyRequestModal: React.FC<Props> = ({ isOpen, onClose, onRequestCreated }) => {
  const { addToast } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  const [formData, setFormData] = useState<{
    patientName: string;
    bloodGroup: BloodGroup;
    units: number;
    hospitalName: string;
    hospitalAddress: string;
    hospitalContact: string;
    urgency: RequestUrgency;
    requiredWithinHours: number;
    additionalInfo: string;
  }>({
    patientName: '',
    bloodGroup: 'O-',
    units: 2,
    hospitalName: COMMON_HOSPITALS[0].name,
    hospitalAddress: COMMON_HOSPITALS[0].address,
    hospitalContact: COMMON_HOSPITALS[0].contact,
    urgency: 'CRITICAL',
    requiredWithinHours: 2,
    additionalInfo: '',
  });

  if (!isOpen) return null;

  const handleHospitalSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = COMMON_HOSPITALS.find((h) => h.name === e.target.value);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        hospitalName: selected.name,
        hospitalAddress: selected.address,
        hospitalContact: selected.contact,
      }));
    } else {
      setFormData((prev) => ({ ...prev, hospitalName: e.target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName) {
      addToast('Missing Info', 'Please enter patient name', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateRequestPayload = {
        patientName: formData.patientName,
        bloodGroup: formData.bloodGroup,
        units: Number(formData.units),
        hospital: {
          name: formData.hospitalName,
          address: formData.hospitalAddress,
          contactNumber: formData.hospitalContact,
          city: 'Metropolis',
        },
        urgency: formData.urgency,
        requiredBy: new Date(Date.now() + formData.requiredWithinHours * 60 * 60 * 1000).toISOString(),
        additionalInfo: formData.additionalInfo,
      };

      const res = await requestService.createRequest(payload);
      if (res.success) {
        setSuccessData(res);
        addToast(
          '🚨 Broadcast Dispatched!',
          `Notified ${res.matchSummary?.totalMatchedDonors || 0} compatible donors within 15 km.`,
          'emergency'
        );
        if (onRequestCreated) {
          onRequestCreated(res.request);
        }
      }
    } catch (err: any) {
      addToast('Request Failed', err.message || 'Could not dispatch emergency request', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allBloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 text-sm rounded-xl hover:bg-slate-800 transition"
        >
          ✕
        </button>

        {!successData ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-crimson-600/20 border border-crimson-500/50 flex items-center justify-center text-crimson-400">
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  Create Emergency Blood Request
                </h3>
                <p className="text-xs text-slate-400">
                  Instant progressive broadcast to verified compatible donors & hospitals
                </p>
              </div>
            </div>

            {/* Urgency Level Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                Emergency Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { level: 'CRITICAL', label: 'Critical (Under 2 hrs)', desc: 'Immediate OT / Trauma', color: 'border-crimson-500 bg-crimson-950/40 text-crimson-300' },
                  { level: 'URGENT', label: 'Urgent (Under 6 hrs)', desc: 'Stabilization / ICU', color: 'border-amber-500 bg-amber-950/40 text-amber-300' },
                  { level: 'NORMAL', label: 'Normal (Under 24 hrs)', desc: 'Scheduled Procedure', color: 'border-slate-700 bg-slate-950/40 text-slate-300' },
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, urgency: item.level as RequestUrgency }))}
                    className={`p-3 rounded-2xl border text-left transition ${
                      formData.urgency === item.level
                        ? `${item.color} shadow-lg ring-1 ring-crimson-500`
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block font-extrabold text-xs">{item.level}</span>
                    <span className="block text-[10px] opacity-75 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Patient Name & Blood Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Patient Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.patientName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, patientName: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-crimson-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-crimson-400" /> Required Blood Group
                </label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bloodGroup: e.target.value as BloodGroup }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-crimson-500 transition"
                >
                  {allBloodGroups.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg} {bg === 'O-' ? '(Universal Donor)' : bg === 'AB+' ? '(Universal Recipient)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Units & Timeframe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Units Required (Pints / Units)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.units}
                  onChange={(e) => setFormData((prev) => ({ ...prev, units: Number(e.target.value) }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-crimson-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Required Within
                </label>
                <select
                  value={formData.requiredWithinHours}
                  onChange={(e) => setFormData((prev) => ({ ...prev, requiredWithinHours: Number(e.target.value) }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-crimson-500 transition"
                >
                  <option value={1}>1 Hour (Emergency)</option>
                  <option value={2}>2 Hours</option>
                  <option value={4}>4 Hours</option>
                  <option value={8}>8 Hours</option>
                  <option value={24}>24 Hours</option>
                </select>
              </div>
            </div>

            {/* Hospital Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" /> Destination Hospital
              </label>
              <select
                value={formData.hospitalName}
                onChange={handleHospitalSelect}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-crimson-500 transition mb-2"
              >
                {COMMON_HOSPITALS.map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name} — {h.address}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Hospital Contact / Extension Number"
                value={formData.hospitalContact}
                onChange={(e) => setFormData((prev) => ({ ...prev, hospitalContact: e.target.value }))}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-slate-600 transition"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Clinical Details / Ward Info (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Patient is in Trauma ICU, Bed #4. Immediate cross-match ready."
                value={formData.additionalInfo}
                onChange={(e) => setFormData((prev) => ({ ...prev, additionalInfo: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-crimson-500 transition"
              />
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-crimson-600 to-rose-600 hover:from-crimson-500 hover:to-rose-500 shadow-xl shadow-crimson-900/50 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Broadcasting to Compatible Donors...
                </>
              ) : (
                <>
                  <HeartPulse className="w-5 h-5 animate-bounce" />
                  DISPATCH EMERGENCY BROADCAST
                </>
              )}
            </button>
          </form>
        ) : (
          /* Success Screen */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h4 className="text-2xl font-black text-white">Emergency Request Live!</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Broadcast dispatched to verified compatible donors. Hospitals and blood banks in your vicinity have been alerted.
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 max-w-md mx-auto text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Verification Code:</span>
                <span className="font-mono font-bold text-crimson-400 text-sm">
                  {successData.request?.verificationCode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Blood Group:</span>
                <BloodGroupBadge group={successData.request?.bloodGroup} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Matched Donors Alerted:</span>
                <span className="text-emerald-400 font-bold">
                  {successData.matchSummary?.totalMatchedDonors || 0} Donors (15 km radius)
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
            >
              Done & View Tracking
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
