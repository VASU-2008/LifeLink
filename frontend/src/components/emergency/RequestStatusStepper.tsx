import React from 'react';
import { RequestStatus } from '../../types';
import { Check, Clock, HeartHandshake, UserCheck, ShieldCheck, Award } from 'lucide-react';

interface Props {
  status: RequestStatus;
  timeToMatchSeconds?: number;
}

const STEPS = [
  { id: 'REQUESTED', label: 'Requested', icon: Clock, desc: 'Emergency broadcast created' },
  { id: 'MATCHED', label: 'Matched', icon: UserCheck, desc: 'Compatible donors notified' },
  { id: 'DONOR_ACCEPTED', label: 'Accepted', icon: HeartHandshake, desc: 'Donor en route to hospital' },
  { id: 'DONOR_ARRIVED', label: 'Arrived', icon: Check, desc: 'Checked in at hospital lab' },
  { id: 'DONATION_VERIFIED', label: 'Verified', icon: ShieldCheck, desc: 'Donation verified by doctors' },
  { id: 'COMPLETED', label: 'Completed', icon: Award, desc: 'LifePoints & Certificate issued' },
];

export const RequestStatusStepper: React.FC<Props> = ({ status, timeToMatchSeconds }) => {
  const currentStepIndex = STEPS.findIndex((s) => s.id === status);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 shadow-inner">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-bold text-white tracking-wide">Emergency Lifecycle Stepper</h4>
          <p className="text-xs text-slate-400">Real-time donor response and hospital verification tracking</p>
        </div>

        {timeToMatchSeconds && (
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Time-To-Match</span>
            <span className="text-xs font-mono font-extrabold text-emerald-400">
              ⚡ {Math.floor(timeToMatchSeconds / 60)}m {timeToMatchSeconds % 60}s
            </span>
          </div>
        )}
      </div>

      <div className="relative flex items-center justify-between">
        {/* Progress Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-800 -z-0">
          <div
            className="h-full bg-gradient-to-r from-crimson-600 to-emerald-500 transition-all duration-500"
            style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Steps */}
        {STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                    : isCurrent
                    ? 'bg-crimson-600 text-white ring-4 ring-crimson-500/30 animate-pulse shadow-lg shadow-crimson-900/60'
                    : 'bg-slate-900 border border-slate-700 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <span
                className={`text-[11px] font-bold mt-2 text-center transition ${
                  isCurrent ? 'text-crimson-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
