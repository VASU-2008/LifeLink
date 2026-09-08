import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { User, UserRole } from '../../types';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { Users, ShieldCheck, Search, Check, X, Loader2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const AdminUsers: React.FC = () => {
  const { addToast } = useNotifications();
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers({
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        search: search || undefined,
      });
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleVerify = async (id: string, newStatus: boolean) => {
    try {
      const res = await adminService.verifyUser(id, newStatus);
      if (res.success) {
        addToast('Verification Updated', res.message, 'success');
        fetchUsers();
      }
    } catch (err: any) {
      addToast('Error', err.message, 'warning');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Platform User Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage donors, patients, hospitals, and blood banks. Verify medical institution credentials.
          </p>
        </div>

        <div className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-crimson-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900/60 rounded-2xl border border-slate-800 w-fit text-xs">
        {['ALL', 'DONOR', 'PATIENT', 'HOSPITAL', 'BLOOD_BANK', 'ADMIN'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-xl font-bold transition ${
              roleFilter === r ? 'bg-crimson-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-crimson-500" />
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Blood Group</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6">City</th>
                  <th className="py-4 px-6">Verification</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id || u._id} className="hover:bg-slate-850/50 transition">
                    <td className="py-4 px-6 font-bold text-white">
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-[10px] uppercase text-crimson-400 bg-crimson-950 px-2 py-0.5 rounded-full border border-crimson-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {u.bloodGroup !== 'UNKNOWN' ? (
                        <BloodGroupBadge group={u.bloodGroup} size="sm" />
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-300">{u.phone}</td>
                    <td className="py-4 px-6 text-slate-400">{u.location?.city || 'Metropolis'}</td>
                    <td className="py-4 px-6">
                      {u.verified ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800 flex items-center gap-1 w-fit">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {u.role === 'HOSPITAL' || u.role === 'BLOOD_BANK' ? (
                        <button
                          onClick={() => handleVerify(u.id || u._id || '', !u.verified)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[10px] transition ${
                            u.verified
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {u.verified ? 'Revoke' : 'Approve & Verify'}
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[10px]">Auto-active</span>
                      )}
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
