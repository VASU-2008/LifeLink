import React, { useState, useEffect } from 'react';
import { bloodBankService } from '../../services/bloodBankService';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { Building2, Phone, MapPin, ShieldCheck, Search, Loader2 } from 'lucide-react';

export const HospitalBloodBanks: React.FC = () => {
  const [bloodBanks, setBloodBanks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await bloodBankService.getBloodBanks();
        if (res.success) {
          setBloodBanks(res.bloodBanks);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = bloodBanks.filter((b) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.location?.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Blood Bank Network &amp; Reserve Inventory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock search across certified regional transfusion centers in Metropolis.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search blood banks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-crimson-500 transition"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-crimson-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
          No blood banks found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((bank) => (
            <div
              key={bank.id}
              className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-800/60 flex items-center justify-center text-purple-300 font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      {bank.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" /> {bank.location?.address}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-full shrink-0">
                  {bank.totalStockUnits} Units in Stock
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Available Blood Groups
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {bank.availableGroups?.map((bg: string) => (
                    <BloodGroupBadge key={bg} group={bg} size="sm" />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {bank.bloodBankDetails?.emergencyContact || bank.phone}
                </span>

                <span className="text-[10px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800">
                  License: {bank.bloodBankDetails?.licenseNumber || 'BB-VERIFIED'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
