import React, { useState, useEffect } from 'react';
import { donationService } from '../../services/donationService';
import { Donation } from '../../types';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { Award, ShieldCheck, Download, Printer, CheckCircle2, Calendar, FileText, Loader2, Sparkles } from 'lucide-react';

export const DonorDonations: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Donation | null>(null);

  const fetchDonations = async () => {
    try {
      const res = await donationService.getMyDonations();
      if (res.success) {
        setDonations(res.donations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Donation Records &amp; Certificates</h1>
          <p className="text-xs text-slate-400 mt-1">
            Verified clinical donation history and official digital lifesaving certificates.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl">
          <Award className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold text-slate-300">
            Total Verified Donations: <strong className="text-white text-sm">{donations.length}</strong>
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-crimson-500" />
        </div>
      ) : donations.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No verified donations recorded yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Once you accept an emergency request and complete your transfusion at the hospital, your verified digital certificate will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Certificate ID</th>
                  <th className="py-4 px-6">Hospital / Center</th>
                  <th className="py-4 px-6">Blood Group</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">LifePoints</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-850/50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-crimson-400">{d.certificateId}</td>
                    <td className="py-4 px-6 font-bold text-white">{d.hospital?.name}</td>
                    <td className="py-4 px-6">
                      <BloodGroupBadge group={d.bloodGroup} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(d.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-bold text-amber-400 font-mono">+{d.lifePointsAwarded} pts</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedCertificate(d)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] transition inline-flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3 text-crimson-400" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Digital Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 text-sm rounded-xl hover:bg-slate-800 transition"
            >
              ✕
            </button>

            {/* Certificate Canvas */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-700 text-center space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <h3 className="text-xl font-black uppercase tracking-widest text-amber-400">
                  Certificate of Lifesaving Blood Donation
                </h3>
              </div>

              <p className="text-xs text-slate-400">LifeLink Smart Emergency Blood Network</p>

              <div className="py-4 space-y-2">
                <span className="text-xs text-slate-400">This certifies that</span>
                <h2 className="text-2xl font-black text-white border-b border-slate-800 pb-2 max-w-sm mx-auto">
                  {selectedCertificate.donor?.name || 'Rahul Sharma'}
                </h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed pt-2">
                  has generously completed a verified voluntary/emergency blood donation of{' '}
                  <strong className="text-crimson-400">{selectedCertificate.bloodGroup}</strong> blood at{' '}
                  <strong className="text-white">{selectedCertificate.hospital?.name}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Certificate ID</span>
                  <span className="font-mono font-bold text-crimson-400 text-[11px]">
                    {selectedCertificate.certificateId}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Donation Date</span>
                  <span className="font-semibold text-slate-200 text-[11px]">
                    {new Date(selectedCertificate.date).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Hospital Verification</span>
                  <span className="font-bold text-emerald-400 text-[11px] flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Print / Download Button */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-xs flex items-center gap-2 transition"
              >
                <Printer className="w-4 h-4" /> Print / Save Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
