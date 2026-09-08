import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bloodBankService } from '../../services/bloodBankService';
import { BloodInventoryItem, BloodGroup } from '../../types';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import {
  Package,
  Plus,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const BloodBankDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [inventoryData, setInventoryData] = useState<any>(null);
  const [shortageAlerts, setShortageAlerts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New batch form state
  const [newBatchGroup, setNewBatchGroup] = useState<BloodGroup>('O-');
  const [newBatchUnits, setNewBatchUnits] = useState(5);
  const [isAdding, setIsAdding] = useState(false);

  const fetchInventory = async () => {
    try {
      const [invRes, alertRes] = await Promise.all([
        bloodBankService.getInventory(),
        bloodBankService.getShortageAlerts(),
      ]);
      if (invRes.success) setInventoryData(invRes);
      if (alertRes.success) setShortageAlerts(alertRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const res = await bloodBankService.addInventory({
        bloodGroup: newBatchGroup,
        units: Number(newBatchUnits),
      });
      if (res.success) {
        addToast('Batch Added', res.message, 'success');
        setIsAddModalOpen(false);
        fetchInventory();
      }
    } catch (err: any) {
      addToast('Error', err.message, 'warning');
    } finally {
      setIsAdding(false);
    }
  };

  const allGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  const summary = inventoryData?.summary || {};
  const expiringBatches: BloodInventoryItem[] = shortageAlerts?.expiringBatches || [];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-white">{user?.name}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Cold Storage Capacity: {user?.bloodBankDetails?.coldStorageCapacity || 2500} Units • License: {user?.bloodBankDetails?.licenseNumber || 'BB-VERIFIED'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-crimson-600 to-rose-600 hover:from-crimson-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-xl shadow-crimson-900/50 flex items-center gap-2 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Inventory Batch
        </button>
      </div>

      {/* 8-Grid Blood Group Stock Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
            Available Blood Group Stock
          </h3>
          <span className="text-xs text-slate-400">
            Total Batches: {inventoryData?.totalBatches || 0}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {allGroups.map((bg) => {
            const units = summary[bg] || 0;
            const isCritical = units < 5;
            const isWarning = units >= 5 && units < 10;

            return (
              <div
                key={bg}
                className={`p-4 rounded-3xl border text-center transition space-y-2 relative overflow-hidden ${
                  isCritical
                    ? 'bg-crimson-950/30 border-crimson-700/60 shadow-lg shadow-crimson-950/40'
                    : isWarning
                    ? 'bg-amber-950/20 border-amber-700/50'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex justify-center">
                  <BloodGroupBadge group={bg} size="md" />
                </div>
                <div className="font-mono font-black text-2xl text-white">{units}</div>
                <span
                  className={`text-[10px] font-bold block ${
                    isCritical ? 'text-crimson-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {isCritical ? 'CRITICAL LOW' : isWarning ? 'WATCH' : 'HEALTHY'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expiry Alerts & Batch Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expiring Soon Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white">Batches Expiring Soon (&lt;7 Days)</h3>
          </div>

          {expiringBatches.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No batches expiring in next 7 days.</p>
          ) : (
            <div className="space-y-2.5">
              {expiringBatches.map((item) => (
                <div
                  key={item._id}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <BloodGroupBadge group={item.bloodGroup} size="sm" />
                    <div>
                      <span className="font-bold text-white block font-mono text-[11px]">{item.batchNumber}</span>
                      <span className="text-[10px] text-amber-300 font-semibold">
                        Expires: {new Date(item.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-white text-xs">{item.units} Units</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Batches List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold text-white">Active Blood Inventory Batches</h3>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
            {inventoryData?.batches?.slice(0, 8).map((b: BloodInventoryItem) => (
              <div key={b._id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <BloodGroupBadge group={b.bloodGroup} size="sm" />
                  <div>
                    <span className="font-bold text-white block font-mono">{b.batchNumber}</span>
                    <span className="text-[10px] text-slate-500">
                      Collected: {new Date(b.collectionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-white block">{b.units} Units</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Ready in 4°C Storage</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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

            <form onSubmit={handleAddBatch} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Blood Group</label>
                <select
                  value={newBatchGroup}
                  onChange={(e) => setNewBatchGroup(e.target.value as BloodGroup)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-bold focus:outline-none focus:border-crimson-500 transition"
                >
                  {allGroups.map((bg) => (
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
                  value={newBatchUnits}
                  onChange={(e) => setNewBatchUnits(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-crimson-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="w-full py-3 rounded-xl bg-crimson-600 hover:bg-crimson-500 text-white font-bold text-xs shadow-md shadow-crimson-900/40 flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Batch to Storage'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
