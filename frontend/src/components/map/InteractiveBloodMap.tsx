import React, { useState } from 'react';
import { Hospital, Building2, HeartPulse, UserCheck, ShieldAlert, Navigation, Layers } from 'lucide-react';
import { BloodGroup } from '../../types';
import { BloodGroupBadge } from '../common/BloodGroupBadge';
import { EmergencyBadge } from '../common/EmergencyBadge';

interface MapNode {
  id: string;
  type: 'HOSPITAL' | 'BLOOD_BANK' | 'EMERGENCY' | 'DONOR_CLUSTER';
  name: string;
  distanceKm: number;
  bloodGroup?: BloodGroup;
  units?: number;
  urgency?: 'CRITICAL' | 'URGENT' | 'NORMAL';
  status?: string;
  x: number; // percentage on canvas (0-100)
  y: number; // percentage on canvas (0-100)
}

const SAMPLE_MAP_NODES: MapNode[] = [
  {
    id: 'hosp-1',
    type: 'HOSPITAL',
    name: 'Metropolitan General Hospital',
    distanceKm: 0,
    x: 50,
    y: 50,
    status: 'Level 1 Trauma Center',
  },
  {
    id: 'emg-1',
    type: 'EMERGENCY',
    name: 'Emergency: Emma Watson (OT-3)',
    distanceKm: 1.2,
    bloodGroup: 'O-',
    units: 2,
    urgency: 'CRITICAL',
    x: 48,
    y: 44,
  },
  {
    id: 'hosp-2',
    type: 'HOSPITAL',
    name: 'St. Jude Apex Medical Center',
    distanceKm: 3.8,
    x: 65,
    y: 32,
    status: 'Multi-Specialty Facility',
  },
  {
    id: 'bb-1',
    type: 'BLOOD_BANK',
    name: 'Red Cross Regional Blood Bank',
    distanceKm: 2.5,
    units: 84,
    x: 58,
    y: 62,
    status: 'High Stock (84 units available)',
  },
  {
    id: 'bb-2',
    type: 'BLOOD_BANK',
    name: 'Lifeline Central Blood Reserve',
    distanceKm: 4.1,
    units: 62,
    x: 35,
    y: 42,
    status: 'Cold Storage Verified',
  },
  {
    id: 'donor-1',
    type: 'DONOR_CLUSTER',
    name: 'Verified Compatible Donor (O-)',
    distanceKm: 1.8,
    bloodGroup: 'O-',
    status: 'Available & Ready',
    x: 56,
    y: 46,
  },
  {
    id: 'donor-2',
    type: 'DONOR_CLUSTER',
    name: 'Verified Compatible Donor (O+)',
    distanceKm: 2.3,
    bloodGroup: 'O+',
    status: 'Available & Ready',
    x: 42,
    y: 58,
  },
  {
    id: 'donor-3',
    type: 'DONOR_CLUSTER',
    name: 'Verified Compatible Donor (A+)',
    distanceKm: 3.2,
    bloodGroup: 'A+',
    status: 'Available & Ready',
    x: 68,
    y: 55,
  },
  {
    id: 'donor-4',
    type: 'DONOR_CLUSTER',
    name: 'Verified Compatible Donor (B+)',
    distanceKm: 4.5,
    bloodGroup: 'B+',
    status: 'Available & Ready',
    x: 30,
    y: 68,
  },
  {
    id: 'emg-2',
    type: 'EMERGENCY',
    name: 'Emergency: Robert Langdon',
    distanceKm: 3.8,
    bloodGroup: 'A+',
    units: 3,
    urgency: 'CRITICAL',
    x: 66,
    y: 35,
  },
];

interface Props {
  className?: string;
  selectedBloodGroup?: string;
  highlightEmergencyId?: string;
}

export const InteractiveBloodMap: React.FC<Props> = ({
  className = '',
  selectedBloodGroup,
  highlightEmergencyId,
}) => {
  const [activeRadius, setActiveRadius] = useState<number>(10);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);

  const filteredNodes = SAMPLE_MAP_NODES.filter((node) => {
    if (filterType !== 'ALL' && node.type !== filterType) return false;
    if (selectedBloodGroup && node.bloodGroup && node.bloodGroup !== selectedBloodGroup) return false;
    return true;
  });

  return (
    <div className={`relative bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col ${className}`}>
      {/* Map Header & Controls */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-crimson-400" />
          <h4 className="text-sm font-bold text-white tracking-wide">Live Emergency Geolocation Radar</h4>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LIVE NETWORK
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Layer Filter */}
          <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            {['ALL', 'EMERGENCY', 'HOSPITAL', 'BLOOD_BANK', 'DONOR_CLUSTER'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  filterType === type
                    ? 'bg-crimson-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type === 'ALL'
                  ? 'All'
                  : type === 'EMERGENCY'
                  ? 'Emergencies'
                  : type === 'HOSPITAL'
                  ? 'Hospitals'
                  : type === 'BLOOD_BANK'
                  ? 'Blood Banks'
                  : 'Donors'}
              </button>
            ))}
          </div>

          {/* Radius Selector */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400">Radius:</span>
            {[5, 10, 25, 50].map((r) => (
              <button
                key={r}
                onClick={() => setActiveRadius(r)}
                className={`px-1.5 py-0.5 text-[10px] rounded font-bold transition ${
                  activeRadius === r ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Radar Map Canvas */}
      <div className="relative w-full h-[420px] bg-slate-950 overflow-hidden flex items-center justify-center select-none">
        {/* Radar Rings Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-[120px] h-[120px] rounded-full border border-slate-700/60 flex items-center justify-center">
            <span className="text-[9px] text-slate-500 absolute top-2">5 km</span>
          </div>
          <div className="w-[240px] h-[240px] rounded-full border border-slate-700/50 flex items-center justify-center">
            <span className="text-[9px] text-slate-500 absolute top-2">10 km</span>
          </div>
          <div className="w-[360px] h-[360px] rounded-full border border-slate-800/40 flex items-center justify-center">
            <span className="text-[9px] text-slate-600 absolute top-2">25 km</span>
          </div>
          {/* Grid lines */}
          <div className="absolute w-full h-[1px] bg-slate-800/30"></div>
          <div className="absolute h-full w-[1px] bg-slate-800/30"></div>
          {/* Radar Sweep Effect */}
          <div className="absolute w-[360px] h-[360px] rounded-full animate-radar origin-center bg-gradient-to-tr from-transparent via-crimson-500/5 to-transparent pointer-events-none"></div>
        </div>

        {/* Map Nodes */}
        {filteredNodes.map((node) => {
          const isEmergency = node.type === 'EMERGENCY';
          const isHospital = node.type === 'HOSPITAL';
          const isBloodBank = node.type === 'BLOOD_BANK';
          const isDonor = node.type === 'DONOR_CLUSTER';

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Emergency Beacon */}
              {isEmergency && (
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-crimson-500 opacity-60"></span>
                  <div className="w-7 h-7 rounded-full bg-crimson-600 border-2 border-white flex items-center justify-center text-white shadow-lg shadow-crimson-900/80 group-hover:scale-125 transition">
                    <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Hospital Node */}
              {isHospital && (
                <div className="w-7 h-7 rounded-xl bg-blue-600 border border-blue-300 flex items-center justify-center text-white shadow-lg shadow-blue-900/50 group-hover:scale-125 transition">
                  <Hospital className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Blood Bank Node */}
              {isBloodBank && (
                <div className="w-7 h-7 rounded-xl bg-purple-600 border border-purple-300 flex items-center justify-center text-white shadow-lg shadow-purple-900/50 group-hover:scale-125 transition">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Donor Node */}
              {isDonor && (
                <div className="w-6 h-6 rounded-full bg-emerald-600/90 border border-emerald-300 flex items-center justify-center text-white shadow-md shadow-emerald-900/50 group-hover:scale-125 transition">
                  <UserCheck className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}

        {/* Hovered Node Tooltip Overlay */}
        {hoveredNode && (
          <div
            style={{
              left: `${Math.min(75, Math.max(25, hoveredNode.x))}%`,
              top: `${Math.min(80, Math.max(15, hoveredNode.y - 12))}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-full z-30 p-3 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md min-w-[200px] pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {hoveredNode.type.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400">
                ~{hoveredNode.distanceKm.toFixed(1)} km away
              </span>
            </div>
            <h5 className="font-bold text-xs text-white mb-1">{hoveredNode.name}</h5>
            {hoveredNode.bloodGroup && (
              <div className="flex items-center gap-2 mt-1.5">
                <BloodGroupBadge group={hoveredNode.bloodGroup} size="sm" />
                {hoveredNode.units && (
                  <span className="text-xs font-semibold text-slate-300">
                    {hoveredNode.units} Units Needed
                  </span>
                )}
              </div>
            )}
            {hoveredNode.urgency && (
              <div className="mt-1.5">
                <EmergencyBadge urgency={hoveredNode.urgency} />
              </div>
            )}
            {hoveredNode.status && (
              <p className="text-[11px] text-slate-400 mt-1">{hoveredNode.status}</p>
            )}
          </div>
        )}

        {/* Privacy badge */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800/80 px-2.5 py-1 rounded-lg text-[10px] text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>Donor Privacy: Exact GPS coordinates masked. Distance approximated via Haversine.</span>
        </div>
      </div>
    </div>
  );
};
