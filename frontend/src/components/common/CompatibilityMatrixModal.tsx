import React, { useState } from 'react';
import { BloodGroup } from '../../types';
import { BloodGroupBadge } from './BloodGroupBadge';
import { ShieldCheck, Info, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultGroup?: BloodGroup;
}

const COMPATIBILITY_TABLE: Record<string, string[]> = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

const GIVES_TO_TABLE: Record<string, string[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

export const CompatibilityMatrixModal: React.FC<Props> = ({ isOpen, onClose, defaultGroup = 'O+' }) => {
  const [selectedGroup, setSelectedGroup] = useState<string>(defaultGroup);
  const [mode, setMode] = useState<'RECEIVE' | 'GIVE'>('RECEIVE');

  if (!isOpen) return null;

  const compatibleList = mode === 'RECEIVE'
    ? COMPATIBILITY_TABLE[selectedGroup] || []
    : GIVES_TO_TABLE[selectedGroup] || [];

  const allGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 text-sm rounded-lg hover:bg-slate-800 transition"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-crimson-600/20 border border-crimson-500/40 flex items-center justify-center text-crimson-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Blood Compatibility Engine</h3>
            <p className="text-xs text-slate-400">Medically validated ABO & Rh(D) Antigen Transfusion Rules</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800 mb-5">
          <button
            onClick={() => setMode('RECEIVE')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
              mode === 'RECEIVE'
                ? 'bg-crimson-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Patient Receiving Blood (Who Can Donate to Me?)
          </button>
          <button
            onClick={() => setMode('GIVE')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
              mode === 'GIVE'
                ? 'bg-crimson-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Donor Giving Blood (Who Can I Donate To?)
          </button>
        </div>

        {/* Blood Group Selector */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Select {mode === 'RECEIVE' ? "Patient's" : "Donor's"} Blood Group:
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {allGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`py-2 px-1 rounded-xl text-sm font-bold border transition flex flex-col items-center gap-1 ${
                  selectedGroup === bg
                    ? 'border-crimson-500 bg-crimson-950/60 text-crimson-300 shadow-lg shadow-crimson-950/50'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span>{bg}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Box */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400">
              {mode === 'RECEIVE' ? 'Compatible Donor Groups for' : 'Eligible Recipient Groups from'}{' '}
              <strong className="text-white text-sm">{selectedGroup}</strong>:
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> {compatibleList.length} Compatible Groups
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {compatibleList.map((bg) => (
              <BloodGroupBadge key={bg} group={bg as BloodGroup} size="lg" variant="solid" />
            ))}
          </div>

          <p className="text-xs text-slate-400 mt-4 leading-relaxed border-t border-slate-800/80 pt-3">
            {selectedGroup === 'O-' && mode === 'GIVE' && (
              <span className="text-amber-300 font-semibold">
                🌟 Universal RBC Donor: O- red blood cells lack A, B, and Rh antigens, making them life-saving for all blood groups in acute emergencies.
              </span>
            )}
            {selectedGroup === 'AB+' && mode === 'RECEIVE' && (
              <span className="text-teal-300 font-semibold">
                🌟 Universal RBC Recipient: AB+ patients can safely receive red blood cells from any ABO/Rh blood group.
              </span>
            )}
            {selectedGroup !== 'O-' && selectedGroup !== 'AB+' && (
              <span>
                Standard clinical protocol prioritizes identical group transfusion ({selectedGroup}), but compatible alternatives listed above can be safely utilized when identical stock is depleted.
              </span>
            )}
          </p>
        </div>

        {/* Medical disclaimer */}
        <div className="flex items-start gap-2 text-[11px] text-slate-500 italic">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>Clinical Note: Transfusions require crossmatching and antibody screening by certified medical professionals prior to administration.</span>
        </div>
      </div>
    </div>
  );
};
