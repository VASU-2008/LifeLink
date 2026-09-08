import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { ShieldAlert, AlertTriangle, CheckCircle2, Search, Check, Loader2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const AdminFraud: React.FC = () => {
  const { addToast } = useNotifications();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await adminService.getFraudAlerts();
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleResolve = async (id: string, currentResolved: boolean) => {
    try {
      const res = await adminService.resolveFraudAlert(id, !currentResolved);
      if (res.success) {
        addToast('Alert Updated', 'Fraud log status updated.', 'success');
        fetchLogs();
      }
    } catch (err: any) {
      addToast('Error', err.message, 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Fraud &amp; Abuse Detection Monitor</h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated heuristics flagging suspicious emergency volume spikes, spam, and unverified credentials.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-crimson-500" />
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No active fraud or abuse alerts</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            The platform security engine is actively monitoring all blood requests and user registrations in real-time.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Entity</th>
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Risk Score</th>
                  <th className="py-4 px-6">Reason / Detection Details</th>
                  <th className="py-4 px-6">Flagged Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-850/50 transition">
                    <td className="py-4 px-6 font-bold text-white">
                      <span className="text-[10px] uppercase font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {log.user?.name || log.details?.hospitalName || 'Anonymous Account'}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          log.riskScore >= 75
                            ? 'bg-crimson-950 text-crimson-400 border border-crimson-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {log.riskScore}% RISK
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-300 max-w-md">{log.reason}</td>
                    <td className="py-4 px-6 text-slate-400">
                      {new Date(log.flaggedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-4 px-6">
                      {log.resolved ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                          RESOLVED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-crimson-400 bg-crimson-950 px-2 py-0.5 rounded-full border border-crimson-800">
                          ACTIVE FLAG
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleResolve(log._id, log.resolved)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition ${
                          log.resolved
                            ? 'bg-slate-800 text-slate-400 hover:text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {log.resolved ? 'Re-open' : 'Mark Resolved'}
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
  );
};
