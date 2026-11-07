import React from 'react';
import { Calendar, CheckCircle2, ShieldAlert, Target, Shield, Clock, Zap } from 'lucide-react';

interface OverviewMetricsProps {
  date: string;
  totalFixtures: number;
  analyzedFixtures: number;
  goalPredictions: number;
  zeroZeroPredictions: number;
  insufficientDataCount: number;
  showEitherTeamWinModel?: boolean;
  eitherWinPredictions?: number;
  drawRiskPredictions?: number;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  date,
  totalFixtures,
  analyzedFixtures,
  goalPredictions,
  zeroZeroPredictions,
  insufficientDataCount,
  showEitherTeamWinModel = false,
  eitherWinPredictions = 0,
  drawRiskPredictions = 0,
}) => {
  return (
    <div
      className={`grid grid-cols-2 ${
        showEitherTeamWinModel ? 'md:grid-cols-4 lg:grid-cols-7' : 'md:grid-cols-3 lg:grid-cols-6'
      } gap-3 mb-6`}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Target Date</span>
        </div>
        <div className="text-sm font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
          {date}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Competitive sample window
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          <span>Total Fixtures</span>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
          {totalFixtures}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Available in catalog
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Analyzed & Locked</span>
        </div>
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
          {analyzedFixtures}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {totalFixtures > 0 ? `${Math.round((analyzedFixtures / totalFixtures) * 100)}% coverage` : '0%'}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          <Target className="w-3.5 h-3.5 text-teal-500" />
          <span>GOAL (00–09:59)</span>
        </div>
        <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 font-mono tabular-nums">
          {goalPredictions}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Early strike projected
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          <Shield className="w-3.5 h-3.5 text-indigo-500" />
          <span>0–0 (00–09:59)</span>
        </div>
        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
          {zeroZeroPredictions}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Scoreless opening
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>Low/No Data</span>
        </div>
        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
          {insufficientDataCount}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Sample &lt; 6 matches
        </div>
      </div>

      {showEitherTeamWinModel && (
        <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            <span>Either Win (12)</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
            {eitherWinPredictions}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {drawRiskPredictions} draw risk matches
          </div>
        </div>
      )}
    </div>
  );
};
