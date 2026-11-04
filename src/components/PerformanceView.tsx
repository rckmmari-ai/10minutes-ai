import React from 'react';
import { PerformanceStats } from '../types/football.ts';
import { Award, CheckCircle2, XCircle, TrendingUp, BarChart2, ShieldCheck, Target, RefreshCw } from 'lucide-react';

interface PerformanceViewProps {
  stats: PerformanceStats | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  stats,
  isLoading,
  onRefresh,
}) => {
  if (isLoading || !stats) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Computing out-of-sample quantitative performance metrics...</span>
      </div>
    );
  }

  const {
    totalPredictions,
    evaluatedPredictions,
    pendingPredictions,
    overallAccuracy,
    goalAccuracy,
    zeroZeroAccuracy,
    brierScore,
    logLoss,
    confusionMatrix,
    accuracyByCompetition,
    accuracyByConfidence,
    calibrationData,
    historyList,
  } = stats;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Historical Performance & Verification Audit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluated strictly against verified official first-10-minute goal event records. Original prediction timestamps are preserved to prevent hindsight bias.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Tracking</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>Overall Accuracy</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {overallAccuracy}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {evaluatedPredictions} verified matches
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <Target className="w-3.5 h-3.5 text-teal-500" />
            <span>GOAL Precision</span>
          </div>
          <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 font-mono tabular-nums">
            {goalAccuracy}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            When GOAL was predicted
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>0–0 Precision</span>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
            {zeroZeroAccuracy}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            When 0–0 was predicted
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span>Brier Score</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {brierScore}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Lower is better (0 = optimal)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            <BarChart2 className="w-3.5 h-3.5 text-purple-500" />
            <span>Log Loss</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {logLoss}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Cross-entropy benchmark
          </div>
        </div>
      </div>

      {/* Row 2: Confusion Matrix + Accuracy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Confusion Matrix Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Confusion Matrix (First 10 Minutes)
          </h3>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300 block">
                True Positive (TP)
              </span>
              <span className="text-2xl font-bold font-mono text-teal-900 dark:text-teal-100 tabular-nums">
                {confusionMatrix.truePositives}
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 block mt-0.5">
                Pred GOAL → Act GOAL
              </span>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 block">
                False Positive (FP)
              </span>
              <span className="text-2xl font-bold font-mono text-rose-900 dark:text-rose-100 tabular-nums">
                {confusionMatrix.falsePositives}
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 block mt-0.5">
                Pred GOAL → Act 0–0
              </span>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 block">
                False Negative (FN)
              </span>
              <span className="text-2xl font-bold font-mono text-rose-900 dark:text-rose-100 tabular-nums">
                {confusionMatrix.falseNegatives}
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 block mt-0.5">
                Pred 0–0 → Act GOAL
              </span>
            </div>

            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block">
                True Negative (TN)
              </span>
              <span className="text-2xl font-bold font-mono text-indigo-900 dark:text-indigo-100 tabular-nums">
                {confusionMatrix.trueNegatives}
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block mt-0.5">
                Pred 0–0 → Act 0–0
              </span>
            </div>
          </div>
        </div>

        {/* Accuracy by Competition */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Accuracy by Competition
          </h3>
          <div className="space-y-2.5">
            {accuracyByCompetition.map((item) => (
              <div key={item.competition} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {item.competition}
                  </span>
                  <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {item.correct}/{item.total} ({item.accuracy}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${item.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accuracy by Confidence */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Accuracy by Confidence Classification
          </h3>
          <div className="space-y-2.5">
            {accuracyByConfidence.map((item) => (
              <div key={item.confidence} className="text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {item.confidence}
                  </span>
                  <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {item.correct}/{item.total} ({item.accuracy}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-full rounded-full"
                    style={{ width: `${item.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Verified Predictions Audit Log
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {historyList.length} post-match evaluations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Fixture</th>
                <th className="py-2.5 px-3">Competition</th>
                <th className="py-2.5 px-3 text-center">Prediction</th>
                <th className="py-2.5 px-2 text-right">P(GOAL)</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3 text-center">Actual Outcome</th>
                <th className="py-2.5 px-3">Goal Minute Events</th>
                <th className="py-2.5 px-3 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {historyList.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono text-slate-500 tabular-nums whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {item.fixture}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {item.competition}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.prediction === 'GOAL'
                          ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
                          : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {item.prediction}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold tabular-nums text-slate-700 dark:text-slate-300">
                    {(item.probabilityGoal * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                    {item.confidence}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.actualOutcome}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {item.actualGoals10m.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.actualGoals10m.map((g, gi) => (
                          <span
                            key={gi}
                            className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400"
                          >
                            ⚽ {g.formattedTime} {g.scorer}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No goals (00–09:59)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {item.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>CORRECT</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-500 font-bold text-xs">
                        <XCircle className="w-4 h-4" />
                        <span>INCORRECT</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
