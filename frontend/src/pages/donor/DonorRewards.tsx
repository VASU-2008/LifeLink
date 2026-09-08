import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { donorService } from '../../services/donorService';
import { DonorRank } from '../../types';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { Award, Sparkles, Trophy, ShieldCheck, HeartPulse, Zap, Star, Loader2 } from 'lucide-react';

const ALL_BADGES = [
  { id: 'first-lifesaver', name: 'First Lifesaver', icon: 'ShieldCheck', points: 500, desc: 'Registered and completed first blood donation' },
  { id: 'regular-donor', name: 'Regular Lifesaver', icon: 'Award', points: 1500, desc: 'Completed 3 or more verified donations' },
  { id: 'emergency-hero', name: 'Emergency Hero', icon: 'HeartPulse', points: 2500, desc: 'Fulfilled a critical emergency request in <30 min' },
  { id: 'lifelink-champion', name: 'LifeLink Champion', icon: 'Trophy', points: 5000, desc: 'Top tier donor contributing over 10 donations' },
];

export const DonorRewards: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<DonorRank[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await donorService.getLeaderboard();
      if (res.success) {
        setLeaderboard(res.leaderboard);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const currentPoints = user?.lifePoints || 0;
  const userBadges = user?.badges || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">LifePoints &amp; Gamification</h1>
        <p className="text-xs text-slate-400 mt-1">
          Honoring voluntary and emergency lifesavers across the community.
        </p>
      </div>

      {/* Points Summary Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/30 to-crimson-950/40 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> LifePoints Tier: Guardian
          </div>
          <h2 className="text-3xl font-black text-white font-mono">{currentPoints} LifePoints</h2>
          <p className="text-xs text-slate-400 max-w-md">
            Points Earned: Blood Donation (+500), Emergency Donation (+750), Emergency Response (+100).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[160px]">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Community Rank</span>
          <span className="text-2xl font-black text-amber-400 font-mono">#1</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Metropolis Region</span>
        </div>
      </div>

      {/* Badges System */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-white">Lifesaver Badges</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_BADGES.map((b) => {
            const isUnlocked = userBadges.some((ub) => ub.id === b.id) || currentPoints >= b.points;
            return (
              <div
                key={b.id}
                className={`p-5 rounded-3xl border transition shadow-lg space-y-3 ${
                  isUnlocked
                    ? 'bg-slate-900 border-purple-500/40 shadow-purple-950/30'
                    : 'bg-slate-950/50 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                      isUnlocked ? 'bg-purple-950 border border-purple-700/60 text-purple-300' : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    🏆
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isUnlocked ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? 'UNLOCKED' : `LOCKED (${b.points} pts)`}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-white">{b.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Leaderboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-extrabold text-white">Community Donor Leaderboard</h3>
          </div>
          <span className="text-xs text-slate-400">Metropolis Top Donors</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-6 h-6 animate-spin text-crimson-500" />
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-4 px-6">Rank</th>
                    <th className="py-4 px-6">Donor</th>
                    <th className="py-4 px-6">Blood Group</th>
                    <th className="py-4 px-6">City</th>
                    <th className="py-4 px-6">Total Donations</th>
                    <th className="py-4 px-6">Emergency Responses</th>
                    <th className="py-4 px-6 text-right">LifePoints</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaderboard.map((donor) => (
                    <tr
                      key={donor.id}
                      className={`hover:bg-slate-850/50 transition ${
                        donor.name.includes(user?.name || '') ? 'bg-crimson-950/20' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-bold">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-mono font-black ${
                            donor.rank === 1
                              ? 'bg-amber-400 text-slate-950'
                              : donor.rank === 2
                              ? 'bg-slate-300 text-slate-950'
                              : donor.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'text-slate-400'
                          }`}
                        >
                          {donor.rank}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                        {donor.name}
                        {donor.name.includes(user?.name || '') && (
                          <span className="text-[9px] bg-crimson-950 text-crimson-400 px-1.5 py-0.2 rounded border border-crimson-800 font-bold">
                            YOU
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <BloodGroupBadge group={donor.bloodGroup} size="sm" />
                      </td>
                      <td className="py-4 px-6 text-slate-400">{donor.city}</td>
                      <td className="py-4 px-6 font-semibold text-slate-200">{donor.totalDonations}</td>
                      <td className="py-4 px-6 font-semibold text-emerald-400">{donor.emergencyResponses}</td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-amber-400">
                        {donor.lifePoints} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
