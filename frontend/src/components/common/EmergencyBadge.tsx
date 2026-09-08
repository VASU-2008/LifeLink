import React from 'react';
import { RequestUrgency } from '../../types';

interface Props {
  urgency: RequestUrgency;
  className?: string;
  showDot?: boolean;
}

export const EmergencyBadge: React.FC<Props> = ({ urgency, className = '', showDot = true }) => {
  if (urgency === 'CRITICAL') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-crimson-500/20 text-crimson-400 border border-crimson-500/40 shadow-sm shadow-crimson-900/50 ${className}`}
      >
        {showDot && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-500"></span>
          </span>
        )}
        CRITICAL
      </span>
    );
  }

  if (urgency === 'URGENT') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className}`}
      >
        {showDot && <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>}
        URGENT
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 ${className}`}
    >
      {showDot && <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>}
      NORMAL
    </span>
  );
};
