import React from 'react';
import { BloodGroup } from '../../types';

interface Props {
  group: BloodGroup | string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline' | 'glass';
  className?: string;
}

export const BloodGroupBadge: React.FC<Props> = ({
  group,
  size = 'md',
  variant = 'glass',
  className = '',
}) => {
  const isUniversalDonor = group === 'O-';
  const isUniversalRecipient = group === 'AB+';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-bold',
    md: 'text-sm px-2.5 py-1 font-extrabold',
    lg: 'text-base px-3.5 py-1.5 font-black tracking-wider',
  };

  const variantClasses = {
    solid: 'bg-crimson-600 text-white shadow-md shadow-crimson-900/40',
    outline: 'border border-crimson-500 text-crimson-400 bg-crimson-950/20',
    glass: 'bg-crimson-950/40 border border-crimson-700/50 text-crimson-300 backdrop-blur-sm shadow-inner',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      <span>{group}</span>
      {isUniversalDonor && size !== 'sm' && (
        <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950/80 px-1 rounded ml-0.5">
          Universal
        </span>
      )}
      {isUniversalRecipient && size !== 'sm' && (
        <span className="text-[10px] uppercase font-bold text-teal-300 bg-teal-950/80 px-1 rounded ml-0.5">
          Recipient
        </span>
      )}
    </span>
  );
};
