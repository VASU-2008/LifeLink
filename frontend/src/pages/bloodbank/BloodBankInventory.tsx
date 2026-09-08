import React, { useState, useEffect } from 'react';
import { bloodBankService } from '../../services/bloodBankService';
import { BloodInventoryItem, BloodGroup } from '../../types';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { Package, Plus, Trash2, Edit2, ShieldAlert, Loader2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const BloodBankInventory: React.FC = () => {
  const { addToast } = useNotifications();
  const [batches, setBatches] = useState<BloodInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formGroup, setFormGroup] = useState<BloodGroup>('A+');
  const [formUnits, setFormUnits] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBatches = async () => {
    try {
      const res = await bloodBankService.getInventory();
      if (res.success) {
        setBatches(res.batches);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await bloodBankService.addInventory({
        bloodGroup: formGroup,
        units: Number(formUnits),
      });
      if (res.success) {
        addToast('Batch Registered', res.message, 'success');
        setIsAddModalOpen(false);
        fetchBatches();
      }
    } catch (err: any) {
      addToast('Error', err.message, 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove or discard this batch?')) return;
    try {
      await bloodBankService.deleteInventory(id);
      addToast('Batch Removed', 'Inventory record discarded.', 'info');
      fetchBatches();
    } catch (err: any) {
      addToast('Error', err.message, 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Blood Stock &amp; Batch Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time batch tracking, collection dates, and expiry monitoring in cold storage.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-xs shadow-md shadow-crimson-900/40 flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Batch
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-crimson-500" />
        </div>
      ) : batches.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
          No inventory batches recorded. Click "Add New Batch" to add blood stock.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Batch ID</th>
                  <th className="py-4 px-6">Blood Group</th>
                  <th className="py-4 px-6">Units</th>
                  <th className="py-4 px-6">Collected Date</th>
                  <th className="py-4 px-6">Expiry Date</th>
                  <th className="py-4 px-6">Storage Temp</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {batches.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-850/50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-200">{b.batchNumber}</td>
                    <td className="py-4 px-6">
                      <BloodGroupBadge group={b.bloodGroup} size="sm" />
                    </td>
                    <td className="py-4 px-6 font-bold text-white text-sm">{b.units}</td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(b.collectionDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {new Date(b.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">{b.storageTemperature || '4°C'}</td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-crimson-400 hover:bg-crimson-950/40 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Batch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 text-sm rounded-xl hover:bg-slate-800 transition"
            >
              ✕
            </button>

            <h3 className="text-lg font-black text-white mb-4">Add Blood Inventory Batch</h3>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Blood Group</label>
                <select
                  value={formGroup}
                  onChange={(e) => setFormGroup(e.target.value as BloodGroup)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-crimson-500 transition"
                >
                  {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Units (Pints)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formUnits}
                  onChange={(e) => setFormUnits(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-crimson-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-xs shadow-md shadow-crimson-900/40 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Batch'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
