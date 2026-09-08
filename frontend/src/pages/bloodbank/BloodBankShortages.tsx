import React, { useState, useEffect } from 'react';
import { aiService } from '../../services/aiService';
import { ShortagePrediction } from '../../types';
import { BloodGroupBadge } from '../../components/common/BloodGroupBadge';
import { Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw, Loader2, Info } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const BloodBankShortages: React.FC = () => {
  const { addToast } = useNotifications();
  const [predictions, setPredictions] = useState<ShortagePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatedAt, setGeneratedAt] = useState<string>('');

  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      const res = await aiService.predictShortage();
      if (res.success) {
        setPredictions(res.predictions);
        setGeneratedAt(res.generatedAt);
      }
    } catch (err: any) {
      addToast('Error', err.message || 'Failed to generate shortage forecast', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">AI Blood Shortage Predictions</h1>
            <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950 border border-amber-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Predictive Model
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-factor demand and inventory depletion forecasts across the regional network.
          </p>
        </div>

        <button
          onClick={fetchPredictions}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5 transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Forecast</span>
        </button>
      </div>

      {/* Decision Support Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong>Decision Support Notice:</strong> LifeLink Shortage Intelligence computes risk scores using current inventory levels, baseline consumption rates, and emergency draw coefficients. Treat this feature as clinical decision support.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-8 h-8 animate-spin text-crimson-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predictions.map((p) => {
            const isCritical = p.riskLevel === 'CRITICAL';
            const isHigh = p.riskLevel === 'HIGH';

            return (
              <div
                key={p.bloodGroup}
                className={`p-6 rounded-3xl border shadow-xl space-y-4 transition ${
                  isCritical
                    ? 'bg-crimson-950/30 border-crimson-700/60'
                    : isHigh
                    ? 'bg-amber-950/20 border-amber-700/50'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <BloodGroupBadge group={p.bloodGroup} size="lg" />
                    <div>
                      <span className="font-extrabold text-sm text-white block">
                        {p.bloodGroup} Supply Forecast
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {p.currentUnits} Units Available in Network
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-lg font-black font-mono block ${
                        isCritical ? 'text-crimson-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {p.riskScore}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Risk Score</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Days of Supply:</span>
                    <span className="font-bold text-white font-mono">{p.daysOfSupplyLeft} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Expected Emergency Demand:</span>
                    <span
                      className={`font-bold ${
                        isCritical ? 'text-crimson-400' : isHigh ? 'text-amber-400' : 'text-slate-300'
                      }`}
                    >
                      {p.expectedDemand}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    AI Recommendation
                  </span>
                  <p className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                    {p.recommendation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
